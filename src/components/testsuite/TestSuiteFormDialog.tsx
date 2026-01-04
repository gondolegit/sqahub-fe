import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

// Import hook dari file hooks
import { useCreateTestSuiteRun } from '@/hooks/useTestSuites'; 
// Import tipe request langsung dari file types/testSuite.ts
import type { TestSuiteRunRequest } from '@/types/testSuite'; 

// Import hook untuk Test Cases
import { useTestCases } from '@/hooks/useTestCases'; 
import { 
    type TestCase, 
} from '@/hooks/useTestCases';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// --- DEFINISI TIPE (STATUS & LINGKUNGAN) ---
const RUN_STATUSES = ["PASS", "FAIL", "ERROR", "SKIPPED"] as const;
const TEST_STAGES = ["SIT", "UAT", "STAGING", "PRODUCTION"] as const;
const ENVIRONMENT_OPTIONS = ["Local", "Dev", "Staging", "Production"] as const;

// --- DEFINISI SKEMA VALIDASI (ZOD) ---

const RunDetailSchema = z.object({
    idTestCase: z.number().int().positive(),
    status: z.enum(RUN_STATUSES, { 
        error: "Status eksekusi wajib diisi.",
    }),
    actualResult: z.string().min(5, "Hasil aktual minimal 5 karakter."),
    remarks: z.string().optional().nullable(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    elapsedTime: z.number().optional(), 
});

const TestSuiteFormSchema = z.object({
    name: z.string().min(5, "Nama Test Suite minimal 5 karakter."),
    description: z.string().min(10, "Deskripsi minimal 10 karakter."),
    tag: z.string().optional().nullable(),
    testStage: z.enum(TEST_STAGES, { error: "Tahap uji wajib dipilih." }),
    testEnvironment: z.enum(ENVIRONMENT_OPTIONS, { error: "Lingkungan wajib dipilih." }),
    hostname: z.string().min(2, "Hostname wajib diisi."),
    os: z.string().min(2, "OS wajib diisi."),
    version: z.string().min(2, "Versi aplikasi wajib diisi."),
    browser: z.string().min(2, "Browser wajib diisi."),
    
    statusTotalPassed: z.number().int().optional(),
    statusTotalFailed: z.number().int().optional(),
    statusTotalError: z.number().int().optional(),
    statusTotalSkipped: z.number().int().optional(),
    
    startDate: z.string().optional(), 
    endDate: z.string().optional(),
    elapsedTime: z.number().optional(), 

    runDetails: z.array(RunDetailSchema).min(1, "Wajib memilih minimal satu Test Case untuk dieksekusi."),
});

type TestSuiteFormData = z.infer<typeof TestSuiteFormSchema>;

// --- PROPS KOMPONEN PERBAIKAN ---
interface TestSuiteFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // 🚨 PERBAIKAN: Mengganti 'projectId' dengan 'initialProjectId' (sesuai yang dipanggil di TestSuitesPage.tsx)
    initialProjectId: number | undefined;
}

// --- KOMPONEN UTAMA ---
const TestSuiteFormDialog: React.FC<TestSuiteFormDialogProps> = ({ 
    open, 
    onOpenChange, 
    // 🚨 PERBAIKAN: Menerima 'initialProjectId'
    initialProjectId 
}) => {
    // State untuk melacak waktu eksekusi
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTimeDisplay, setElapsedTimeDisplay] = useState(0);

    const createMutation = useCreateTestSuiteRun();
    
    // PERBAIKAN: Menggunakan initialProjectId (atau -1 jika undefined)
    const { data: availableTestCases, isLoading: isLoadingTC } = 
        useTestCases(initialProjectId || -1);

    // Inisialisasi React Hook Form
    const form = useForm<TestSuiteFormData>({
        resolver: zodResolver(TestSuiteFormSchema),
        defaultValues: {
            name: '',
            description: '',
            tag: '',
            testStage: undefined,
            testEnvironment: undefined,
            hostname: '',
            os: '',
            version: '',
            browser: '',
            runDetails: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "runDetails",
    });

    // 🚨 Logika Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null; 
        if (open && startTime) {
            interval = setInterval(() => {
                setElapsedTimeDisplay(Date.now() - startTime);
            }, 1000);
        } else if (!open && interval) {
            clearInterval(interval);
            interval = null;
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open, startTime]);

    // Set default values untuk meta-data sistem saat dialog dibuka
    useEffect(() => {
        if (open) {
            form.reset(); 
            setStartTime(Date.now()); 
            
            form.setValue('hostname', window.location.hostname || 'Local Machine');
            form.setValue('os', navigator.platform || 'Unknown OS');
            // Menyesuaikan logika penemuan browser agar lebih sederhana
            const browserMatch = navigator.userAgent.match(/(chrome|firefox|safari|msie|trident(?=\/))\/?\s*(\d+)/i);
            form.setValue('browser', browserMatch ? browserMatch[0] : 'Unknown Browser');
        }
    }, [open, form]);

    
    // --- HANDLER SELEKSI TEST CASE ---

    const handleToggleTestCase = (tc: TestCase) => { 
        const index = fields.findIndex(detail => detail.idTestCase === tc.id);

        if (index > -1) {
            // TC sudah ada, hapus dari list
            remove(index);
        } else {
            // TC belum ada, tambahkan dengan nilai default eksekusi
            append({
                idTestCase: tc.id,
                // Pastikan status default berada dalam RUN_STATUSES yang valid
                status: RUN_STATUSES.includes('PASS') ? 'PASS' : RUN_STATUSES[0], 
                actualResult: `Execution started for ${tc.name}`,
                remarks: '',
            });
        }
    };
    
    // --- HANDLER SUBMIT ---
    const onSubmit = (data: TestSuiteFormData) => {
        // Tambahkan validasi eksplisit untuk initialProjectId sebelum submit
        if (!initialProjectId) {
            toast.error("Gagal Mencatat Run", { description: "Project ID tidak tersedia." });
            return;
        }

        const endTime = Date.now();
        const startTimestamp = startTime || Date.now();
        const totalElapsedTimeSeconds = (endTime - startTimestamp) / 1000;
        
        // 1. Hitung Status Total
        const counts = data.runDetails.reduce((acc, detail) => {
            if (detail.status === 'PASS') acc.passed++;
            else if (detail.status === 'FAIL') acc.failed++;
            else if (detail.status === 'ERROR') acc.error++;
            else if (detail.status === 'SKIPPED') acc.skipped++;
            return acc;
        }, { passed: 0, failed: 0, error: 0, skipped: 0 });

        // 2. Format Payload Run Details 
        const runDetailsPayload = data.runDetails.map(detail => ({
            ...detail,
            startDate: new Date(startTimestamp).toISOString(),
            endDate: new Date(endTime).toISOString(),
            elapsedTime: 10.0, // Dummy value
            idTestCase: detail.idTestCase,
            status: detail.status,
            actualResult: detail.actualResult,
            remarks: detail.remarks || '',
        }));

        // 3. Buat Payload Final
        const payload: TestSuiteRunRequest = {
            // 🚨 PERBAIKAN: Menggunakan initialProjectId yang sudah dicek
            projectId: initialProjectId, 
            name: data.name,
            description: data.description,
            tag: data.tag || null,
            testStage: data.testStage,
            testEnvironment: data.testEnvironment,
            hostname: data.hostname,
            os: data.os,
            version: data.version,
            browser: data.browser,
            
            startDate: new Date(startTimestamp).toISOString(),
            endDate: new Date(endTime).toISOString(),
            elapsedTime: Math.round(totalElapsedTimeSeconds * 10) / 10, // Dibulatkan ke 1 desimal
            
            statusTotalPassed: counts.passed,
            statusTotalFailed: counts.failed,
            statusTotalError: counts.error,
            statusTotalSkipped: counts.skipped,
            
            runDetails: runDetailsPayload,
        };

        // Mutasi
        createMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Test Suite Run Berhasil", { description: `Eksekusi '${data.name}' telah dicatat.` });
                onOpenChange(false);
            },
            onError: (err: any) => {
                toast.error("Gagal Mencatat Test Suite Run", { description: err.message || "Terjadi kesalahan pada server." });
            }
        });
    };
    
    const totalSelectedTC = fields.length;

    // Fungsi utilitas untuk menemukan Test Case berdasarkan ID
    const findOriginalTestCase = (id: number) => {
        return availableTestCases?.find((tc: TestCase) => tc.id === id); 
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        <Zap className="inline h-6 w-6 mr-2 text-primary" /> Mulai Test Suite Run Baru
                    </DialogTitle>
                    <DialogDescription>
                        Isi detail eksekusi dan catat hasil dari Test Case yang dipilih. (Project ID: **{initialProjectId || 'Belum Dipilih'}**)
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow pr-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* --- Bagian 1: Metadata Suite --- */}
                            <h3 className="text-xl font-semibold border-b pb-2">1. Metadata Run</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nama Suite Run</FormLabel><FormControl><Input placeholder="Contoh: Smoke Test 2025-12-28" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="version" render={({ field }) => (
                                    <FormItem><FormLabel>Versi Aplikasi</FormLabel><FormControl><Input placeholder="v1.0.1" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField name="description" render={({ field }) => (
                                <FormItem><FormLabel>Deskripsi Run</FormLabel><FormControl><Textarea placeholder="Tujuan dan catatan penting untuk eksekusi ini..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="tag" render={({ field }) => (
                                <FormItem><FormLabel>Tag (Opsional)</FormLabel><FormControl><Input placeholder="Smoke, Regression, Hotfix" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="grid grid-cols-4 gap-4">
                                <FormField name="testStage" render={({ field }) => (
                                    <FormItem><FormLabel>Tahap Uji</FormLabel><FormControl>
                                        {/* Menggunakan elemen select standar dan memastikan field.value adalah string */}
                                        <select {...field} className="form-select-style" value={field.value || ''} onChange={field.onChange}>
                                            <option value="">Pilih Tahap</option>
                                            {TEST_STAGES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="testEnvironment" render={({ field }) => (
                                    <FormItem><FormLabel>Lingkungan Uji</FormLabel><FormControl>
                                        <select {...field} className="form-select-style" value={field.value || ''} onChange={field.onChange}>
                                            <option value="">Pilih Lingkungan</option>
                                            {ENVIRONMENT_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="os" render={({ field }) => (
                                    <FormItem><FormLabel>OS (Otomatis)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="browser" render={({ field }) => (
                                    <FormItem><FormLabel>Browser (Otomatis)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            
                            {/* --- Bagian 2: Pemilihan Test Case --- */}
                            <h3 className="text-xl font-semibold border-b pb-2 mt-8 flex justify-between items-center">
                                <span>2. Test Case Selection ({totalSelectedTC})</span>
                                <Badge variant="secondary" className="text-sm">
                                    <Clock className="h-3 w-3 mr-1" /> Waktu Berjalan: {Math.floor(elapsedTimeDisplay / 1000)} detik
                                </Badge>
                            </h3>
                            
                            {isLoadingTC ? (
                                <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /><p>Memuat Test Case...</p></div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border p-3 rounded-md">
                                    {availableTestCases && availableTestCases.length > 0 ? availableTestCases.map((tc: TestCase) => { 
                                        const isSelected = fields.some(detail => detail.idTestCase === tc.id);
                                        return (
                                            <Button 
                                                key={tc.id} 
                                                type="button" 
                                                variant={isSelected ? "default" : "outline"} 
                                                onClick={() => handleToggleTestCase(tc)}
                                                className="justify-start h-auto py-1"
                                            >
                                                {isSelected ? '✅' : '⬜'} TC-{tc.id}: {tc.name} 
                                                <Badge variant="secondary" className="ml-2 text-xs">{tc.type}</Badge>
                                            </Button>
                                        );
                                    }) : (
                                        <p className="col-span-3 text-center text-gray-500">Tidak ada Test Case yang tersedia di Proyek ini.</p>
                                    )}
                                </div>
                            )}

                            {/* --- Bagian 3: Input Hasil Eksekusi --- */}
                            {totalSelectedTC > 0 && (
                                <h3 className="text-xl font-semibold border-b pb-2 mt-8">3. Detail Eksekusi</h3>
                            )}
                            
                            {fields.map((item, index) => {
                                const originalTC = findOriginalTestCase(item.idTestCase);
                                
                                return (
                                    <Card key={item.id} className="border-l-4 border-blue-500 shadow-md">
                                        <CardHeader className="bg-gray-50 p-3 flex-row justify-between items-center">
                                            <CardTitle className="text-md font-bold">TC-{item.idTestCase}: {originalTC?.name || 'Test Case Dihapus'}</CardTitle>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                                Hapus dari Run
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="grid grid-cols-4 gap-4">
                                                {/* Status */}
                                                <FormField 
                                                    control={form.control} 
                                                    name={`runDetails.${index}.status`} 
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-1">
                                                            <FormLabel>Status</FormLabel>
                                                            <FormControl>
                                                                <select {...field} className="form-select-style" onChange={field.onChange} value={field.value}>
                                                                    {RUN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* Actual Result */}
                                                <FormField 
                                                    control={form.control} 
                                                    name={`runDetails.${index}.actualResult`} 
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-3">
                                                            <FormLabel>Actual Result</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Apa yang terjadi saat eksekusi?" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            {/* Remarks */}
                                            <FormField 
                                                control={form.control} 
                                                name={`runDetails.${index}.remarks`} 
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Remarks / Bug ID</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="Catatan tambahan atau ID bug (misal: BUG-456)" 
                                                                {...field} 
                                                                value={field.value === null || field.value === undefined ? '' : field.value} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            
                            {/* --- Submit Button --- */}
                            <div className="pt-4 border-t">
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={createMutation.isPending || totalSelectedTC === 0 || !initialProjectId}
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    {createMutation.isPending ? 'Mencatat Run...' : 'Finalisasi & Catat Test Suite Run'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
                
            </DialogContent>
        </Dialog>
    );
};

export default TestSuiteFormDialog;