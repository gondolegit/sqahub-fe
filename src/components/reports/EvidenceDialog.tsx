// src/components/reports/EvidenceDialog.tsx
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Paperclip, Download, Loader2, UploadCloud, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useEvidenceByRunDetail, useUploadEvidence, useDownloadEvidence } from '@/hooks/useTestEvidence';
import type { TestEvidence } from '@/types/testEvidence';

// Sesuai default backend (app.evidence.max-file-size-mb) — cek di sini HANYA agar pengguna dapat
// feedback instan tanpa menunggu round-trip network; validasi SESUNGGUHNYA tetap di backend
// (nilai ini bisa saja di-override lewat env var EVIDENCE_MAX_FILE_SIZE_MB di server, jadi
// pengecekan di server selalu jadi sumber kebenaran akhir, ini cuma optimisasi UX).
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface EvidenceDialogProps {
    runDetailId: number | null;
    testCaseName?: string;
    onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes: number): string => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const FileTypeIcon = ({ fileType }: { fileType: string }) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <FileIcon className="h-5 w-5 text-muted-foreground" />;
};

const EvidenceDialog: React.FC<EvidenceDialogProps> = ({ runDetailId, testCaseName, onOpenChange }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: evidenceList, isLoading } = useEvidenceByRunDetail(runDetailId ?? undefined);
    const uploadMutation = useUploadEvidence();
    const downloadMutation = useDownloadEvidence();

    const handleFileSelect = (selected: File | null) => {
        if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
            toast.error(t('testSuites.evidenceDialog.fileTooLargeTitle'), {
                description: t('testSuites.evidenceDialog.fileTooLargeDescription', { maxSize: MAX_FILE_SIZE_MB }),
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            return;
        }
        setSelectedFile(selected);
    };

    const handleUpload = () => {
        if (!runDetailId || !selectedFile) return;
        uploadMutation.mutate(
            { runDetailId, file: selectedFile, description: description || undefined },
            {
                onSuccess: () => {
                    setSelectedFile(null);
                    setDescription('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            }
        );
    };

    return (
        <Dialog open={!!runDetailId} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/60">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Paperclip className="h-5 w-5 text-primary" /> {t('testSuites.evidenceDialog.title')}
                    </DialogTitle>
                    <DialogDescription>{testCaseName || t('testSuites.evidenceDialog.runDetailFallback', { id: runDetailId })}</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <ScrollArea className="h-[220px] rounded-lg border">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> {t('testSuites.evidenceDialog.loading')}
                            </div>
                        ) : !evidenceList || evidenceList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-1">
                                <Paperclip className="h-6 w-6 opacity-30" />
                                {t('testSuites.evidenceDialog.empty')}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {evidenceList.map((ev: TestEvidence) => (
                                    <div key={ev.id} className="flex items-center gap-3 p-3">
                                        <FileTypeIcon fileType={ev.fileType} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{ev.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(ev.fileSize)}{ev.description ? ` • ${ev.description}` : ''}
                                            </p>
                                        </div>
                                        {ev.downloadUrl && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                onClick={() => downloadMutation.mutate(ev)}
                                                disabled={downloadMutation.isPending}
                                                aria-label={t('testSuites.evidenceDialog.downloadAria', { name: ev.fileName })}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="space-y-3 rounded-xl border border-dashed p-4 bg-muted/40">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">{t('testSuites.evidenceDialog.uploadNewLabel')}</Label>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                        />
                        <p className="text-[11px] text-muted-foreground">
                            {t('testSuites.evidenceDialog.uploadHint', { maxSize: MAX_FILE_SIZE_MB })}
                        </p>
                        <Input
                            placeholder={t('testSuites.evidenceDialog.descriptionPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Button
                            className="w-full"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <UploadCloud className="h-4 w-4 mr-2" />
                            )}
                            {t('testSuites.evidenceDialog.uploadButton')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EvidenceDialog;
