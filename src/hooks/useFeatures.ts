// src/hooks/useFeatures.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import API from '@/utils/api';

// --- CONFIGURATION DASAR ---
const FEATURE_QUERY_KEY = 'features';

// --- DEFINISI TIPE ---

/**
 * Tipe data Feature yang digunakan untuk TAMPILAN di UI (ListView atau DetailView).
 * Diasumsikan endpoint GET ALL/GET ONE mengembalikan properti 'type', 'projectName', dan 'testCaseCount'.
 */
export interface Feature {
    id: number;
    idProject: number; 
    name: string;
    description: string;
    tag: string | null;
    status: "active" | "pending" | "deprecated"; 
    
    // Properti yang mungkin HILANG dari Response API POST/PUT, tapi ada di GET
    type: string;
    projectName: string; 
    testCaseCount: number; 
    
    createdBy: number;
    createdByUsername: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Tipe data yang DIKIRIM saat permintaan Create/Update Feature (Payload).
 */
export interface FeatureRequest {
    idProject: number; 
    name: string;
    type: string; 
    description: string;
    status: "active" | "pending" | "deprecated"; 
    tag?: string | null;
}

/**
 * Tipe data yang BENAR-BENAR dikembalikan oleh API POST/PUT (Tanpa 'type', 'projectName', 'testCaseCount').
 * Response API dari Create/Update.
 */
interface FeatureResponseFromApi {
    id: number;
    idProject: number; 
    name: string;
    description: string;
    tag: string | null;
    status: "active" | "pending" | "deprecated"; 
    createdBy: number;
    createdByUsername: string;
    createdAt: string;
    updatedAt: string;
}

// TIPE UNTUK UPDATE
export interface UpdateFeatureParams extends FeatureRequest {
    featureId: number;
}

// TIPE UNTUK DELETE
export interface DeleteFeatureParams {
    featureId: number;
    projectId: number; 
}

// --- HOOKS QUERY (READ) ---
// (Tidak ada perubahan di sini, tetap menggunakan tipe Feature lengkap)

// Mengambil semua fitur berdasarkan Project ID
export const useFeatures = (projectId: number) => {
    const fetchFeatures = async (): Promise<Feature[]> => {
        const response = await API.get(`/feature/project/${projectId}`);
        return response.data;
    };

    return useQuery<Feature[], Error>({
        queryKey: [FEATURE_QUERY_KEY, projectId],
        queryFn: fetchFeatures,
        enabled: projectId > 0, // Hanya fetch jika projectId valid
    });
};

// Mengambil detail satu fitur
export const useFeatureDetail = (featureId: number) => {
    const fetchFeatureDetail = async (): Promise<Feature> => {
        const response = await API.get(`/feature/${featureId}`);
        return response.data;
    };

    return useQuery<Feature, Error>({
        queryKey: ['featureDetail', featureId],
        queryFn: fetchFeatureDetail,
        enabled: featureId > 0, 
    });
};


// --- HOOKS MUTATION (CREATE, UPDATE, DELETE) ---

// CREATE
export const useCreateFeature = () => {
    const queryClient = useQueryClient();
    
    // Mutation mengembalikan FeatureResponseFromApi, tapi inputnya FeatureRequest
    const createFeature = async (featureData: FeatureRequest): Promise<FeatureResponseFromApi> => {
        const response = await API.post(`/feature`, featureData);
        return response.data;
    };

    return useMutation<FeatureResponseFromApi, Error, FeatureRequest>({
        mutationFn: createFeature,
        // requestPayload adalah data yang kita kirim (memiliki 'type' dan 'idProject');
        // respons API (tanpa 'type') tidak dipakai di sini sehingga argumen pertama tidak diberi nama.
        onSuccess: (_responseFromApi, requestPayload) => {
            // Menggunakan requestPayload.name untuk toast yang informatif
            toast.success("Fitur Baru Dibuat", { description: `Fitur '${requestPayload.name}' berhasil ditambahkan.` });
            
            // 🚨 PERBAIKAN: Invalidasi List Query (memaksa useFeatures me-fetch ulang data)
            // Ini menjamin data list yang baru akan berisi field 'type' yang benar.
            queryClient.invalidateQueries({ queryKey: [FEATURE_QUERY_KEY, requestPayload.idProject] });
        },
        onError: (error) => {
            toast.error("Gagal Membuat Fitur", { description: error.message || "Terjadi kesalahan saat membuat fitur." });
        }
    });
};

// UPDATE
export const useUpdateFeature = () => {
    const queryClient = useQueryClient();
    
    // Mutation mengembalikan FeatureResponseFromApi, tapi inputnya UpdateFeatureParams
    const updateFeature = async (params: UpdateFeatureParams): Promise<FeatureResponseFromApi> => {
        const { featureId, ...payload } = params;
        const response = await API.put(`/feature/${featureId}`, payload);
        return response.data;
    };

    return useMutation<FeatureResponseFromApi, Error, UpdateFeatureParams>({
        mutationFn: updateFeature,
        // responseFromApi adalah data yang dikembalikan API
        // requestPayload adalah data yang kita kirim (memiliki 'type', 'idProject', 'featureId')
        onSuccess: (responseFromApi, requestPayload) => {
            // Menggunakan requestPayload.name untuk toast yang informatif
            toast.success("Fitur Diperbarui", { description: `Fitur '${requestPayload.name}' berhasil diubah.` });
            
            // 🚨 PERBAIKAN: Invalidasi List Query
            queryClient.invalidateQueries({ queryKey: [FEATURE_QUERY_KEY, requestPayload.idProject] });
            
            // Invalidasi detail fitur
            queryClient.invalidateQueries({ queryKey: ['featureDetail', responseFromApi.id] });
        },
        onError: (error) => {
            toast.error("Gagal Update Fitur", { description: error.message || "Terjadi kesalahan saat memperbarui fitur." });
        }
    });
};

// DELETE
// (Tidak ada perubahan di sini)
export const useDeleteFeature = () => {
    const queryClient = useQueryClient();
    const deleteFeature = async (params: DeleteFeatureParams): Promise<void> => {
        const { featureId } = params;
        await API.delete(`/feature/${featureId}`);
    };

    return useMutation<void, Error, DeleteFeatureParams>({
        mutationFn: deleteFeature,
        onSuccess: (_, variables) => {
            toast.success("Fitur Dihapus", { description: `Fitur ID ${variables.featureId} berhasil dihapus.` });
            queryClient.invalidateQueries({ queryKey: [FEATURE_QUERY_KEY, variables.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Hapus Fitur", { description: error.message || "Terjadi kesalahan saat menghapus fitur." });
        }
    });
};