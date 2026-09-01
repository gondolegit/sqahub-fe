// src/components/testcase/BulkActionsToolbar.tsx
//
// Toolbar aksi massal untuk Test Case yang dipilih (checkbox) di TestCasesPage: ubah tag,
// pindahkan ke Feature lain, atau hapus sekaligus. Setiap ID diproses independen di backend
// (satu gagal tidak menggagalkan yang lain) — hasil sebagian-berhasil ditampilkan via toast
// oleh hook mutation-nya masing-masing (useBulkUpdateTag/useBulkMoveTestCases/useBulkDeleteTestCases).
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, FolderInput, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBulkDeleteTestCases, useBulkUpdateTag, useBulkMoveTestCases } from '@/hooks/useTestCases';
import type { Feature } from '@/hooks/useFeatures';

interface BulkActionsToolbarProps {
    selectedIds: number[];
    idFeature: number;
    features: Feature[] | undefined;
    onDone: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ selectedIds, idFeature, features, onDone }) => {
    const { t } = useTranslation();
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tagValue, setTagValue] = useState('');
    const [targetFeatureId, setTargetFeatureId] = useState<string>('');

    const bulkTag = useBulkUpdateTag();
    const bulkMove = useBulkMoveTestCases();
    const bulkDelete = useBulkDeleteTestCases();

    const otherFeatures = (features ?? []).filter((f) => f.id !== idFeature);

    const handleSubmitTag = () => {
        bulkTag.mutate(
            { ids: selectedIds, tag: tagValue, idFeature },
            { onSuccess: () => { setTagDialogOpen(false); setTagValue(''); onDone(); } },
        );
    };

    const handleSubmitMove = () => {
        if (!targetFeatureId) return;
        bulkMove.mutate(
            { ids: selectedIds, targetFeatureId: parseInt(targetFeatureId), idFeature },
            { onSuccess: () => { setMoveDialogOpen(false); setTargetFeatureId(''); onDone(); } },
        );
    };

    const handleConfirmDelete = () => {
        bulkDelete.mutate(
            { ids: selectedIds, idFeature },
            { onSuccess: () => { setDeleteDialogOpen(false); onDone(); } },
        );
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
                <span className="text-sm font-medium">
                    {t('testCases.bulk.selectedCount', { count: selectedIds.length })}
                </span>
                <div className="flex flex-wrap gap-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => setTagDialogOpen(true)}>
                        <Tag className="mr-1.5 h-3.5 w-3.5" /> {t('testCases.bulk.setTag')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMoveDialogOpen(true)}>
                        <FolderInput className="mr-1.5 h-3.5 w-3.5" /> {t('testCases.bulk.move')}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t('testCases.bulk.delete')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDone} aria-label={t('testCases.bulk.clearSelection')}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Dialog: Set Tag */}
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{t('testCases.bulk.setTagDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('testCases.bulk.setTagDialogDescription', { count: selectedIds.length })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="bulk-tag-input">{t('testCases.table.tag')}</Label>
                        <Input
                            id="bulk-tag-input"
                            value={tagValue}
                            onChange={(e) => setTagValue(e.target.value)}
                            placeholder={t('testCases.bulk.tagPlaceholder')}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setTagDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSubmitTag} disabled={bulkTag.isPending}>
                            {bulkTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Move to Feature */}
            <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{t('testCases.bulk.moveDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('testCases.bulk.moveDialogDescription', { count: selectedIds.length })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label>{t('testCases.bulk.targetFeatureLabel')}</Label>
                        <Select value={targetFeatureId} onValueChange={setTargetFeatureId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('testCases.bulk.targetFeaturePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {otherFeatures.map((f) => (
                                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setMoveDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSubmitMove} disabled={!targetFeatureId || bulkMove.isPending}>
                            {bulkMove.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('testCases.bulk.move')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm: Bulk Delete */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('testCases.bulk.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('testCases.bulk.deleteConfirmDescription', { count: selectedIds.length })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDelete.isPending}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={bulkDelete.isPending}
                        >
                            {bulkDelete.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('testCases.bulk.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>

    );
};

export default BulkActionsToolbar;
