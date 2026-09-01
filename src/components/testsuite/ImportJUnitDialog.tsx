// src/components/testsuite/ImportJUnitDialog.tsx
//
// Import laporan JUnit XML dari CI/CD sebagai satu Test Suite Run baru, LANGSUNG difinalisasi di
// backend (laporan JUnit merepresentasikan eksekusi yang sudah selesai) — jadi notifikasi/email
// deploy-readiness yang sama seperti finalize manual ikut terpicu otomatis untuk hasil import ini.
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    UploadCloud, Loader2, FileCode2, CheckCircle2, AlertTriangle, RotateCcw, PlusCircle, Link2,
} from 'lucide-react';

import { useImportJUnitReport } from '@/hooks/useTestSuites';
import { useFeatures } from '@/hooks/useFeatures';
import type { JUnitImportResponse } from '@/types/testSuite';

interface ImportJUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number | undefined;
}

const ImportJUnitDialog: React.FC<ImportJUnitDialogProps> = ({ open, onOpenChange, projectId }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [testSuiteName, setTestSuiteName] = useState('');
    const [defaultFeatureId, setDefaultFeatureId] = useState<string>('');
    const [testStage, setTestStage] = useState('STAGING');
    const [testEnvironment, setTestEnvironment] = useState('CI/CD');
    const [result, setResult] = useState<JUnitImportResponse | null>(null);

    const { data: features } = useFeatures(projectId ?? -1);
    const importMutation = useImportJUnitReport();

    const resetState = () => {
        setSelectedFile(null);
        setTestSuiteName('');
        setDefaultFeatureId('');
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) resetState();
    };

    const handleUpload = () => {
        if (!selectedFile || !projectId || !defaultFeatureId) return;
        importMutation.mutate(
            {
                projectId,
                defaultFeatureId: parseInt(defaultFeatureId),
                testSuiteName: testSuiteName || undefined,
                testStage,
                testEnvironment,
                file: selectedFile,
            },
            { onSuccess: (response) => setResult(response) },
        );
    };

    const canSubmit = !!selectedFile && !!defaultFeatureId && !importMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/60">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <FileCode2 className="h-5 w-5 text-primary" /> {t('testSuites.junitImport.title')}
                    </DialogTitle>
                    <DialogDescription>{t('testSuites.junitImport.description')}</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {!result ? (
                        <>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">
                                    {t('testSuites.junitImport.fileLabel')}
                                </Label>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xml"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                />
                                <p className="text-xs text-muted-foreground">{t('testSuites.junitImport.formatHint')}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">
                                    {t('testSuites.junitImport.defaultFeatureLabel')}
                                </Label>
                                <Select value={defaultFeatureId} onValueChange={setDefaultFeatureId}>
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder={t('testSuites.junitImport.defaultFeaturePlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {features?.map((f) => (
                                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">{t('testSuites.junitImport.defaultFeatureHint')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                                        {t('testSuites.junitImport.stageLabel')}
                                    </Label>
                                    <Input value={testStage} onChange={(e) => setTestStage(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                                        {t('testSuites.junitImport.environmentLabel')}
                                    </Label>
                                    <Input value={testEnvironment} onChange={(e) => setTestEnvironment(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">
                                    {t('testSuites.junitImport.nameLabel')}
                                </Label>
                                <Input
                                    placeholder={t('testSuites.junitImport.namePlaceholder')}
                                    value={testSuiteName}
                                    onChange={(e) => setTestSuiteName(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{result.totalPassed}</div>
                                    <div className="text-emerald-600 dark:text-emerald-400/80">{t('testSuites.junitImport.passed')}</div>
                                </div>
                                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                                    <div className="font-bold text-red-700 dark:text-red-400 text-lg">{result.totalFailed}</div>
                                    <div className="text-red-600 dark:text-red-400/80">{t('testSuites.junitImport.failed')}</div>
                                </div>
                                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-2">
                                    <div className="font-bold text-amber-700 dark:text-amber-400 text-lg">{result.totalError}</div>
                                    <div className="text-amber-600 dark:text-amber-400/80">{t('testSuites.junitImport.error')}</div>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <div className="font-bold text-foreground text-lg">{result.totalSkipped}</div>
                                    <div className="text-muted-foreground">{t('testSuites.junitImport.skipped')}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                {t('testSuites.junitImport.suiteCreated', { name: result.testSuiteName })}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
                                <span className="flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> {t('testSuites.junitImport.matchedCount', { count: result.matchedExistingCount })}</span>
                                <span className="flex items-center gap-1"><PlusCircle className="h-3.5 w-3.5" /> {t('testSuites.junitImport.autoCreatedCount', { count: result.autoCreatedCount })}</span>
                            </div>

                            {result.warnings.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {t('testSuites.junitImport.warningsTitle')}
                                    </p>
                                    <ScrollArea className="h-[140px] rounded-lg border">
                                        <div className="divide-y">
                                            {result.warnings.map((warning, i) => (
                                                <p key={i} className="p-2.5 text-xs text-muted-foreground">{warning}</p>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-0">
                    {!result ? (
                        <>
                            <Button variant="ghost" onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleUpload} disabled={!canSubmit}>
                                {importMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                )}
                                {t('testSuites.junitImport.submit')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={resetState}>
                                <RotateCcw className="h-4 w-4 mr-2" /> {t('testSuites.junitImport.importAnother')}
                            </Button>
                            <Button onClick={() => handleOpenChange(false)}>{t('testSuites.junitImport.done')}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportJUnitDialog;
