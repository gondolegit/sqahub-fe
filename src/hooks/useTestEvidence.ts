// src/hooks/useTestEvidence.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import API from '@/utils/api';
import type { TestEvidence, TestEvidenceRequest } from '@/types/testEvidence';

const EVIDENCE_QUERY_KEY = 'testEvidence';

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

// GET /evidence/run/{runDetailId}
export const useEvidenceByRunDetail = (runDetailId: number | undefined) => {
    return useQuery<TestEvidence[], ApiError>({
        queryKey: [EVIDENCE_QUERY_KEY, runDetailId],
        queryFn: async () => {
            const { data } = await API.get(`/evidence/run/${runDetailId}`);
            return data;
        },
        enabled: !!runDetailId && runDetailId > 0,
    });
};

// POST /evidence — metadata-only, file sudah ada di storage eksternal (S3/GCS)
export const useCreateEvidenceMetadata = () => {
    const queryClient = useQueryClient();
    return useMutation<TestEvidence, ApiError, TestEvidenceRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.post('/evidence', payload);
            return data;
        },
        onSuccess: (evidence) => {
            toast.success("Bukti Ditambahkan");
            queryClient.invalidateQueries({ queryKey: [EVIDENCE_QUERY_KEY, evidence.runDetailId] });
        },
        onError: (error) => {
            toast.error("Gagal Menambah Bukti", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};

// POST /evidence/upload — multipart/form-data
interface UploadEvidenceParams {
    runDetailId: number;
    file: File;
    description?: string;
}

export const useUploadEvidence = () => {
    const queryClient = useQueryClient();
    return useMutation<TestEvidence, ApiError, UploadEvidenceParams>({
        mutationFn: async ({ runDetailId, file, description }) => {
            const formData = new FormData();
            formData.append('runDetailId', String(runDetailId));
            formData.append('file', file);
            if (description) formData.append('description', description);

            // Jangan set Content-Type manual — biarkan browser menentukan multipart boundary-nya.
            const { data } = await API.post('/evidence/upload', formData);
            return data;
        },
        onSuccess: (evidence) => {
            toast.success("Bukti Diunggah", { description: evidence.fileName });
            queryClient.invalidateQueries({ queryKey: [EVIDENCE_QUERY_KEY, evidence.runDetailId] });
        },
        onError: (error) => {
            toast.error("Gagal Mengunggah Bukti", { description: getErrorMessage(error, "Terjadi kesalahan saat mengunggah file.") });
        },
    });
};

// GET /evidence/{evidenceId}/download — memicu unduhan file di browser
export const useDownloadEvidence = () => {
    return useMutation<void, ApiError, TestEvidence>({
        mutationFn: async (evidence) => {
            const response = await API.get(`/evidence/${evidence.id}/download`, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = evidence.fileName || `evidence-${evidence.id}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        },
        onError: (error) => {
            toast.error("Gagal Mengunduh Bukti", { description: getErrorMessage(error, "File hanya bisa diunduh jika diunggah lewat SQAHub.") });
        },
    });
};
