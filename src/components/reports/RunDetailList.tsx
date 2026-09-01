// src/components/reports/RunDetailList.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
                    <TableRow className="bg-muted">
                        <TableHead className="w-[100px]">{t('testSuites.runDetail.idColumn')}</TableHead>
                        <TableHead className="w-[150px]">{t('testSuites.runDetail.statusColumn')}</TableHead>
                        <TableHead>{t('testSuites.runDetail.nameColumn')}</TableHead>
                        <TableHead>{t('testSuites.runDetail.actualResultColumn')}</TableHead>
                        <TableHead className="w-[200px]">{t('testSuites.runDetail.remarksColumn')}</TableHead>
                        <TableHead className="w-[140px] text-right">{t('testSuites.runDetail.actionsColumn')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runDetails.map((detail) => {
                        const status = getStatusConfig(detail.status);
                        const StatusIcon = status.icon;

                        return (
                            // Menggunakan id (dari RunDetail) sebagai key, atau idTestCase jika id RunDetail tidak unik
                            <TableRow key={detail.id} className={detail.status !== 'PASSED' ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-500/10 dark:hover:bg-red-500/15' : ''}>
                                <TableCell className="font-semibold">TC-{detail.idTestCase}</TableCell>
                                <TableCell>
                                    <Badge className={`font-semibold ${status.badgeClassName}`}>
                                        <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                                    </Badge>
                                </TableCell>
                                {/* 🚨 Menggunakan testCaseName dari RunDetail */}
                                <TableCell className="font-medium">{detail.testCaseName}</TableCell>
                                <TableCell className="text-sm">{detail.actualResult}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-xs whitespace-pre-wrap">{detail.remarks || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-0.5">
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8"
                                            onClick={() => setEvidenceFor(detail)}
                                            title={t('testSuites.runDetail.evidenceTitle')}
                                            aria-label={t('testSuites.runDetail.evidenceAria', { id: detail.idTestCase })}
                                        >
                                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        {canEdit && (
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                onClick={() => setEditing(detail)}
                                                title={t('testSuites.runDetail.editTitle')}
                                                aria-label={t('testSuites.runDetail.editAria', { id: detail.idTestCase })}
                                            >
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                onClick={() => setDeleting(detail)}
                                                title={t('testSuites.runDetail.deleteTitle')}
                                                aria-label={t('testSuites.runDetail.deleteAria', { id: detail.idTestCase })}
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
                        <AlertDialogTitle>{t('testSuites.runDetail.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('testSuites.runDetail.deleteConfirmDescription', { id: deleting?.idTestCase, name: deleting?.testCaseName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : t('testSuites.runDetail.deleteConfirmAction')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RunDetailList;
