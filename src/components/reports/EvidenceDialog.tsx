// src/components/reports/EvidenceDialog.tsx
import React, { useRef, useState } from 'react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: evidenceList, isLoading } = useEvidenceByRunDetail(runDetailId ?? undefined);
    const uploadMutation = useUploadEvidence();
    const downloadMutation = useDownloadEvidence();

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
                        <Paperclip className="h-5 w-5 text-primary" /> Bukti Eksekusi
                    </DialogTitle>
                    <DialogDescription>{testCaseName || `Run Detail #${runDetailId}`}</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <ScrollArea className="h-[220px] rounded-lg border">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat bukti...
                            </div>
                        ) : !evidenceList || evidenceList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-1">
                                <Paperclip className="h-6 w-6 opacity-30" />
                                Belum ada bukti yang dilampirkan.
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
                                                aria-label={`Unduh ${ev.fileName}`}
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
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Unggah Bukti Baru</Label>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        />
                        <Input
                            placeholder="Deskripsi (opsional)"
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
                            Unggah
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EvidenceDialog;
