// src/components/project/ProjectFormDialog.tsx (FULL REVISI)
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

// IMPOR NILAI (Fungsi/Hook)
import { 
    useCreateProject, 
    useUpdateProject, 
} from '@/hooks/useProjects'; 

// IMPOR TIPE DARI SUMBER DEFINITIF: '@/types/index.ts'
import type { 
    Project,
    ProjectType, 
    ProjectStatus,
    CreateProjectRequest, 
    UpdateProjectRequest, 
} from '@/types/index'; 


import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// --- DEFINISI ARRAY ENUM UNTUK ZOD DAN JSX ---

const PROJECT_TYPES = ["WEB", "MOBILE", "API", "OTHER"] as const; 

// PERBAIKAN: Array ini HARUS MENCERMINKAN SEMUA status dari ProjectStatus di types/index.ts
// (Misalnya: 'active' | 'archived' | 'maintenance' | 'suspended' | 'completed')
// Tujuannya agar Zod valid saat menerima initialData (Edit Mode) yang mungkin memiliki status 'archived'.
const PROJECT_STATUSES = ["active", "completed", "suspended", "archived", "maintenance"] as const;


// --- 1. DEFINISI SKEMA VALIDASI (Zod) ---
const projectFormSchema = z.object({
    id: z.number().optional(), 
    name: z.string().min(3, { message: "Nama proyek minimal 3 karakter." }),
    description: z.string().optional(),
    
    type: z.enum(PROJECT_TYPES, {
        error: "Tipe proyek wajib dipilih.",
    }),
    
    // PERBAIKAN: Menggunakan array status lengkap
    status: z.enum(PROJECT_STATUSES, {
        error: "Status proyek wajib dipilih.", 
    }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// --- 2. DEFINISI PROPS KOMPONEN ---
interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: Project | null; 
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ open, onOpenChange, initialData }) => {
    const isEditMode = !!initialData;
    
    // Asumsi useCreateProject dan useUpdateProject sudah diperbaiki untuk menerima Request Types dari '@/types/index'
    const { mutate: createMutate, isPending: isCreating } = useCreateProject();
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateProject();
    
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            id: initialData?.id,
            name: initialData?.name || "",
            description: initialData?.description || "",
            // Menggunakan type assertion yang aman karena kita tahu initialData.type/status
            // seharusnya sesuai dengan tipe ProjectType/ProjectStatus yang valid
            type: (initialData?.type as ProjectType) || PROJECT_TYPES[0], 
            status: (initialData?.status as ProjectStatus) || 'active', // Pastikan default status ada di array PROJECT_STATUSES
        },
    });

    // --- 3. SYNC DATA UNTUK EDIT MODE ---
    useEffect(() => {
        if (initialData) {
            form.reset({
                id: initialData.id,
                name: initialData.name,
                description: initialData.description || "",
                type: initialData.type as ProjectType,
                // Type assertion ini krusial agar nilai status yang berasal dari API (mungkin 'archived')
                // tetap bisa masuk ke form.reset tanpa type error, karena Zod Schema sudah mengakomodasinya.
                status: initialData.status as ProjectStatus, 
            });
        } else {
             form.reset({
                id: undefined,
                name: "",
                description: "",
                type: PROJECT_TYPES[0], 
                status: PROJECT_STATUSES.includes('active') ? 'active' : PROJECT_STATUSES[0], // Gunakan status default yang pasti valid
            });
        }
    }, [initialData, form]);

    // --- 4. HANDLE SUBMIT FORM ---
    const onSubmit = (values: ProjectFormValues) => {
        
        // Payload inti harus sesuai dengan CreateProjectRequest
        const payload: CreateProjectRequest = {
            name: values.name,
            description: values.description || "", 
            type: values.type, 
            status: values.status, 
        };

        const config = {
            onSuccess: () => {
                onOpenChange(false); 
                form.reset(); 
                toast.success(isEditMode ? "Perubahan Disimpan" : "Project Dibuat", {
                    description: `Project '${values.name}' berhasil di${isEditMode ? 'perbarui' : 'buat'}.`,
                    duration: 3000, 
                });
            },
            onError: (error: any) => {
                console.error("Submission failed:", error);
                // Menampilkan error dari response API jika ada
                const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
                                    ? error.response.data.message 
                                    : "Terjadi kesalahan saat menyimpan project.";

                toast.error("Gagal Menyimpan Project", {
                    description: errorMessage,
                    duration: 5000,
                });
            }
        };
        
        // Pilihan Mutasi
        if (isEditMode && values.id) {
            // Konstruksi UpdatePayload: Harus sesuai dengan UpdateProjectRequest (memiliki ID)
            const updatePayload: UpdateProjectRequest = { 
                id: values.id, 
                ...payload // Menggunakan properti dari CreateProjectRequest/Payload inti
            } as UpdateProjectRequest; 

            // Memanggil updateMutate
            updateMutate(updatePayload, config);
        } else {
            // Memanggil createMutate
            createMutate(payload, config);
        }
    };

    const isPending = isCreating || isUpdating;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Project' : 'Tambah Project Baru'}</DialogTitle>
                    <DialogDescription>
                        Lengkapi detail project. Klik simpan setelah selesai.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* ID (Hidden) */}
                        {isEditMode && <Input type="hidden" {...form.register('id', { valueAsNumber: true })} />}
                        
                        {/* Nama Proyek */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Proyek</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nama project (e.g., SQAHUB)" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Tipe Proyek */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Proyek</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe project" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PROJECT_TYPES.map(type => (
                                                <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status Proyek */}
                       <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Proyek</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status project" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* FILTERING: Hanya tampilkan status yang boleh dipilih/diubah oleh user */}
                                            {PROJECT_STATUSES
                                                .filter(status => status === 'active' || status === 'completed' || status === 'suspended')
                                                .map(status => (
                                                    <SelectItem key={status} value={status}>{status.toUpperCase()}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Deskripsi */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Deskripsi singkat project" 
                                            {...field} 
                                            value={field.value || ''} // Handle nilai undefined/null
                                            disabled={isPending} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    isEditMode ? 'Simpan Perubahan' : 'Buat Project'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectFormDialog;