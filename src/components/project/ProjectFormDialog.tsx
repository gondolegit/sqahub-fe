// src/components/project/ProjectFormDialog.tsx (FULL REVISI)
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

// IMPOR NILAI (Fungsi/Hook)
import { 
    useCreateProject, 
    useUpdateProject, 
} from '@/hooks/useProjects'; 

// IMPOR TIPE DARI SUMBER DEFINITIF: '@/types/index.ts'
import type {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
} from '@/types/index';


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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

// ... (imports remain similar, focus on logic improvements)
const PROJECT_STATUS_COLORS = {
  active: "bg-emerald-500",
  completed: "bg-blue-500",
  suspended: "bg-amber-500",
  maintenance: "bg-indigo-500",
} as const;
const PROJECT_STATUS_OPTIONS = Object.keys(PROJECT_STATUS_COLORS) as (keyof typeof PROJECT_STATUS_COLORS)[];

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { t } = useTranslation();
  const isEditMode = !!initialData;
  const { mutate: createMutate, isPending: isCreating } = useCreateProject();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateProject();
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "WEB",
      status: "active",
    },
  });

  // Sync effect with cleanup
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          id: initialData.id,
          name: initialData.name,
          description: initialData.description || "",
          type: initialData.type,
          status: initialData.status,
        });
      } else {
        form.reset({ name: "", description: "", type: "WEB", status: "active" });
      }
    }
  }, [initialData, open, form]);

  const onSubmit = (values: ProjectFormValues) => {
    const payload: CreateProjectRequest = {
      name: values.name,
      description: values.description ?? "",
      type: values.type,
      status: values.status,
    };

    const callbacks = {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(isEditMode ? t('projectForm.successEditTitle') : t('projectForm.successCreateTitle'));
      },
      onError: (err: Error) => {
        const msg = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
        toast.error(t('projectForm.errorTitle'), { description: msg || t('projectForm.errorDescription') });
      }
    };

    // ISO Standard: Immediate Feedback
    if (isEditMode && initialData) {
      const updatePayload: UpdateProjectRequest = { ...payload, id: initialData.id };
      updateMutate(updatePayload, callbacks);
    } else {
      createMutate(payload, callbacks);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden outline-none border-none shadow-2xl">
        <div className="bg-slate-900 p-6 text-white">
          <DialogTitle className="text-2xl font-bold italic tracking-tighter">
            {isEditMode ? t('projectForm.editTitle') : t('projectForm.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t('projectForm.description')}
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-foreground">{t('projectForm.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('projectForm.namePlaceholder')} {...field} className="focus-visible:ring-ring" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground">{t('projectForm.typeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_TYPES.map(pt => (
                          <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground">{t('projectForm.statusLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s}>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${PROJECT_STATUS_COLORS[s]}`} />
                              {t(`projectForm.status.${s}`)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-foreground">{t('projectForm.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('projectForm.descriptionPlaceholder')}
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-8 gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('projectForm.cancel')}</Button>
              <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 px-8">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? t('projectForm.submitEdit') : t('projectForm.submitCreate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;