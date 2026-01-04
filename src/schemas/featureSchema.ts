// src/schemas/featureSchema.ts
import { z } from "zod";

export const FeatureSchema = z.object({
    name: z.string().min(3, "Nama Fitur minimal 3 karakter."),
    
    // PERBAIKAN ZOD ENUM: Ganti 'required_error' menjadi 'error'
    type: z.enum(["WEB", "MOBILE", "API", "OTHER"], {
        error: "Tipe Fitur wajib dipilih.", // <-- DIGANTI DI SINI
    }),
    
    description: z.string().min(10, "Deskripsi minimal 10 karakter."),
    
    // PERBAIKAN ZOD ENUM: Ganti 'required_error' menjadi 'error'
    status: z.enum(["active", "pending", "deprecated"], {
        error: "Status wajib dipilih.", // <-- DIGANTI DI SINI
    }),
    
    tag: z.string().optional().nullable(), 
});

export type FeatureFormValues = z.infer<typeof FeatureSchema>;

// Catatan: Jika Anda menggunakan 'z.string().min(1, { message: "..." })' di tempat lain,
// itu adalah penanganan yang benar untuk string. Masalah ini spesifik untuk z.enum.