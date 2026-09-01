import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

// 🚨 PERBAIKAN: Import tipe dari sumber pusatnya (@/types/testCase)
// Pastikan file @/hooks/useTestCases kamu juga mengimpor dari sini
import type { TestCase, TestCaseRequest, UpdateTestCaseParams } from '@/types/testCase'; 
import { useCreateTestCase, useUpdateTestCase } from '@/hooks/useTestCases'; 

const TC_TYPES = ["FUNCTIONAL", "REGRESSION", "PERFORMANCE", "SECURITY", "USABILITY"] as const; 

const TestCaseSchema = z.object({
    name: z.string().trim().min(5, "Nama Test Case minimal 5 karakter."),
    description: z.string().trim().min(10, "Deskripsi minimal 10 karakter."),
    type: z.enum(TC_TYPES, { error: "Tipe wajib dipilih." }),
    tag: z.string().optional().nullable(),
    preCondition: z.string().trim().min(5, "Pre-Condition wajib diisi."),
    testSteps: z.string().trim().min(10, "Langkah-langkah wajib diisi."),
    testData: z.string().optional().nullable(),
    postCondition: z.string().trim().min(5, "Post-Condition wajib diisi."),
    expectedResult: z.string().trim().min(5, "Expected Result wajib diisi."),
});

type TestCaseFormData = z.infer<typeof TestCaseSchema>;

// 🚨 PERBAIKAN: Perluas interface TestCase yang sudah di-import
export interface TestCaseWithMode extends TestCase {
    mode?: 'view' | 'edit'; 
}

interface TestCaseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: TestCaseWithMode | null;
    idFeature: number;
    idProject: number; 
}

const TestCaseFormDialog: React.FC<TestCaseFormDialogProps> = ({ 
    open, 
    onOpenChange, 
    initialData, 
    idFeature,
    idProject
}) => {
    const { t } = useTranslation();
    const isEditMode = initialData?.mode === 'edit';
    const isViewMode = initialData?.mode === 'view';

    const createMutation = useCreateTestCase();
    const updateMutation = useUpdateTestCase();
    const isPending = createMutation.isPending || updateMutation.isPending;
    const isDisabled = isPending || isViewMode; 

    const form = useForm<TestCaseFormData>({
        resolver: zodResolver(TestCaseSchema),
        defaultValues: {
            name: '',
            description: '',
            type: undefined,
            tag: '',
            preCondition: '',
            testSteps: '',
            testData: '',
            postCondition: '',
            expectedResult: '',
        },
    });
    
    useEffect(() => {
        if (open && initialData) {
            form.reset({
                name: initialData.name || '',
                description: initialData.description || '',
                type: initialData.type as TestCaseFormData['type'],
                tag: initialData.tag || '',
                preCondition: initialData.preCondition || '',
                testSteps: initialData.testSteps || '',
                testData: initialData.testData || '',
                postCondition: initialData.postCondition || '',
                expectedResult: initialData.expectedResult || '',
            });
            form.clearErrors();
        } else if (open && !initialData) {
            form.reset({
                name: '',
                description: '',
                type: undefined,
                tag: '',
                preCondition: '',
                testSteps: '',
                testData: '',
                postCondition: '',
                expectedResult: '',
            });
        }
    }, [open, initialData, form]);

    const onSubmit = (data: TestCaseFormData) => {
        if (isViewMode) return; 

        const payload: TestCaseRequest = {
            ...data,
            idFeature, 
            idProject,
            tag: data.tag || null,
            testData: data.testData || '',
        };

        if (isEditMode && initialData) {
            const updateParams: UpdateTestCaseParams = {
                ...payload,
                testCaseId: initialData.id, 
            };
            updateMutation.mutate(updateParams, { 
                onSuccess: () => onOpenChange(false) 
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset(); 
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isViewMode ? `${t('testCases.form.viewTitlePrefix')}${initialData?.name}` : isEditMode ? t('testCases.form.editTitle') : t('testCases.form.createTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isViewMode ? t('testCases.form.viewDescription') : t('testCases.form.createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.nameLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('testCases.form.namePlaceholder')} {...field} disabled={isDisabled} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.typeLabel')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('testCases.form.typePlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TC_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('testCases.form.descriptionLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('testCases.form.descriptionPlaceholder')} {...field} disabled={isDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="preCondition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.preConditionLabel')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} disabled={isDisabled} className="h-24 resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expectedResult"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.expectedResultLabel')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} disabled={isDisabled} className="h-24 resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="testSteps"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('testCases.form.testStepsLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('testCases.form.testStepsPlaceholder')} {...field} disabled={isDisabled} className="h-32" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="testData"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.testDataLabel')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} disabled={isDisabled} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('testCases.form.tagLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('testCases.form.tagPlaceholder')} {...field} value={field.value || ''} disabled={isDisabled} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="postCondition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('testCases.form.postConditionLabel')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-6">
                            {isViewMode ? (
                                <Button type="button" className="w-full" variant="secondary" onClick={() => onOpenChange(false)}>
                                    {t('testCases.form.closePreview')}
                                </Button>
                            ) : (
                                <>
                                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                                        {t('testCases.form.cancel')}
                                    </Button>
                                    <Button type="submit" disabled={isPending} className="min-w-[140px]">
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEditMode ? t('testCases.form.submitEdit') : t('testCases.form.submitCreate')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TestCaseFormDialog;