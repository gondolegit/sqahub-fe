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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DEFINISI ARRAY ENUM UNTUK ZOD DAN JSX (Tambahkan ini) ---
const FEATURE_TYPES = ["WEB", "MOBILE", "API"] as const; 
const FEATURE_STATUSES = ["active", "pending", "deprecated"] as const;


// --- 1. DEFINISI SKEMA VALIDASI (Zod) ---
const FeatureSchema = z.object({
    
    name: z.string().min(3, { message: "Nama fitur minimal 3 karakter." }),
    
    // PERBAIKAN: Menggunakan pola 'error' yang bekerja di proyek Anda
    type: z.enum(FEATURE_TYPES, { 
        error: "Tipe fitur wajib dipilih.", // Menggantikan required_error/invalid_type_error
    }),
    
    description: z.string().min(10, { message: "Deskripsi fitur minimal 10 karakter." }),
    
    // PERBAIKAN: Menggunakan pola 'error' yang bekerja di proyek Anda
    status: z.enum(FEATURE_STATUSES, {
        error: "Status fitur wajib dipilih.",
    }),
    
    // Tag diperbolehkan kosong atau null
    tag: z.string().optional().nullable(),
});

type FeatureFormData = z.infer<typeof FeatureSchema>;

// --- 2. DEFINISI PROPS KOMPONEN ---
interface FeatureFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: Feature | null; // Data fitur jika mode EDIT
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
    
    // Hooks Mutation
    const createMutation = useCreateFeature();
    const updateMutation = useUpdateFeature();
    
    const isPending = createMutation.isPending || updateMutation.isPending;

    // Inisialisasi React Hook Form
    const form = useForm<FeatureFormData>({
        resolver: zodResolver(FeatureSchema),
        defaultValues: {
            name: '',
            type: undefined, // undefined untuk Select
            description: '',
            status: 'pending',
            tag: '',
        },
    });
    
    // Reset form saat initialData berubah (untuk mode Edit) atau saat ditutup
    useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                type: initialData?.type as "WEB" | "MOBILE" | "API" | undefined,
                description: initialData?.description || '',
                status: initialData?.status || 'pending',
                tag: initialData?.tag || '',
            });
            form.clearErrors();
        }
    }, [open, initialData, form]);


    // --- 4. HANDLER SUBMIT ---
    const onSubmit = (data: FeatureFormData) => {
        const payload: FeatureRequest = {
            ...data,
            idProject: projectId, // Tambahkan Project ID dari props
            // Pastikan tag adalah string atau null
            tag: data.tag || null,
        };

        if (isEditMode) {
            const updateParams: UpdateFeatureParams = {
                ...payload,
                featureId: initialData!.id, // ID Fitur wajib ada saat Edit
            };
            
            updateMutation.mutate(updateParams, {
                onSuccess: () => {
                    onOpenChange(false); // Tutup dialog setelah sukses
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onOpenChange(false); // Tutup dialog setelah sukses
                    form.reset(); // Reset form setelah Create
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `Edit Fitur: ${initialData?.name}` : "Buat Fitur Baru"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Ubah detail fitur yang ada." : "Masukkan detail untuk fitur baru pada proyek ini."}
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
                                        <Input placeholder="Contoh: Master Data User" {...field} disabled={isPending} />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Tipe Fitur" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="WEB">WEB</SelectItem>
                                                <SelectItem value="MOBILE">MOBILE</SelectItem>
                                                <SelectItem value="API">API</SelectItem>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
                                        <Textarea placeholder="Detail fungsionalitas fitur..." {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tag (Optional) */}
                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag (Opsional)</FormLabel>
                                    <FormControl>
                                        {/* Gunakan field.value || '' untuk mengontrol input jika nilai tag null */}
                                        <Input 
                                            placeholder="Contoh: v2.0, hotfix" 
                                            {...field} 
                                            value={field.value || ''} 
                                            disabled={isPending} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tombol Submit */}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Simpan Perubahan' : 'Buat Fitur'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default FeatureFormDialog;