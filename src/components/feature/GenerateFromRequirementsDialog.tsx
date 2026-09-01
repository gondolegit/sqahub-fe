// src/components/feature/GenerateFromRequirementsDialog.tsx
//
// Generate Test Case massal dari file requirement (Module Name + Scenario Name + Acceptance
// Criteria bergaya Gherkin Given-When-Then per baris) — transformasi DETERMINISTIK (bukan AI):
// Given -> Pre-Condition, When -> Test Steps, Then -> Expected Result. Module Name yang belum
// ada Feature-nya di proyek dibuat otomatis. Berlaku untuk SATU Project (bukan satu Feature),
// karena satu file requirement wajar mencakup beberapa Module/Feature sekaligus.
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
    Sparkles, Download, Loader2, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Layers,
} from 'lucide-react';

import { useGenerateFromRequirements, useDownloadRequirementTemplate } from '@/hooks/useTestCases';
import type { RequirementImportResponse } from '@/types/testCase';

interface GenerateFromRequirementsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
}

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls';

const GenerateFromRequirementsDialog: React.FC<GenerateFromRequirementsDialogProps> = ({ open, onOpenChange, projectId }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<RequirementImportResponse | null>(null);

    const generateMutation = useGenerateFromRequirements(projectId);
    const templateMutation = useDownloadRequirementTemplate();

    const resetState = () => {
        setSelectedFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) resetState();
    };

    const handleGenerate = () => {
        if (!selectedFile) return;
        generateMutation.mutate(selectedFile, {
            onSuccess: (response) => setResult(response),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/60">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" /> {t('generateFromRequirements.title')}
                    </DialogTitle>
                    <DialogDescription>{t('generateFromRequirements.description')}</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed p-4 bg-muted/40">
                        <div className="text-sm">
                            <p className="font-semibold text-foreground">{t('generateFromRequirements.noFileYet')}</p>
                            <p className="text-xs text-muted-foreground">{t('generateFromRequirements.downloadTemplateHint')}</p>
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
                            {t('generateFromRequirements.downloadTemplate')}
                        </Button>
                    </div>

                    {!result ? (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">{t('generateFromRequirements.fileLabel')}</Label>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_EXTENSIONS}
                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                            />
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" /> {t('generateFromRequirements.formatHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-lg bg-muted p-2">
                                    <div className="font-bold text-foreground text-lg">{result.totalRows}</div>
                                    <div className="text-muted-foreground">{t('generateFromRequirements.totalRows')}</div>
                                </div>
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{result.generatedCount}</div>
                                    <div className="text-emerald-600 dark:text-emerald-400/80">{t('generateFromRequirements.generated')}</div>
                                </div>
                                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                                    <div className="font-bold text-red-700 dark:text-red-400 text-lg">{result.failedCount}</div>
                                    <div className="text-red-600 dark:text-red-400/80">{t('generateFromRequirements.failed')}</div>
                                </div>
                            </div>

                            {result.featuresCreatedCount > 0 && (
                                <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2.5 text-sm text-blue-700 dark:text-blue-400">
                                    <Layers className="h-4 w-4 shrink-0" />
                                    {t('generateFromRequirements.featuresCreated', { count: result.featuresCreatedCount })}
                                </div>
                            )}

                            {result.failedCount === 0 ? (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {t('generateFromRequirements.allSuccess')}
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {t('generateFromRequirements.rowErrorsTitle')}
                                    </p>
                                    <ScrollArea className="h-[180px] rounded-lg border">
                                        <div className="divide-y">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2.5 text-xs">
                                                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-foreground">
                                                            {t('generateFromRequirements.rowLabel', { row: err.rowNumber })}{err.testCaseName ? `: ${err.testCaseName}` : ''}
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
                            <Button variant="ghost" onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleGenerate} disabled={!selectedFile || generateMutation.isPending}>
                                {generateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                {t('generateFromRequirements.submit')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={resetState}>
                                <RotateCcw className="h-4 w-4 mr-2" /> {t('generateFromRequirements.generateAnother')}
                            </Button>
                            <Button onClick={() => handleOpenChange(false)}>{t('generateFromRequirements.done')}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GenerateFromRequirementsDialog;
