// src/components/feature/GenerateAutomationScriptDialog.tsx
//
// Generate skrip automation (Page Object Model) dari file elemen form (Module Name + Scenario
// Name + Field Name + Element Locator + Action + Input Data) — transformasi DETERMINISTIK, bukan
// AI. Hasilnya file .zip (pages/*.ts + tests/*.spec.ts) yang langsung diunduh browser. Hanya
// Playwright (TypeScript) yang didukung saat ini; Robot Framework & Selenium Java masih "Coming
// Soon" — ditampilkan agar transparan tentang roadmap, bukan disembunyikan.
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Download, Loader2, FileSpreadsheet } from 'lucide-react';

import { useGenerateAutomationScript, useDownloadAutomationScriptTemplate } from '@/hooks/useTestCases';

interface GenerateAutomationScriptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
}

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls';

const GenerateAutomationScriptDialog: React.FC<GenerateAutomationScriptDialogProps> = ({ open, onOpenChange, projectId }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const generateMutation = useGenerateAutomationScript(projectId);
    const templateMutation = useDownloadAutomationScriptTemplate();

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleGenerate = () => {
        if (!selectedFile) return;
        generateMutation.mutate(selectedFile, {
            onSuccess: () => handleOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/60">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Code2 className="h-5 w-5 text-primary" /> {t('generateAutomationScript.title')}
                    </DialogTitle>
                    <DialogDescription>{t('generateAutomationScript.description')}</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">
                            {t('generateAutomationScript.frameworkLabel')}
                        </Label>
                        <Select value="playwright-ts" disabled>
                            <SelectTrigger className="w-full bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="playwright-ts">Playwright (TypeScript)</SelectItem>
                                <SelectItem value="robot" disabled>
                                    Robot Framework — {t('generateAutomationScript.comingSoon')}
                                </SelectItem>
                                <SelectItem value="selenium-java" disabled>
                                    Selenium (Java) — {t('generateAutomationScript.comingSoon')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed p-4 bg-muted/40">
                        <div className="text-sm">
                            <p className="font-semibold text-foreground">{t('generateAutomationScript.noFileYet')}</p>
                            <p className="text-xs text-muted-foreground">{t('generateAutomationScript.downloadTemplateHint')}</p>
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
                            {t('generateAutomationScript.downloadTemplate')}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">{t('generateAutomationScript.fileLabel')}</Label>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_EXTENSIONS}
                            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        />
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" /> {t('generateAutomationScript.formatHint')}
                        </p>
                        {selectedFile && <Badge variant="outline" className="w-fit">{selectedFile.name}</Badge>}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={generateMutation.isPending}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleGenerate} disabled={!selectedFile || generateMutation.isPending}>
                        {generateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Code2 className="h-4 w-4 mr-2" />
                        )}
                        {t('generateAutomationScript.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GenerateAutomationScriptDialog;
