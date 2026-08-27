// src/components/reports/RunDetailList.tsx

import React, { useState } from 'react';
import { Paperclip, Pencil, Trash2, Loader2 } from 'lucide-react';
// 🚨 PERBAIKAN IMPOR: Gunakan tipe RunDetail yang sudah diselaraskan
import { type RunDetail } from '@/types/testSuite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getStatusConfig } from '@/lib/status';
import { useAuth } from '@/contexts/AuthContext';
import { useDeleteRunDetail } from '@/hooks/useTestSuites';
import EvidenceDialog from './EvidenceDialog';
import EditRunDetailDialog from './EditRunDetailDialog';

// Sesuai matriks izin backend untuk endpoint /testsuite/detail/**
const RUN_DETAIL_EDIT_ROLES = ['ADMIN', 'TESTER', 'DEVELOPER'] as const;
const RUN_DETAIL_DELETE_ROLES = ['ADMIN', 'TESTER'] as const;

interface RunDetailListProps {
    // 🚨 PERBAIKAN TIPE DATA: Cukup gunakan RunDetail
    runDetails: RunDetail[];
    /** ID Test Suite induk — dibutuhkan agar aksi edit/hapus bisa invalidasi cache dengan benar. */
    testSuiteId: number;
}

const RunDetailList: React.FC<RunDetailListProps> = ({ runDetails, testSuiteId }) => {
    const { hasRole } = useAuth();
    const canEdit = hasRole([...RUN_DETAIL_EDIT_ROLES]);
    const canDelete = hasRole([...RUN_DETAIL_DELETE_ROLES]);

    const [evidenceFor, setEvidenceFor] = useState<RunDetail | null>(null);
    const [editing, setEditing] = useState<RunDetail | null>(null);
    const [deleting, setDeleting] = useState<RunDetail | null>(null);

    const deleteMutation = useDeleteRunDetail();

    const handleConfirmDelete = () => {
        if (!deleting) return;
        deleteMutation.mutate(
            { runDetailId: deleting.id, idTestSuite: testSuiteId },
            { onSettled: () => setDeleting(null) }
        );
    };

    return (
        <div className="overflow-x-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px]">ID TC</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Nama Test Case</TableHead>
                        <TableHead>Hasil Aktual</TableHead>
                        <TableHead className="w-[200px]">Catatan (Remarks)</TableHead>
                        <TableHead className="w-[140px] text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runDetails.map((detail) => {
                        const status = getStatusConfig(detail.status);
                        const StatusIcon = status.icon;

                        return (
                            // Menggunakan id (dari RunDetail) sebagai key, atau idTestCase jika id RunDetail tidak unik
                            <TableRow key={detail.id} className={detail.status !== 'PASSED' ? 'bg-red-50/50 hover:bg-red-50' : ''}>
                                <TableCell className="font-semibold">TC-{detail.idTestCase}</TableCell>
                                <TableCell>
                                    <Badge className={`font-semibold ${status.badgeClassName}`}>
                                        <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                                    </Badge>
                                </TableCell>
                                {/* 🚨 Menggunakan testCaseName dari RunDetail */}
                                <TableCell className="font-medium">{detail.testCaseName}</TableCell>
                                <TableCell className="text-sm">{detail.actualResult}</TableCell>
                                <TableCell className="text-xs text-gray-600 max-w-xs whitespace-pre-wrap">{detail.remarks || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-0.5">
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8"
                                            onClick={() => setEvidenceFor(detail)}
                                            title="Bukti Eksekusi"
                                            aria-label={`Lihat bukti untuk TC-${detail.idTestCase}`}
                                        >
                                            <Paperclip className="h-4 w-4 text-slate-500" />
                                        </Button>
                                        {canEdit && (
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                onClick={() => setEditing(detail)}
                                                title="Edit Hasil"
                                                aria-label={`Edit hasil TC-${detail.idTestCase}`}
                                            >
                                                <Pencil className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                onClick={() => setDeleting(detail)}
                                                title="Hapus Hasil"
                                                aria-label={`Hapus hasil TC-${detail.idTestCase}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <EvidenceDialog
                runDetailId={evidenceFor?.id ?? null}
                testCaseName={evidenceFor ? `TC-${evidenceFor.idTestCase}: ${evidenceFor.testCaseName}` : undefined}
                onOpenChange={(open) => !open && setEvidenceFor(null)}
            />

            <EditRunDetailDialog
                detail={editing}
                testSuiteId={testSuiteId}
                onOpenChange={(open) => !open && setEditing(null)}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Hasil Eksekusi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hasil untuk TC-{deleting?.idTestCase} ({deleting?.testCaseName}) akan dihapus permanen dari run ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Ya, Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RunDetailList;
