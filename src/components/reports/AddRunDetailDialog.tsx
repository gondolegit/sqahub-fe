// src/components/reports/AddRunDetailDialog.tsx
import React, { useMemo, useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';

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

    const handleSubmit = () => {
        if (!testCaseId) return;
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
                    resetForm();
                    setOpen(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" /> Tambah Hasil Test Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Tambah Hasil Test Case</DialogTitle>
                    <DialogDescription>Catat hasil eksekusi satu test case tambahan ke dalam run ini.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>Test Case</Label>
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
                    <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={!testCaseId || addMutation.isPending}>
                        {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddRunDetailDialog;
