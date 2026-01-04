import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Clock, Send, Trash2, ListChecks } from 'lucide-react'; 
import { toast } from 'sonner';

// Import hook dari file hooks
import { useCreateTestSuiteRun } from '@/hooks/useTestSuites'; 
// Import tipe request
import type { TestSuiteRunRequest } from '@/types/testSuite'; 

import { useTestCasesByProject } from '@/hooks/useTestCases'; 
import { type TestCase } from '@/types/testCase'; 

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 

// --- DEFINISI TIPE & SKEMA (TETAP SAMA) ---
const RUN_STATUSES = ["PASS", "FAIL", "ERROR", "SKIPPED"] as const;
const TEST_STAGES = ["SIT", "UAT", "STAGING", "PRODUCTION"] as const;
const ENVIRONMENT_OPTIONS = ["Local", "Dev", "Staging", "Production"] as const;

const RunDetailSchema = z.object({
    idTestCase: z.number().int().positive(),
    status: z.enum(RUN_STATUSES, { 
        error: "Status eksekusi wajib diisi.",
    }),
    actualResult: z.string().min(5, "Hasil aktual minimal 5 karakter."),
    remarks: z.string().optional().nullable(),
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
    runDetails: z.array(RunDetailSchema).min(1, "Wajib memilih minimal satu Test Case untuk dieksekusi."),
});

type TestSuiteFormData = z.infer<typeof TestSuiteFormSchema>;

interface TestSuiteFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialProjectId: number | undefined;
}

const getStatusColor = (status: z.infer<typeof RunDetailSchema>['status']) => {
    switch (status) {
        case 'PASS': return 'border-green-500 bg-green-50 text-green-700';
        case 'FAIL': return 'border-red-500 bg-red-50 text-red-700';
        case 'ERROR': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
        case 'SKIPPED': return 'border-gray-500 bg-gray-50 text-gray-700';
        default: return 'border-gray-200 bg-white text-gray-800';
    }
};

const TestSuiteFormDialog: React.FC<TestSuiteFormDialogProps> = ({ 
    open, 
    onOpenChange, 
    initialProjectId 
}) => {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTimeDisplay, setElapsedTimeDisplay] = useState(0);

    const createMutation = useCreateTestSuiteRun();
    
    const { 
        data: availableTestCases, 
        isLoading: isLoadingTC 
    } = useTestCasesByProject(initialProjectId); 

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

    // Logika Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null; 
        if (open) {
            const currentStartTime = startTime || Date.now();
            if (!startTime) setStartTime(currentStartTime); 
            
            interval = setInterval(() => {
                setElapsedTimeDisplay(Date.now() - currentStartTime);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
            interval = null;
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open, startTime]);

    // Set default values sistem saat dialog dibuka
    useEffect(() => {
        if (open) {
            form.reset({ 
                name: '', 
                description: '', 
                tag: '', 
                testStage: undefined,
                testEnvironment: undefined,
                version: '',
                runDetails: [],
            });
            setStartTime(Date.now()); 
            setElapsedTimeDisplay(0);
            
            // Set nilai sistem
            form.setValue('hostname', window.location.hostname || 'Local Machine');
            form.setValue('os', navigator.platform || 'Unknown OS');
            const userAgent = navigator.userAgent;
            let browser = 'Unknown Browser';
            if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome";
            else if (userAgent.includes("Firefox")) browser = "Firefox";
            else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
            else if (userAgent.includes("Edg")) browser = "Edge";
            form.setValue('browser', browser);
        }
    }, [open, form]);

    const handleToggleTestCase = (tc: TestCase) => { 
        const index = fields.findIndex(detail => detail.idTestCase === tc.id);

        if (index > -1) {
            remove(index);
        } else {
            append({
                idTestCase: tc.id,
                status: 'PASS', 
                actualResult: `Execution result for TC-${tc.id}`, 
                remarks: null,
            });
        }
    };
    
    const onSubmit = (data: TestSuiteFormData) => {
        // ... (Logika Submit tetap sama) ...
        if (!initialProjectId) {
            toast.error("Gagal Mencatat Run", { description: "Project ID tidak tersedia." });
            return;
        }

        const endTime = Date.now();
        const startTimestamp = startTime || Date.now();
        const totalElapsedTimeSeconds = Math.round((endTime - startTimestamp) / 100) / 10; 
        
        const counts = data.runDetails.reduce((acc, detail) => {
            if (detail.status === 'PASS') acc.passed++;
            else if (detail.status === 'FAIL') acc.failed++;
            else if (detail.status === 'ERROR') acc.error++;
            else if (detail.status === 'SKIPPED') acc.skipped++;
            return acc;
        }, { passed: 0, failed: 0, error: 0, skipped: 0 });

        const runDetailsPayload = data.runDetails.map(detail => ({
            idTestCase: detail.idTestCase,
            status: detail.status,
            actualResult: detail.actualResult,
            remarks: detail.remarks || '',
            startDate: new Date(startTimestamp).toISOString(),
            endDate: new Date(endTime).toISOString(),
            elapsedTime: 10.0, 
        }));

        const payload: TestSuiteRunRequest = {
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
            elapsedTime: totalElapsedTimeSeconds, 
            
            statusTotalPassed: counts.passed,
            statusTotalFailed: counts.failed,
            statusTotalError: counts.error,
            statusTotalSkipped: counts.skipped,
            
            runDetails: runDetailsPayload,
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Test Suite Run Berhasil Dicatat!", { 
                    description: `Run '${data.name}' dengan ${counts.passed} Passed dan ${counts.failed} Failed.` 
                });
                onOpenChange(false);
            },
            onError: (err: any) => {
                const errorMessage = err.response?.data?.message || err.message || "Terjadi kesalahan pada server.";
                toast.error("Gagal Mencatat Test Suite Run", { description: errorMessage });
            }
        });
    };
    
    const totalSelectedTC = fields.length;

    const findOriginalTestCase = (id: number) => {
        return availableTestCases?.find((tc: TestCase) => tc.id === id); 
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Set tinggi maksimum pada DialogContent dan gunakan flex-col untuk kontrol layout */}
            <DialogContent className="sm:max-w-6xl max-h-[95vh] flex flex-col p-0"> 
                <DialogHeader className="p-6 pb-2 flex-shrink-0">
                    <DialogTitle>
                        <Zap className="inline h-6 w-6 mr-2 text-primary" /> Mulai Test Suite Run Baru
                    </DialogTitle>
                    <DialogDescription>
                        Isi detail eksekusi dan catat hasil dari Test Case yang dipilih. (Project ID: **{initialProjectId || 'Belum Dipilih'}**)
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
                        
                        {/* Wrapper Grid Utama (Ini yang mengatur pembagian 1/3 dan 2/3) */}
                        <div className="grid lg:grid-cols-3 gap-6 p-6 pt-0 flex-grow overflow-hidden">
                            
                            {/* KOLOM KIRI: Metadata Run - DIBUNGKUS DENGAN SCROLLAREA */}
                            <div className="lg:col-span-1 space-y-4 pr-4 border-r overflow-y-hidden">
                                <ScrollArea className="h-full max-h-[75vh]"> {/* TINGGI DISESUAIKAN */}
                                    <div className="space-y-4 pr-4"> 
                                        <h3 className="text-lg font-semibold border-b pb-2">1. Metadata Run</h3>
                                        
                                        <Badge variant="secondary" className="text-sm w-full justify-center py-2">
                                            <Clock className="h-4 w-4 mr-2" /> Waktu Berjalan: **{Math.floor(elapsedTimeDisplay / 1000)} detik**
                                        </Badge>

                                        <div className="space-y-4">
                                            <FormField name="name" render={({ field }) => (
                                                <FormItem><FormLabel>Nama Suite Run</FormLabel><FormControl><Input placeholder="Contoh: Smoke Test 2025-12-28" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField name="version" render={({ field }) => (
                                                <FormItem><FormLabel>Versi Aplikasi</FormLabel><FormControl><Input placeholder="v1.0.1" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField name="description" render={({ field }) => (
                                                <FormItem><FormLabel>Deskripsi Run</FormLabel><FormControl><Textarea placeholder="Tujuan dan catatan penting..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField name="tag" render={({ field }) => (
                                                <FormItem><FormLabel>Tag (Opsional)</FormLabel><FormControl><Input placeholder="Smoke, Regression, Hotfix" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        
                                        <h4 className="text-md font-semibold pt-2">Detail Lingkungan</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Select Tahap Uji */}
                                            <FormField name="testStage" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tahap Uji</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Pilih Tahap" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {TEST_STAGES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            {/* Select Lingkungan Uji */}
                                            <FormField name="testEnvironment" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lingkungan Uji</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Pilih Lingkungan" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ENVIRONMENT_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            {/* OS (Otomatis) */}
                                            <FormField name="os" render={({ field }) => (
                                                <FormItem><FormLabel>OS (Auto)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            {/* Browser (Otomatis) */}
                                            <FormField name="browser" render={({ field }) => (
                                                <FormItem><FormLabel>Browser (Auto)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                            
                            {/* KOLOM KANAN: Seleksi & Hasil Eksekusi */}
                            <div className="lg:col-span-2 space-y-4 flex flex-col overflow-y-hidden">

                                {/* Sub-Bagian 2: Pemilihan Test Case (Tinggi Tetap) */}
                                <Card className="shadow-lg flex-shrink-0">
                                    <CardHeader className="p-3 bg-blue-50/50">
                                        <CardTitle className="text-lg font-semibold flex items-center">
                                            <ListChecks className="h-5 w-5 mr-2" /> 2. Pilih Test Case untuk Dieksekusi ({totalSelectedTC} Terpilih)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 px-4">
                                        {isLoadingTC ? (
                                            <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p>Memuat Test Case Project...</p></div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2">
                                                {availableTestCases && availableTestCases.length > 0 ? availableTestCases.map((tc: TestCase) => { 
                                                    const isSelected = fields.some(detail => detail.idTestCase === tc.id);
                                                    return (
                                                        <Button 
                                                            key={tc.id} 
                                                            type="button" 
                                                            variant={isSelected ? "default" : "outline"} 
                                                            onClick={() => handleToggleTestCase(tc)}
                                                            className="justify-start h-auto py-1 text-xs truncate"
                                                            title={`${tc.name} (${tc.type})`}
                                                        >
                                                            {isSelected ? '✅' : '⬜'} TC-{tc.id}: <span className="truncate ml-1 font-normal">{tc.name}</span>
                                                        </Button>
                                                    );
                                                }) : (
                                                    <p className="col-span-4 text-center text-gray-500 py-4">
                                                        {initialProjectId ? "Tidak ada Test Case yang tersedia di Project ini." : "Project ID tidak tersedia."}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <FormMessage className="mt-2 text-center">{form.formState.errors.runDetails?.message}</FormMessage>
                                    </CardContent>
                                </Card>

                                {/* Sub-Bagian 3: Input Hasil Eksekusi (Tinggi Fleksibel & DIBUNGKUS SCROLLAREA) */}
                                {totalSelectedTC > 0 && (
                                    <Card className="shadow-lg flex-grow flex flex-col min-h-0">
                                        <CardHeader className="p-3 bg-gray-100 flex-shrink-0">
                                            <CardTitle className="text-lg font-semibold">
                                                3. Detail Eksekusi Hasil ({totalSelectedTC} Kasus)
                                            </CardTitle>
                                        </CardHeader>
                                        
                                        {/* SCROLL AREA UNTUK DETAIL EKSEKUSI */}
                                        <ScrollArea className="flex-grow min-h-0">
                                            <CardContent className="pt-4 space-y-4 pr-2">
                                                {fields.map((item, index) => {
                                                    const originalTC = findOriginalTestCase(item.idTestCase);
                                                    const currentStatus = form.watch(`runDetails.${index}.status`);
                                                    
                                                    return (
                                                        <Card key={item.id} className={`shadow-sm transition-all duration-300 border-l-4 ${getStatusColor(currentStatus)}`}>
                                                            <CardHeader className="p-3 flex flex-row justify-between items-center bg-white/70">
                                                                <CardTitle className="text-sm font-bold truncate">
                                                                    TC-{item.idTestCase}: {originalTC?.name || 'Test Case Dihapus'}
                                                                    <Badge variant="secondary" className="ml-2 text-xs font-normal">{originalTC?.type || 'N/A'}</Badge>
                                                                </CardTitle>
                                                                <Button 
                                                                    type="button" variant="ghost" size="icon" 
                                                                    onClick={() => remove(index)}
                                                                    title="Hapus Test Case dari Run"
                                                                    className="text-red-500 hover:text-red-700 h-6 w-6"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </CardHeader>
                                                            
                                                            {/* DETAIL TEST CASE */}
                                                            {originalTC && (
                                                                <div className="border-t p-4 bg-gray-50/70 space-y-2 text-sm text-gray-700">
                                                                    <p><strong>Prasyarat:</strong> {originalTC.preCondition || <span className="text-gray-400">Tidak ada.</span>}</p>
                                                                    <p className="font-medium">Langkah Eksekusi:</p>
                                                                    <ScrollArea className="h-16 border rounded-md p-2 bg-white text-xs whitespace-pre-wrap">
                                                                        {originalTC.testSteps || <span className="text-gray-400">Tidak ada langkah yang tercatat.</span>}
                                                                    </ScrollArea>
                                                                    <p><strong>Hasil Diharapkan:</strong> {originalTC.expectedResult || <span className="text-gray-400">Tidak ada.</span>}</p>
                                                                </div>
                                                            )}
                                                            
                                                            <CardContent className="pt-4 grid grid-cols-4 gap-4">
                                                                {/* FormFields Status, Result, Remarks */}
                                                                
                                                                <FormField name={`runDetails.${index}.status`} control={form.control} render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Status</FormLabel>
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {RUN_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />

                                                                <FormField name={`runDetails.${index}.actualResult`} render={({ field }) => (
                                                                    <FormItem className="col-span-3">
                                                                        <FormLabel>Hasil Aktual</FormLabel>
                                                                        <FormControl><Input {...field} placeholder="Cth: Login berhasil, navigasi OK" className="h-9" /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                                
                                                                <FormField name={`runDetails.${index}.remarks`} render={({ field }) => (
                                                                    <FormItem className="col-span-4">
                                                                        <FormLabel>Catatan (Opsional)</FormLabel>
                                                                        <FormControl><Textarea {...field} placeholder="Catatan atau bukti error/bug link" rows={1} value={field.value || ''} /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </CardContent>
                                        </ScrollArea>

                                    </Card>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer tetap ada di luar area scroll konten */}
                        <DialogFooter className="flex-shrink-0 bg-white p-4 border-t">
                            <Button 
                                type="submit" 
                                disabled={createMutation.isPending || totalSelectedTC === 0}
                            >
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Send className="mr-2 h-4 w-4" />
                                Catat Run ({totalSelectedTC} TC)
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TestSuiteFormDialog;