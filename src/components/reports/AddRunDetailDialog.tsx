// src/components/reports/AddRunDetailDialog.tsx
//
// Dialog "checklist-style" untuk eksekusi live: dialog TETAP TERBUKA setelah setiap simpan
// (bukan langsung tertutup) sehingga tester bisa lanjut ke test case berikutnya tanpa membuka
// ulang dialog — cocok untuk mencatat hasil satu per satu selagi run masih berjalan.
import React, { useMemo, useState } from 'react';
import { Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useTestCasesByProject } from '@/hooks/useTestCases';
import { useAddRunDetail } from '@/hooks/useTestSuites';
import type { RunDetailStatus } from '@/types/testSuite';

const STATUS_OPTIONS: RunDetailStatus[] = ['PASSED', 'FAILED', 'ERROR', 'SKIPPED'];

interface AddRunDetailDialogProps {
    testSuiteId: number;
    projectId: number;
    existingTestCaseIds: number[];
}

const AddRunDetailDialog: React.FC<AddRunDetailDialogProps> = ({ testSuiteId, projectId, existingTestCaseIds }) => {
    const [open, setOpen] = useState(false);
    const [testCaseId, setTestCaseId] = useState<string>('');
    const [status, setStatus] = useState<RunDetailStatus>('PASSED');
    const [actualResult, setActualResult] = useState('');
    const [remarks, setRemarks] = useState('');
    const [justSavedName, setJustSavedName] = useState<string | null>(null);

    const { data: testCasesPage } = useTestCasesByProject(open ? projectId : undefined);
    const addMutation = useAddRunDetail(testSuiteId);

    const availableTestCases = useMemo(() => {
        const existing = new Set(existingTestCaseIds);
        return (testCasesPage?.content ?? []).filter((tc) => !existing.has(tc.id));
    }, [testCasesPage, existingTestCaseIds]);

    const resetForm = () => {
        setTestCaseId('');
        setStatus('PASSED');
        setActualResult('');
        setRemarks('');
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            resetForm();
            setJustSavedName(null);
        }
    };

    const handleSubmit = () => {
        if (!testCaseId) return;
        const savedTc = availableTestCases.find((tc) => tc.id === Number(testCaseId));
        addMutation.mutate(
            {
                idTestCase: Number(testCaseId),
                status,
                actualResult,
                remarks: remarks || null,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                elapsedTime: 0,
            },
            {
                onSuccess: () => {
                    // Dialog SENGAJA tidak ditutup — reset form untuk test case berikutnya agar
                    // eksekusi bisa lanjut checklist-style tanpa membuka ulang dialog ini.
                    resetForm();
                    setJustSavedName(savedTc?.name ?? null);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" /> Tambah Hasil Test Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Tambah Hasil Test Case</DialogTitle>
                    <DialogDescription>
                        Catat hasil eksekusi satu per satu — dialog tetap terbuka setelah disimpan
                        agar Anda bisa langsung lanjut ke test case berikutnya.
                    </DialogDescription>
                </DialogHeader>

                {justSavedName && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Tersimpan: {justSavedName}
                    </div>
                )}

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label>Test Case</Label>
                            <span className="text-xs text-muted-foreground">{availableTestCases.length} tersisa</span>
                        </div>
                        <Select value={testCaseId} onValueChange={setTestCaseId}>
                            <SelectTrigger><SelectValue placeholder="Pilih test case..." /></SelectTrigger>
                            <SelectContent>
                                {availableTestCases.length === 0 ? (
                                    <div className="p-3 text-xs text-muted-foreground text-center">
                                        Semua test case di proyek ini sudah ada di run.
                                    </div>
                                ) : (
                                    availableTestCases.map((tc) => (
                                        <SelectItem key={tc.id} value={String(tc.id)}>TC-{tc.id}: {tc.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as RunDetailStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Hasil Aktual</Label>
                        <Textarea value={actualResult} onChange={(e) => setActualResult(e.target.value)} className="min-h-[80px]" placeholder="Apa yang terjadi saat eksekusi?" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Catatan (Remarks)</Label>
                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[60px]" placeholder="Opsional" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => handleOpenChange(false)}>Selesai</Button>
                    <Button onClick={handleSubmit} disabled={!testCaseId || addMutation.isPending}>
                        {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Simpan &amp; Lanjut
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddRunDetailDialog;
