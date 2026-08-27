// src/components/reports/EditRunDetailDialog.tsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useUpdateRunDetail } from '@/hooks/useTestSuites';
import type { RunDetail, RunDetailStatus } from '@/types/testSuite';

const STATUS_OPTIONS: RunDetailStatus[] = ['PASSED', 'FAILED', 'ERROR', 'SKIPPED'];

interface EditRunDetailDialogProps {
    detail: RunDetail | null;
    testSuiteId: number;
    onOpenChange: (open: boolean) => void;
}

// Form terisolasi di komponen sendiri, di-mount ulang lewat `key={detail.id}` setiap kali baris
// yang diedit berganti — state awal jadi cukup diinisialisasi dari props sekali (lazy useState),
// tanpa perlu useEffect untuk menyinkronkannya (dan tanpa memicu peringatan set-state-in-effect).
const EditRunDetailForm: React.FC<{
    detail: RunDetail;
    testSuiteId: number;
    onDone: () => void;
}> = ({ detail, testSuiteId, onDone }) => {
    const [status, setStatus] = useState<RunDetailStatus>(detail.status);
    const [actualResult, setActualResult] = useState(detail.actualResult || '');
    const [remarks, setRemarks] = useState(detail.remarks || '');
    const updateMutation = useUpdateRunDetail();

    const handleSave = () => {
        updateMutation.mutate(
            {
                runDetailId: detail.id,
                idTestSuite: testSuiteId,
                payload: {
                    idTestCase: detail.idTestCase,
                    status,
                    actualResult,
                    remarks: remarks || null,
                    startDate: detail.startDate,
                    endDate: detail.endDate,
                    elapsedTime: detail.elapsedTime,
                },
            },
            { onSuccess: onDone }
        );
    };

    return (
        <>
            <div className="space-y-4 py-2">
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
                    <Textarea value={actualResult} onChange={(e) => setActualResult(e.target.value)} className="min-h-[80px]" />
                </div>
                <div className="space-y-1.5">
                    <Label>Catatan (Remarks)</Label>
                    <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[60px]" placeholder="Opsional" />
                </div>
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={onDone}>Batal</Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Simpan
                </Button>
            </DialogFooter>
        </>
    );
};

const EditRunDetailDialog: React.FC<EditRunDetailDialogProps> = ({ detail, testSuiteId, onOpenChange }) => {
    return (
        <Dialog open={!!detail} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Edit Hasil Eksekusi</DialogTitle>
                    <DialogDescription>TC-{detail?.idTestCase}: {detail?.testCaseName}</DialogDescription>
                </DialogHeader>

                {detail && (
                    <EditRunDetailForm
                        key={detail.id}
                        detail={detail}
                        testSuiteId={testSuiteId}
                        onDone={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditRunDetailDialog;
