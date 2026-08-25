// src/hooks/useTestCases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import API from '@/utils/api';

// Import tipe dari file terpisah yang baru kita buat
import type {
    TestCase,
    TestCaseRequest,
    UpdateTestCaseParams,
    DeleteTestCaseParams
} from '@/types/testCase'; // Asumsi jalur import Anda

// --- CONFIGURATION DASAR ---
const TC_QUERY_KEY = 'testcases';

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

// #########################################
// --- HOOKS QUERY (READ) ---
// #########################################

/**
 * 1. Mengambil semua Test Case berdasarkan Feature ID
 * @param featureId ID Feature. Mengizinkan number atau undefined untuk integrasi UI yang lebih baik.
 * EKSPOR DENGAN NAMA: useTestCasesByFeature
 */
export const useTestCasesByFeature = (featureId: number | undefined) => {
    const fetchTestCases = async (): Promise<TestCase[]> => {
        if (!featureId || featureId < 1) return []; // Guard
        // ENDPOINT: /api/v1/testcase/feature/{featureId}
        const response = await API.get(`/testcase/feature/${featureId}`);
        return response.data;
    };

    return useQuery<TestCase[], Error>({
        // Key disesuaikan: [testcases, feature, <featureId>]
        queryKey: [TC_QUERY_KEY, 'feature', featureId],
        queryFn: fetchTestCases,
        // Query hanya diaktifkan jika featureId valid.
        enabled: !!featureId && featureId > 0,
    });
};

/**
 * 2. Mengambil detail satu Test Case
 * @param testCaseId ID Test Case. Mengizinkan number atau undefined.
 */
export const useTestCaseDetail = (testCaseId: number | undefined) => {
    const fetchTestCaseDetail = async (): Promise<TestCase> => {
        if (!testCaseId || testCaseId < 1) throw new Error("Invalid Test Case ID"); // Guard
        // ENDPOINT: /api/v1/testcase/{testCaseId}
        const response = await API.get(`/testcase/${testCaseId}`);
        return response.data;
    };

    return useQuery<TestCase, Error>({
        queryKey: [TC_QUERY_KEY, 'detail', testCaseId],
        queryFn: fetchTestCaseDetail,
        enabled: !!testCaseId && testCaseId > 0, // Query hanya diaktifkan jika testCaseId valid
    });
};

/**
 * 3. MENGAMBIL SEMUA TEST CASE berdasarkan Project ID (BARU, Digunakan untuk TestSuiteFormDialog)
 * @param projectId ID Project. Mengizinkan number atau undefined.
 */
export const useTestCasesByProject = (projectId: number | undefined) => {
    const fetchTestCases = async (): Promise<TestCase[]> => {
        if (!projectId || projectId < 1) return []; // Guard
        // ENDPOINT: /api/v1/testcase/project/{projectId}
        const response = await API.get(`/testcase/project/${projectId}`);
        return response.data;
    };

    return useQuery<TestCase[], Error>({
        // Key disesuaikan untuk Project ID: [testcases, project, <projectId>]
        queryKey: [TC_QUERY_KEY, 'project', projectId],
        queryFn: fetchTestCases,
        // Query hanya diaktifkan jika projectId valid
        enabled: !!projectId && projectId > 0,
    });
};

// #########################################
// --- HOOKS MUTATION (CREATE, UPDATE, DELETE) ---
// #########################################

// 4. CREATE Test Case
export const useCreateTestCase = () => {
    const queryClient = useQueryClient();
    const createTestCase = async (data: TestCaseRequest): Promise<TestCase> => {
        // ENDPOINT: POST /api/v1/testcase
        const response = await API.post(`/testcase`, data);
        return response.data;
    };

    return useMutation<TestCase, ApiError, TestCaseRequest>({
        mutationFn: createTestCase,
        onSuccess: (newTc, variables) => {
            toast.success("Test Case Dibuat", { description: `TC '${newTc.name}' berhasil ditambahkan.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
        },
        onError: (error) => {
            toast.error("Gagal Membuat Test Case", { description: getErrorMessage(error, "Terjadi kesalahan saat membuat TC.") });
        }
    });
};

// 5. UPDATE Test Case
export const useUpdateTestCase = () => {
    const queryClient = useQueryClient();
    const updateTestCase = async (params: UpdateTestCaseParams): Promise<TestCase> => {
        // idFeature dikeluarkan dari payload PUT (hanya dipakai pemanggil untuk invalidasi query)
        const { testCaseId, idFeature, ...payload } = params;
        // ENDPOINT: PUT /api/v1/testcase/{testCaseId}
        const response = await API.put(`/testcase/${testCaseId}`, payload);
        return response.data;
    };

    return useMutation<TestCase, ApiError, UpdateTestCaseParams>({
        mutationFn: updateTestCase,
        onSuccess: (updatedTc, variables) => {
            toast.success("Test Case Diperbarui", { description: `TC '${updatedTc.name}' berhasil diubah.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
            // Invalidasi detail Test Case
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'detail', updatedTc.id] });
        },
        onError: (error) => {
            toast.error("Gagal Update Test Case", { description: getErrorMessage(error, "Terjadi kesalahan saat memperbarui TC.") });
        }
    });
};

// 6. DELETE Test Case
export const useDeleteTestCase = () => {
    const queryClient = useQueryClient();
    const deleteTestCase = async (params: DeleteTestCaseParams): Promise<void> => {
        const { testCaseId } = params;
        // ENDPOINT: DELETE /api/v1/testcase/{testCaseId}
        await API.delete(`/testcase/${testCaseId}`);
    };

    return useMutation<void, ApiError, DeleteTestCaseParams>({
        mutationFn: deleteTestCase,
        onSuccess: (_, variables) => {
            toast.success("Test Case Dihapus", { description: `Test Case ID ${variables.testCaseId} berhasil dihapus.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
        },
        onError: (error) => {
            toast.error("Gagal Hapus Test Case", { description: getErrorMessage(error, "Terjadi kesalahan saat menghapus TC.") });
        }
    });
};
