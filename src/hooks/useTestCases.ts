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
import type { Page } from '@/types/index';

// --- CONFIGURATION DASAR ---
const TC_QUERY_KEY = 'testcases';

export interface PageParams {
    page?: number;
    size?: number;
    sort?: string;
}

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

// #########################################
// --- HOOKS QUERY (READ) ---
// #########################################

// Halaman kosong pakai bentuk Page<T> yang valid — dipakai sebagai fallback saat featureId/projectId belum ada,
// supaya konsumen tidak perlu menangani `undefined` secara terpisah dari "belum ada data".
const emptyPage = <T,>(size: number): Page<T> => ({
    content: [], totalElements: 0, totalPages: 0, number: 0, size, first: true, last: true,
});

/**
 * 1. Mengambil Test Case berdasarkan Feature ID — [paginated] per spec backend.
 * @param featureId ID Feature. Mengizinkan number atau undefined untuk integrasi UI yang lebih baik.
 * EKSPOR DENGAN NAMA: useTestCasesByFeature
 */
export const useTestCasesByFeature = (featureId: number | undefined, { page = 0, size = 10, sort }: PageParams = {}) => {
    const fetchTestCases = async (): Promise<Page<TestCase>> => {
        if (!featureId || featureId < 1) return emptyPage<TestCase>(size); // Guard
        // ENDPOINT: /api/v1/testcase/feature/{featureId}
        const response = await API.get(`/testcase/feature/${featureId}`, { params: { page, size, sort } });
        return response.data;
    };

    return useQuery<Page<TestCase>, Error>({
        // Key disesuaikan: [testcases, feature, <featureId>]
        queryKey: [TC_QUERY_KEY, 'feature', featureId, { page, size, sort }],
        queryFn: fetchTestCases,
        // Query hanya diaktifkan jika featureId valid.
        enabled: !!featureId && featureId > 0,
        placeholderData: (previousData) => previousData,
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
 * 3. Mengambil Test Case berdasarkan Project ID (Digunakan untuk TestSuiteFormDialog) — [paginated].
 * Dipakai sebagai "picker" test case saat menyusun sebuah run, jadi default size dibuat besar
 * agar terasa seperti "semua test case" tanpa perlu UI paginasi terpisah di dalam dialog.
 * @param projectId ID Project. Mengizinkan number atau undefined.
 */
export const useTestCasesByProject = (projectId: number | undefined, { page = 0, size = 200, sort }: PageParams = {}) => {
    const fetchTestCases = async (): Promise<Page<TestCase>> => {
        if (!projectId || projectId < 1) return emptyPage<TestCase>(size); // Guard
        // ENDPOINT: /api/v1/testcase/project/{projectId}
        const response = await API.get(`/testcase/project/${projectId}`, { params: { page, size, sort } });
        return response.data;
    };

    return useQuery<Page<TestCase>, Error>({
        // Key disesuaikan untuk Project ID: [testcases, project, <projectId>]
        queryKey: [TC_QUERY_KEY, 'project', projectId, { page, size, sort }],
        queryFn: fetchTestCases,
        // Query hanya diaktifkan jika projectId valid
        enabled: !!projectId && projectId > 0,
        placeholderData: (previousData) => previousData,
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
