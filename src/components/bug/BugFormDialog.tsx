// src/components/bug/BugFormDialog.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useCreateBug, useUpdateBug } from '@/hooks/useBugs';
import { useTestCasesByProject } from '@/hooks/useTestCases';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import type { Bug, BugRequest, UpdateBugParams, BugSeverity } from '@/types/bug';

const SEVERITIES: BugSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const NONE_VALUE = '__none__';

const BugSchema = z.object({
    title: z.string().trim().min(5, 'Judul minimal 5 karakter.'),
    description: z.string().optional(),
    severity: z.enum(SEVERITIES, { error: 'Severity wajib dipilih.' }),
    testCaseId: z.string().optional(),
    assignedToUserId: z.string().optional(),
});

type BugFormData = z.infer<typeof BugSchema>;

interface BugFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: Bug | null;
    projectId: number;
}

const BugFormDialog: React.FC<BugFormDialogProps> = ({ open, onOpenChange, initialData, projectId }) => {
    const { t } = useTranslation();
    const isEditMode = !!initialData;

    const createMutation = useCreateBug();
    const updateMutation = useUpdateBug();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const { data: testCasesPage } = useTestCasesByProject(projectId);
    const { data: members } = useProjectMembers(projectId);

    const form = useForm<BugFormData>({
        resolver: zodResolver(BugSchema),
        defaultValues: { title: '', description: '', severity: undefined, testCaseId: NONE_VALUE, assignedToUserId: NONE_VALUE },
    });

    useEffect(() => {
        if (!open) return;
        if (initialData) {
            form.reset({
                title: initialData.title,
                description: initialData.description || '',
                severity: initialData.severity,
                testCaseId: initialData.testCaseId ? String(initialData.testCaseId) : NONE_VALUE,
                assignedToUserId: initialData.assignedToId ? String(initialData.assignedToId) : NONE_VALUE,
            });
        } else {
            form.reset({ title: '', description: '', severity: undefined, testCaseId: NONE_VALUE, assignedToUserId: NONE_VALUE });
        }
    }, [open, initialData, form]);

    const onSubmit = (data: BugFormData) => {
        const payload: BugRequest = {
            projectId,
            title: data.title,
            description: data.description || null,
            severity: data.severity,
            testCaseId: data.testCaseId && data.testCaseId !== NONE_VALUE ? parseInt(data.testCaseId) : null,
            assignedToUserId: data.assignedToUserId && data.assignedToUserId !== NONE_VALUE ? parseInt(data.assignedToUserId) : null,
        };

        if (isEditMode && initialData) {
            const params: UpdateBugParams = { ...payload, bugId: initialData.id };
            updateMutation.mutate(params, { onSuccess: () => onOpenChange(false) });
        } else {
            createMutation.mutate(payload, { onSuccess: () => { onOpenChange(false); form.reset(); } });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t('bugs.form.editTitle') : t('bugs.form.createTitle')}</DialogTitle>
                    <DialogDescription>{t('bugs.form.description')}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('bugs.form.titleLabel')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('bugs.form.titlePlaceholder')} {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('bugs.form.descriptionLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('bugs.form.descriptionPlaceholder')} {...field} disabled={isPending} className="h-24" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="severity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('bugs.form.severityLabel')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t('bugs.form.severityPlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedToUserId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('bugs.form.assigneeLabel')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t('bugs.form.assigneePlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={NONE_VALUE}>{t('bugs.form.unassigned')}</SelectItem>
                                                {members?.map((m) => (
                                                    <SelectItem key={m.idUser} value={String(m.idUser)}>{m.username}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="testCaseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('bugs.form.testCaseLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('bugs.form.testCasePlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={NONE_VALUE}>{t('bugs.form.noTestCase')}</SelectItem>
                                            {testCasesPage?.content.map((tc) => (
                                                <SelectItem key={tc.id} value={String(tc.id)}>{tc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-[120px]">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? t('common.save') : t('bugs.form.submitCreate')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default BugFormDialog;
