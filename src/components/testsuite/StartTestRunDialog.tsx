// src/components/testsuite/StartTestRunDialog.tsx
//
// Titik masuk "Live Test Run Execution": berbeda dari TestSuiteFormDialog (yang mengharuskan
// semua hasil test case diisi dulu baru run tersimpan sekaligus di akhir), dialog ini HANYA
// meminta metadata run lalu langsung membuat Test Suite dengan runDetails kosong (endDate
// dikosongkan → status "IN PROGRESS" di backend). User lalu diarahkan ke halaman detail run,
// tempat hasil tiap test case ditambahkan satu per satu secara real-time selagi run berjalan,
// dan run baru dianggap selesai saat difinalisasi secara eksplisit di sana.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Radio } from 'lucide-react';

import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useCreateTestSuiteRun } from '@/hooks/useTestSuites';
import type { TestSuiteRunRequest } from '@/types/testSuite';

const TEST_STAGES = ['SIT', 'UAT', 'STAGING', 'PRODUCTION'] as const;
const ENVIRONMENT_OPTIONS = ['Local', 'Dev', 'Staging', 'Production'] as const;
const EXECUTION_TYPES = ['MANUAL', 'AUTOMATED'] as const;

const StartRunFormSchema = z.object({
    name: z.string().min(5, 'Nama minimal 5 karakter'),
    description: z.string().optional(),
    tag: z.string().optional(),
    testStage: z.enum(TEST_STAGES),
    testEnvironment: z.enum(ENVIRONMENT_OPTIONS),
    executionType: z.enum(EXECUTION_TYPES),
    version: z.string().optional(),
});

type StartRunFormValues = z.infer<typeof StartRunFormSchema>;

interface StartTestRunDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number | undefined;
}

const StartTestRunDialog: React.FC<StartTestRunDialogProps> = ({ open, onOpenChange, projectId }) => {
    const navigate = useNavigate();
    const createMutation = useCreateTestSuiteRun();

    const form = useForm<StartRunFormValues>({
        resolver: zodResolver(StartRunFormSchema),
        defaultValues: {
            name: '', description: '', tag: '', version: 'v1.0.0',
            testStage: 'SIT', testEnvironment: 'Staging', executionType: 'MANUAL',
        },
    });

    useEffect(() => {
        if (open) form.reset();
    }, [open, form]);

    const onSubmit = (values: StartRunFormValues) => {
        if (!projectId) return;
        const payload: TestSuiteRunRequest = {
            ...values,
            projectId,
            hostname: window.location.hostname || 'Localhost',
            os: navigator.platform || 'Unknown OS',
            browser: 'Web',
            startDate: new Date().toISOString(),
            // endDate sengaja tidak dikirim: backend akan menyimpannya sebagai null,
            // yang berarti status run ini "IN PROGRESS" sampai difinalisasi.
            elapsedTime: 0,
            runDetails: [],
        };
        createMutation.mutate(payload, {
            onSuccess: (newSuite) => {
                onOpenChange(false);
                navigate(`/test-suites/detail/${newSuite.id}`);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden outline-none border-none shadow-2xl">
                <div className="bg-slate-900 p-6 text-white">
                    <DialogTitle className="text-2xl font-bold italic tracking-tighter flex items-center gap-2">
                        <Radio className="h-6 w-6 text-emerald-400 animate-pulse" /> MULAI LIVE RUN
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Run akan langsung tersimpan sebagai "IN PROGRESS". Tambahkan hasil per test case
                        secara bertahap di halaman berikutnya, lalu finalisasi kapan saja Anda selesai.
                    </DialogDescription>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-foreground">Nama Run</FormLabel>
                                <FormControl><Input placeholder="Contoh: Regression Sprint 24" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="executionType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-foreground">Tipe</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>{EXECUTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="testStage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-foreground">Stage</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>{TEST_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="testEnvironment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-foreground">Env</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>{ENVIRONMENT_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="version" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-foreground">Versi</FormLabel>
                                    <FormControl><Input placeholder="v1.0.0" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tag" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-foreground">Tag</FormLabel>
                                    <FormControl><Input placeholder="Smoke, Regression..." {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-foreground">Deskripsi</FormLabel>
                                <FormControl><Textarea placeholder="Opsional — tujuan/cakupan run ini..." className="resize-none min-h-[80px]" {...field} /></FormControl>
                            </FormItem>
                        )} />

                        <DialogFooter className="mt-8 gap-2">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Batal</Button>
                            <Button type="submit" disabled={createMutation.isPending || !projectId} className="bg-emerald-600 hover:bg-emerald-700 px-8">
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radio className="mr-2 h-4 w-4" />}
                                Mulai Run
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default StartTestRunDialog;
