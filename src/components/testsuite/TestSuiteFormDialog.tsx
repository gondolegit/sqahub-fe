import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogContent
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Loader2, Zap, Clock, Send, Search, CheckSquare,
    Info, Settings2, Trash2, Tag, Monitor, Layers, BookOpen, ClipboardList, Check, X, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTestSuiteRun } from '@/hooks/useTestSuites';
import { useProjectDetail } from '@/hooks/useProjects';
import { useTestCasesByProject } from '@/hooks/useTestCases';
import { type TestCase } from '@/types/testCase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// --- CONSTANTS ---
const RUN_STATUSES = ["PASS", "FAIL", "ERROR", "SKIPPED"] as const;
const TEST_STAGES = ["SIT", "UAT", "STAGING", "PRODUCTION"] as const;
const ENVIRONMENT_OPTIONS = ["Local", "Dev", "Staging", "Production"] as const;
const EXECUTION_TYPES = ["MANUAL", "AUTOMATED"] as const;

// --- SCHEMA ---
const RunDetailSchema = z.object({
    idTestCase: z.number().int().positive(),
    testCaseName: z.string(),
    status: z.enum(RUN_STATUSES),
    actualResult: z.string().min(1, "Wajib diisi"),
    remarks: z.string().optional().nullable(),
});

const TestSuiteFormSchema = z.object({
    name: z.string().min(5, "Nama minimal 5 karakter"),
    description: z.string().min(5, "Deskripsi minimal 5 karakter"),
    tag: z.string().min(1, "Tag wajib diisi"),
    testStage: z.enum(TEST_STAGES),
    testEnvironment: z.enum(ENVIRONMENT_OPTIONS),
    executionType: z.enum(EXECUTION_TYPES),
    hostname: z.string().min(1),
    os: z.string().min(1),
    version: z.string().min(1),
    browser: z.string().min(1),
    runDetails: z.array(RunDetailSchema).min(1, "Pilih minimal 1 Test Case"),
});

type TestSuiteFormData = z.infer<typeof TestSuiteFormSchema>;

// --- SUB-COMPONENTS ---
const ConfigFields = ({ form }: { form: UseFormReturn<TestSuiteFormData> }) => (
    <div className="space-y-4 pt-2">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Run Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-2">
            <FormField control={form.control} name="executionType" render={({ field }) => (
                <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{EXECUTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="testStage" render={({ field }) => (
                <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Stage</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{TEST_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <FormField control={form.control} name="testEnvironment" render={({ field }) => (
                <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Env</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{ENVIRONMENT_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="version" render={({ field }) => (
                <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Version</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="tag" render={({ field }) => (
            <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Tags</FormLabel><FormControl><Input placeholder="Smoke, Regression..." {...field} /></FormControl></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel className="text-[11px] font-bold uppercase text-slate-500">Description</FormLabel><FormControl><Textarea {...field} className="h-20 resize-none" /></FormControl></FormItem>
        )} />
    </div>
);

const DetailItem = ({ icon, label, value, isPre, className }: { icon: any, label: string, value: any, isPre?: boolean, className?: string }) => (
    <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">{icon} {label}</div>
        <div className={`text-xs text-slate-600 leading-relaxed ${isPre ? 'font-mono bg-slate-50 p-2 rounded whitespace-pre-wrap border border-slate-100' : ''}`}>
            {value || '-'}
        </div>
    </div>
);

// Tambahkan komponen Badge untuk Tag agar lebih rapi
const TagBadge = ({ tags }: { tags: string }) => {
    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {tags.split(',').map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-medium">
                    #{t.trim()}
                </span>
            ))}
        </div>
    );
};

// --- MAIN COMPONENT ---
const TestSuiteFormDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialProjectId: number | undefined;
}> = ({ open, onOpenChange, initialProjectId }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data: projectData, isLoading: isLoadingProject } = useProjectDetail(initialProjectId || 0);
    const { data: availableTestCases, isLoading: isLoadingTC } = useTestCasesByProject(initialProjectId);
    const createMutation = useCreateTestSuiteRun();

    const form = useForm<TestSuiteFormData>({
        resolver: zodResolver(TestSuiteFormSchema),
        defaultValues: {
            name: '', description: '', tag: '', version: 'v1.0.0',
            testStage: 'SIT', testEnvironment: 'Staging', executionType: 'MANUAL',
            runDetails: []
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "runDetails",
    });

    const filteredTC = useMemo(() => {
        if (!availableTestCases) return [];
        return availableTestCases.filter((tc: TestCase) =>
            tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.id.toString().includes(searchTerm)
        );
    }, [availableTestCases, searchTerm]);

    useEffect(() => {
        if (open) {
            setStartTime(Date.now());
            const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
            form.setValue('hostname', window.location.hostname || 'Localhost');
            form.setValue('os', navigator.platform || 'Windows/Linux');
            form.setValue('browser', "Chrome/Web");
            return () => clearInterval(timer);
        } else {
            setElapsedTime(0);
            form.reset();
        }
    }, [open, form]);

    const toggleTC = useCallback((tc: TestCase) => {
        const currentDetails = form.getValues('runDetails');
        const idx = currentDetails.findIndex(f => f.idTestCase === tc.id);
        if (idx > -1) { remove(idx); }
        else {
            append({ idTestCase: tc.id, testCaseName: tc.name, status: 'PASS', actualResult: 'As expected.', remarks: '' });
        }
    }, [append, remove, form]);

    const handleSelectAll = () => {
        if (!filteredTC.length) return;
        const currentIds = new Set(fields.map(f => f.idTestCase));
        const newEntries = filteredTC
            .filter(tc => !currentIds.has(tc.id))
            .map(tc => ({ idTestCase: tc.id, testCaseName: tc.name, status: 'PASS' as const, actualResult: 'As expected.', remarks: '' }));
        append(newEntries);
    };

    const handleClearAll = () => { replace([]); };

    const onSubmit = (data: TestSuiteFormData) => {
        const endTime = Date.now();
        const finalPayload = {
            ...data,
            projectId: initialProjectId!,
            startDate: new Date(startTime!).toISOString(),
            endDate: new Date(endTime).toISOString(),
            elapsedTime: Math.round((endTime - startTime!) / 1000),
            statusTotalPassed: data.runDetails.filter(r => r.status === 'PASS').length,
            statusTotalFailed: data.runDetails.filter(r => r.status === 'FAIL').length,
            statusTotalError: data.runDetails.filter(r => r.status === 'ERROR').length,
            statusTotalSkipped: data.runDetails.filter(r => r.status === 'SKIPPED').length,
            runDetails: data.runDetails.map(r => ({
                ...r,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                elapsedTime: 0,
                remarks: r.remarks === '' ? null : r.remarks
            }))
        };
        createMutation.mutate(finalPayload as any, {
            onSuccess: () => { toast.success("Run saved!"); onOpenChange(false); }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] w-full h-[100dvh] md:h-[95vh] md:max-w-[98vw] p-0 flex flex-col overflow-hidden">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden bg-slate-50/50">

                        {/* HEADER */}
                        <header className="flex items-center justify-between p-4 border-b bg-white shrink-0 z-30 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="lg:hidden">
                                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                        <SheetTrigger asChild>
                                            <Button type="button" variant="outline" size="icon">
                                                <Settings2 className="w-5 h-5" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[300px] p-0">
                                            <SheetHeader className="p-4 border-b">
                                                <SheetTitle>Run Configuration</SheetTitle>
                                            </SheetHeader>
                                            <ScrollArea className="h-[calc(100vh-80px)] p-6">
                                                <ConfigFields form={form} />
                                            </ScrollArea>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                                <div>
                                    <h2 className="font-bold text-base md:text-xl flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Test Runner
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary uppercase">
                                            {isLoadingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : projectData?.name}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-medium">ID: #{initialProjectId}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge className="font-mono text-sm md:text-xl bg-slate-900 text-emerald-400 px-4 py-1.5 border-2 border-slate-800 shadow-inner">
                                <Clock className="w-4 h-4 mr-2 animate-pulse text-emerald-500" /> {new Date(elapsedTime * 1000).toISOString().substr(14, 5)}
                            </Badge>
                        </header>

                        <div className="flex flex-1 overflow-hidden">
                            {/* ASIDE Desktop */}
                            <aside className="hidden lg:block w-[320px] border-r bg-white p-6 overflow-y-auto shrink-0 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-4">Run Configuration</h3>
                                <ConfigFields form={form} />
                            </aside>

                            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                {/* SEARCH & PICKER */}
                                <div className="p-4 bg-white border-b shadow-sm z-10">
                                    <div className="max-w-5xl mx-auto space-y-3">
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <Input placeholder="Search Test Case (Name or ID)..." className="pl-11 h-12 bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" className="h-12 px-4 border-dashed flex-1 md:flex-none" onClick={handleSelectAll} disabled={filteredTC.length === 0}>
                                                    <Check className="w-4 h-4 mr-2" /> Select All ({filteredTC.length})
                                                </Button>
                                                <Button type="button" variant="ghost" className="h-12 px-4 text-slate-500 flex-1 md:flex-none" onClick={handleClearAll} disabled={fields.length === 0}>
                                                    <X className="w-4 h-4 mr-2" /> Clear
                                                </Button>
                                            </div>
                                        </div>
                                        <ScrollArea className="h-[120px] md:h-[160px] rounded-xl border border-slate-100 bg-slate-50/30 p-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {isLoadingTC ? <Loader2 className="animate-spin mx-auto w-6 h-6 text-slate-300" /> :
                                                    filteredTC.map((tc: TestCase) => {
                                                        const isSelected = fields.some(f => f.idTestCase === tc.id);
                                                        return (
                                                            <div key={tc.id} onClick={() => toggleTC(tc)}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                                                <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className={`text-[10px] font-bold ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>TC-{tc.id}</p>
                                                                    <p className="text-xs font-bold truncate mt-0.5">{tc.name}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>

                                {/* EXECUTION LIST */}
                                <ScrollArea className="flex-1">
                                    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24">
                                        {fields.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                                <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
                                                <p className="font-medium">No test cases selected yet.</p>
                                            </div>
                                        )}

                                        {fields.map((field, index) => {
                                            const tcFullData = availableTestCases?.find((t: TestCase) => t.id === field.idTestCase);
                                            const status = form.watch(`runDetails.${index}.status`);

                                            return (
                                                <Card key={field.id} className="border-none shadow-md overflow-hidden bg-white ring-1 ring-slate-200">
                                                    <div className={`h-1.5 w-full ${status === 'PASS' ? 'bg-emerald-500' : status === 'FAIL' ? 'bg-rose-500' : status === 'ERROR' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                                    <div className="p-4 md:p-6 space-y-5">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold">TC-{field.idTestCase}</Badge>
                                                                    <Badge className="bg-blue-50 text-blue-600 border-none uppercase text-[9px]">{tcFullData?.type || 'FUNCTIONAL'}</Badge>
                                                                </div>
                                                                <h4 className="font-bold text-base md:text-lg text-slate-800 tracking-tight truncate">{field.testCaseName}</h4>

                                                                {/* PERBAIKAN: Menampilkan Tag dari Response */}
                                                                {tcFullData?.tag && <TagBadge tags={tcFullData.tag} />}

                                                                <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">{tcFullData?.description}</p>
                                                            </div>

                                                            <div className="flex gap-2 shrink-0">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button type="button" variant="outline" size="sm" className="h-9 gap-2">
                                                                            <Info className="w-4 h-4 text-blue-500" /> Detail
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent
                                                                        className="w-[280px] sm:w-[350px] md:w-[450px] p-0 shadow-2xl border-slate-200 overflow-hidden flex flex-col"
                                                                        side="bottom"
                                                                        align="end"
                                                                        sideOffset={10}
                                                                    >
                                                                        {/* Header Tetap di Atas */}
                                                                        <div className="bg-slate-900 text-white p-3 flex items-center justify-between shrink-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <BookOpen className="w-4 h-4 text-blue-400" />
                                                                                <h5 className="font-bold text-[12px]">Test Case Details : {tcFullData?.name}</h5>
                                                                            </div>
                                                                            <Badge className="bg-slate-800 border-slate-700 text-[9px] h-5">{tcFullData?.type}</Badge>
                                                                        </div>

                                                                        {/* ScrollArea dengan Tinggi yang Dikunci agar Scroll Muncul */}
                                                                        <ScrollArea className="h-[350px] md:h-[450px] w-full bg-white">
                                                                            <div className="p-4 space-y-5">
                                                                                <DetailItem icon={<FileText className="w-3 h-3" />} label="Description" value={tcFullData?.description} />

                                                                                <div className="space-y-1">
                                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                                                        <Tag className="w-3 h-3" /> Tags
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {tcFullData?.tag?.split(',').map((t: string, i: number) => (
                                                                                            <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
                                                                                                {t.trim()}
                                                                                            </Badge>
                                                                                        )) || '-'}
                                                                                    </div>
                                                                                </div>

                                                                                <DetailItem icon={<Layers className="w-3 h-3" />} label="Pre-Condition" value={tcFullData?.preCondition} />
                                                                                <DetailItem icon={<ClipboardList className="w-3 h-3" />} label="Test Steps" value={tcFullData?.testSteps} isPre />

                                                                                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                                                                                    <DetailItem icon={<Zap className="w-3.5 h-3.5 text-amber-500" />} label="Expected Result" value={tcFullData?.expectedResult} className="text-amber-900" />
                                                                                </div>

                                                                                <DetailItem icon={<Monitor className="w-3 h-3" />} label="Test Data" value={tcFullData?.testData} isPre />

                                                                                {tcFullData?.postCondition && (
                                                                                    <DetailItem icon={<CheckSquare className="w-3 h-3" />} label="Post Condition" value={tcFullData.postCondition} />
                                                                                )}
                                                                            </div>
                                                                        </ScrollArea>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <Button type="button" variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500" onClick={() => remove(index)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                            <div className="md:col-span-3">
                                                                <FormLabel className="text-[10px] font-black uppercase text-slate-400">Status</FormLabel>
                                                                <FormField control={form.control} name={`runDetails.${index}.status`} render={({ field }) => (
                                                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="mt-1 font-bold h-11"><SelectValue /></SelectTrigger></FormControl><SelectContent>{RUN_STATUSES.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}</SelectContent></Select>
                                                                )} />
                                                            </div>
                                                            <div className="md:col-span-9">
                                                                <FormLabel className="text-[10px] font-black uppercase text-slate-400">Actual Result / Evidence</FormLabel>
                                                                <FormField control={form.control} name={`runDetails.${index}.actualResult`} render={({ field }) => (
                                                                    <FormControl><Input {...field} className="mt-1 h-11 bg-slate-50 focus:bg-white" placeholder="What happened?" /></FormControl>
                                                                )} />
                                                            </div>
                                                        </div>

                                                        <FormField control={form.control} name={`runDetails.${index}.remarks`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black uppercase text-slate-400">Notes</FormLabel>
                                                                <FormControl><Textarea {...field} value={field.value ?? ''} className="mt-1 min-h-[80px] bg-slate-50/30" placeholder="Bugs found..." /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>

                                {/* FOOTER */}
                                <footer className="p-5 border-t bg-white flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xl z-20">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready to submit</p>
                                        <h4 className="font-black text-xl text-slate-800">{fields.length} <span className="text-slate-400 font-medium">TC Selected</span></h4>
                                    </div>
                                    <div className="flex w-full md:w-auto gap-3">
                                        <Button variant="ghost" type="button" className="h-12 px-8 font-bold flex-1 md:flex-none" onClick={() => onOpenChange(false)}>Discard</Button>
                                        <Button type="submit" className="h-12 px-10 font-black shadow-lg shadow-primary/25 min-w-[200px] flex-1 md:flex-none" disabled={createMutation.isPending || fields.length === 0}>
                                            {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />} SUBMIT RUN
                                        </Button>
                                    </div>
                                </footer>
                            </main>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TestSuiteFormDialog;