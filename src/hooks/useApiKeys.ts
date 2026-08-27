// src/hooks/useApiKeys.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import API from '@/utils/api';
import type { ApiKey, ApiKeyRequest } from '@/types/index';

const API_KEY_QUERY_KEY = 'apiKeys';

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

// GET /apikey — kunci milik user yang sedang login
export const useApiKeys = () => {
    return useQuery<ApiKey[], ApiError>({
        queryKey: [API_KEY_QUERY_KEY],
        queryFn: async () => {
            const { data } = await API.get('/apikey');
            return data;
        },
    });
};

// POST /apikey — role ADMIN, TESTER, atau DEVELOPER. Respons menyertakan rawKey (hanya sekali ini).
export const useCreateApiKey = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiKey, ApiError, ApiKeyRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.post('/apikey', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_KEY_QUERY_KEY] });
        },
        onError: (error) => {
            toast.error("Gagal Membuat API Key", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};

// DELETE /apikey/{id} — role ADMIN, TESTER, atau DEVELOPER
export const useRevokeApiKey = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, number>({
        mutationFn: async (id) => {
            await API.delete(`/apikey/${id}`);
        },
        onSuccess: () => {
            toast.success("API Key Dicabut");
            queryClient.invalidateQueries({ queryKey: [API_KEY_QUERY_KEY] });
        },
        onError: (error) => {
            toast.error("Gagal Mencabut API Key", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};
