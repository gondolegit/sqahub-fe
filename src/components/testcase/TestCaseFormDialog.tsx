import React, { useEffect } from 'react';
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
    useCreateTestCase, 
    useUpdateTestCase, 
    type TestCase, 
    type TestCaseRequest, 
    type UpdateTestCaseParams 
} from '@/hooks/useTestCases'; 

// --- DEFINISI ARRAY ENUM UNTUK ZOD ---
const TC_TYPES = ["FUNCTIONAL", "REGRESSION", "PERFORMANCE", "SECURITY", "USABILITY"] as const; 

// --- DEFINISI SKEMA VALIDASI (ZOD) ---
const TestCaseSchema = z.object({
    name: z.string().min(5, { message: "Nama Test Case minimal 5 karakter." }),
    description: z.string().min(10, { message: "Deskripsi Test Case minimal 10 karakter." }),
    type: z.enum(TC_TYPES, { 
        error: "Tipe Test Case wajib dipilih.",
    }),
    tag: z.string().optional().nullable(),
    preCondition: z.string().min(5, { message: "Pre-Condition wajib diisi." }),
    testSteps: z.string().min(10, { message: "Langkah-langkah pengujian wajib diisi." }),
    testData: z.string().optional().nullable(),
    postCondition: z.string().min(5, { message: "Post-Condition wajib diisi." }),
    expectedResult: z.string().min(5, { message: "Expected Result wajib diisi." }),
});

type TestCaseFormData = z.infer<typeof TestCaseSchema>;

// --- DEFINISI PROPS KOMPONEN (MODIFIKASI) ---
// 🚨 Tambahkan properti 'mode' di initialData
interface TestCaseWithMode extends TestCase {
    mode?: 'view' | 'edit'; 
}
interface TestCaseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: TestCaseWithMode | null; // Menerima data dengan properti mode
    idFeature: number;
    idProject: number; 
}

// --- KOMPONEN UTAMA ---
const TestCaseFormDialog: React.FC<TestCaseFormDialogProps> = ({ 
    open, 
    onOpenChange, 
    initialData, 
    idFeature,
    idProject
}) => {
    // 🚨 PENENTUAN MODE BARU
    const isEditMode = !!initialData && initialData.mode === 'edit';
    const isViewMode = !!initialData && initialData.mode === 'view';

    // Hooks Mutation
    const createMutation = useCreateTestCase();
    const updateMutation = useUpdateTestCase();
    
    const isPending = createMutation.isPending || updateMutation.isPending;

    // 🚨 KONDISI GLOBAL DISABLED: Menggunakan Boolean() untuk memastikan hasilnya boolean murni
    const isDisabled = Boolean(isPending || isViewMode); 

    // Inisialisasi React Hook Form
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
    
    // Reset form saat initialData berubah atau saat ditutup
    useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                description: initialData?.description || '',
                type: initialData?.type as (typeof TC_TYPES[number] | undefined),
                tag: initialData?.tag || '',
                preCondition: initialData?.preCondition || '',
                testSteps: initialData?.testSteps || '',
                testData: initialData?.testData || '',
                postCondition: initialData?.postCondition || '',
                expectedResult: initialData?.expectedResult || '',
            });
            form.clearErrors();
        }
    }, [open, initialData, form]);


    // --- HANDLER SUBMIT ---
    const onSubmit = (data: TestCaseFormData) => {
        // Jika mode adalah View, jangan lakukan submit
        if (isViewMode) return; 

        const payload: TestCaseRequest = {
            ...data,
            idFeature: idFeature, 
            idProject: idProject,
            tag: data.tag || null,
            testData: data.testData || '',
        };

        if (isEditMode) {
            const updateParams: UpdateTestCaseParams = {
                ...payload,
                testCaseId: initialData!.id, 
            };
            
            updateMutation.mutate(updateParams, {
                onSuccess: () => onOpenChange(false),
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

    // Tambahkan komponen Select untuk Tipe TC
    const renderSelectType = () => (
        <select 
            {...form.register("type")} 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled} // Menggunakan isDisabled yang sudah terjamin boolean
        >
            <option value="" disabled selected>Pilih Tipe</option>
            {TC_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
    );

    // Penentuan Judul Dialog
    const dialogTitle = isViewMode 
        ? `Detail Test Case: ${initialData?.name}` 
        : isEditMode 
        ? `Edit Test Case: ${initialData?.name}` 
        : "Buat Test Case Baru";

    const dialogDescription = isViewMode
        ? `Informasi lengkap mengenai Test Case ${initialData?.name}. Mode Baca-Saja.`
        : "Mengelola detail pengujian untuk fitur ini.";


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        {dialogDescription}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Nama Test Case */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Test Case</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Login dengan kredensial valid" {...field} disabled={isDisabled} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Tipe Test Case */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ }) => (
                                    <FormItem>
                                        <FormLabel>Tipe</FormLabel>
                                        <FormControl>
                                            {renderSelectType()}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Deskripsi */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Penjelasan singkat tujuan pengujian..." {...field} disabled={isDisabled} rows={2} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Pre-Condition & Expected Result */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="preCondition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pre-Condition</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Syarat sebelum pengujian..." {...field} disabled={isDisabled} rows={3} />
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
                                        <FormLabel>Expected Result</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Hasil yang diharapkan dari pengujian..." {...field} disabled={isDisabled} rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Test Steps */}
                        <FormField
                            control={form.control}
                            name="testSteps"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Test Steps (Langkah-langkah)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="1. Buka halaman X, 2. Isi data Y, 3. Klik tombol Z..." {...field} disabled={isDisabled} rows={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Test Data & Tag (2 Kolom) */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="testData"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Test Data (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: username: user01, password: pass" {...field} value={field.value || ''} disabled={isDisabled} />
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
                                        <FormLabel>Tag (Opsional, pisahkan dengan koma)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: smoke, regression, positif" {...field} value={field.value || ''} disabled={isDisabled} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Post-Condition */}
                        <FormField
                            control={form.control}
                            name="postCondition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Post-Condition</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Keadaan sistem setelah pengujian selesai..." {...field} disabled={isDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* KONDISIONAL BUTTON SUBMIT/CLOSE */}
                        {!isViewMode ? (
                             <Button type="submit" className="w-full" disabled={isPending}>
                                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                 {isEditMode ? 'Simpan Perubahan Test Case' : 'Buat Test Case'}
                             </Button>
                        ) : (
                            <Button 
                                type="button" 
                                className="w-full bg-blue-500 hover:bg-blue-600" 
                                onClick={() => onOpenChange(false)}
                            >
                                Tutup Detail
                            </Button>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TestCaseFormDialog;