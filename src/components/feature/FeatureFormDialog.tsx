// src/components/feature/FeatureFormDialog.tsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { 
    useCreateFeature, 
    useUpdateFeature, 
    type Feature, 
    type FeatureRequest, 
    type UpdateFeatureParams 
} from '@/hooks/useFeatures';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

// --- DEFINISI ARRAY ENUM ---
const FEATURE_TYPES = ["CREATE", "READ", "UPDATE", "DELETE", "SEARCH", "OTHERS"] as const; 
const FEATURE_STATUSES = ["active", "pending", "deprecated"] as const;

// --- 1. DEFINISI SKEMA VALIDASI (Zod) ---
const FeatureSchema = z.object({
    name: z.string().trim().min(3, { message: "Nama fitur minimal 3 karakter." }),
    
    // Perbaikan: Menggunakan required_error untuk validasi Select yang kosong
    type: z.enum(FEATURE_TYPES, { 
        error: "Tipe fitur wajib dipilih.",
    }),
    
    description: z.string().trim().min(10, { message: "Deskripsi fitur minimal 10 karakter." }),
    
    status: z.enum(FEATURE_STATUSES, {
        error: "Status fitur wajib dipilih.",
    }),
    
    // Memastikan tag dikirim sebagai string atau null ke backend
    tag: z.string().optional().nullable(),
});

type FeatureFormData = z.infer<typeof FeatureSchema>;

// --- 2. DEFINISI PROPS KOMPONEN ---
interface FeatureFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: Feature | null; 
    projectId: number;
}

// --- 3. KOMPONEN UTAMA ---
const FeatureFormDialog: React.FC<FeatureFormDialogProps> = ({ 
    open, 
    onOpenChange, 
    initialData, 
    projectId 
}) => {
    const isEditMode = !!initialData;
    
    // Hooks Mutation dari React Query
    const createMutation = useCreateFeature();
    const updateMutation = useUpdateFeature();
    
    const isPending = createMutation.isPending || updateMutation.isPending;

    // Inisialisasi React Hook Form
    const form = useForm<FeatureFormData>({
        resolver: zodResolver(FeatureSchema),
        defaultValues: {
            name: '',
            type: undefined,
            description: '',
            status: 'pending',
            tag: '',
        },
    });
    
    // Reset form saat dialog dibuka atau initialData berubah
    useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                type: (initialData?.type as FeatureFormData['type']) || undefined,
                description: initialData?.description || '',
                status: (initialData?.status as FeatureFormData['status']) || 'pending',
                tag: initialData?.tag || '',
            });
            form.clearErrors();
        }
    }, [open, initialData, form]);

    // --- 4. HANDLER SUBMIT ---
    const onSubmit = (values: FeatureFormData) => {
        const payload: FeatureRequest = {
            ...values,
            idProject: projectId,
            tag: values.tag || null, // Normalisasi string kosong menjadi null
        };

        if (isEditMode && initialData) {
            const updateParams: UpdateFeatureParams = {
                ...payload,
                featureId: initialData.id,
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? `Edit Fitur: ${initialData?.name}` : "Buat Fitur Baru"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode 
                            ? "Ubah detail fungsionalitas fitur yang sudah ada." 
                            : "Masukkan detail fungsionalitas baru untuk proyek ini."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Nama Fitur */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Fitur</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Contoh: Otentikasi JWT" 
                                            {...field} 
                                            disabled={isPending} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tipe Fitur */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipe</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value} 
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Tipe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {FEATURE_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status Fitur */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value} 
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="deprecated">Deprecated</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <Textarea 
                                            placeholder="Jelaskan alur atau fungsi fitur ini..." 
                                            className="min-h-[100px]"
                                            {...field} 
                                            disabled={isPending} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tag */}
                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Contoh: v1.0, sprint-1" 
                                            {...field} 
                                            value={field.value || ''} 
                                            disabled={isPending} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Simpan Perubahan' : 'Buat Fitur'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default FeatureFormDialog;