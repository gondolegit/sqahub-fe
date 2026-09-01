// src/components/testcase/ImportTestCaseDialog.tsx
//
// Import massal Test Case dari file CSV/Excel ke SATU Feature (konteks halaman ini). Baris yang
// gagal validasi tidak menggagalkan baris lain — backend selalu mengembalikan ringkasan lengkap
// (importedCount/failedCount + daftar error per baris) yang ditampilkan di sini agar pengguna
// tahu persis baris mana yang perlu diperbaiki, tanpa harus menebak dari pesan generik.
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    UploadCloud, Download, Loader2, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, RotateCcw,
} from 'lucide-react';

import { useImportTestCases, useDownloadImportTemplate } from '@/hooks/useTestCases';
import type { TestCaseImportResponse } from '@/types/testCase';

interface ImportTestCaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    idFeature: number;
}

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls';

const ImportTestCaseDialog: React.FC<ImportTestCaseDialogProps> = ({ open, onOpenChange, idFeature }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<TestCaseImportResponse | null>(null);

    const importMutation = useImportTestCases(idFeature);
    const templateMutation = useDownloadImportTemplate();

    const resetState = () => {
        setSelectedFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) resetState();
    };

    const handleUpload = () => {
        if (!selectedFile) return;
        importMutation.mutate(selectedFile, {
            onSuccess: (response) => setResult(response),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/60">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <UploadCloud className="h-5 w-5 text-primary" /> {t('testCases.importDialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('testCases.importDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed p-4 bg-muted/40">
                        <div className="text-sm">
                            <p className="font-semibold text-foreground">{t('testCases.importDialog.noFileYet')}</p>
                            <p className="text-xs text-muted-foreground">{t('testCases.importDialog.downloadTemplateHint')}</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => templateMutation.mutate()}
                            disabled={templateMutation.isPending}
                        >
                            {templateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {t('testCases.importDialog.downloadTemplate')}
                        </Button>
                    </div>

                    {!result ? (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">{t('testCases.importDialog.fileLabel')}</Label>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_EXTENSIONS}
                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                            />
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" /> {t('testCases.importDialog.formatHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-lg bg-muted p-2">
                                    <div className="font-bold text-foreground text-lg">{result.totalRows}</div>
                                    <div className="text-muted-foreground">{t('testCases.importDialog.totalRows')}</div>
                                </div>
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{result.importedCount}</div>
                                    <div className="text-emerald-600 dark:text-emerald-400/80">{t('testCases.importDialog.success')}</div>
                                </div>
                                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                                    <div className="font-bold text-red-700 dark:text-red-400 text-lg">{result.failedCount}</div>
                                    <div className="text-red-600 dark:text-red-400/80">{t('testCases.importDialog.failed')}</div>
                                </div>
                            </div>

                            {result.failedCount === 0 ? (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {t('testCases.importDialog.allSuccess')}
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {t('testCases.importDialog.rowErrorsTitle')}
                                    </p>
                                    <ScrollArea className="h-[180px] rounded-lg border">
                                        <div className="divide-y">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2.5 text-xs">
                                                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-foreground">
                                                            {t('testCases.importDialog.rowLabel', { row: err.rowNumber })}{err.testCaseName ? `: ${err.testCaseName}` : ''}
                                                        </p>
                                                        <p className="text-muted-foreground">{err.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            <Badge variant="outline" className="w-fit">
                                {selectedFile?.name}
                            </Badge>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-0">
                    {!result ? (
                        <>
                            <Button variant="ghost" onClick={() => handleOpenChange(false)}>{t('testCases.importDialog.cancel')}</Button>
                            <Button onClick={handleUpload} disabled={!selectedFile || importMutation.isPending}>
                                {importMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                )}
                                {t('testCases.importDialog.submit')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={resetState}>
                                <RotateCcw className="h-4 w-4 mr-2" /> {t('testCases.importDialog.importAnother')}
                            </Button>
                            <Button onClick={() => handleOpenChange(false)}>{t('testCases.importDialog.done')}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportTestCaseDialog;
