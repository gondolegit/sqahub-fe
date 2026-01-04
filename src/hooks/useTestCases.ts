// src/hooks/useTestCases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

// Import tipe dari file terpisah yang baru kita buat
import type { 
    TestCase, 
    TestCaseRequest, 
    UpdateTestCaseParams, 
    DeleteTestCaseParams 
} from '@/types/testCase'; // Asumsi jalur import Anda

// --- CONFIGURATION DASAR ---
const API_BASE_URL = 'http://localhost:8080/api/v1'; 
const TC_QUERY_KEY = 'testcases';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); 
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};
// ----------------------------


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
        const response = await axios.get(`${API_BASE_URL}/testcase/feature/${featureId}`, getAuthHeaders());
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
        const response = await axios.get(`${API_BASE_URL}/testcase/${testCaseId}`, getAuthHeaders());
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
        const response = await axios.get(`${API_BASE_URL}/testcase/project/${projectId}`, getAuthHeaders());
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
        const response = await axios.post(`${API_BASE_URL}/testcase`, data, getAuthHeaders());
        return response.data;
    };

    return useMutation<TestCase, Error, TestCaseRequest>({
        mutationFn: createTestCase,
        onSuccess: (newTc, variables) => {
            toast.success("Test Case Dibuat", { description: `TC '${newTc.name}' berhasil ditambahkan.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
        },
        onError: (error: any) => {
            // Menangani Error Response dari Axios
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat membuat TC.";
            toast.error("Gagal Membuat Test Case", { description: errorMessage });
        }
    });
};

// 5. UPDATE Test Case 
export const useUpdateTestCase = () => {
    const queryClient = useQueryClient();
    const updateTestCase = async (params: UpdateTestCaseParams): Promise<TestCase> => {
        const { testCaseId, idFeature, ...payload } = params;
        // ENDPOINT: PUT /api/v1/testcase/{testCaseId}
        const response = await axios.put(`${API_BASE_URL}/testcase/${testCaseId}`, payload, getAuthHeaders());
        return response.data;
    };

    return useMutation<TestCase, Error, UpdateTestCaseParams>({
        mutationFn: updateTestCase,
        onSuccess: (updatedTc, variables) => {
            toast.success("Test Case Diperbarui", { description: `TC '${updatedTc.name}' berhasil diubah.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
            // Invalidasi detail Test Case
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'detail', updatedTc.id] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui TC.";
            toast.error("Gagal Update Test Case", { description: errorMessage });
        }
    });
};

// 6. DELETE Test Case 
export const useDeleteTestCase = () => {
    const queryClient = useQueryClient();
    const deleteTestCase = async (params: DeleteTestCaseParams): Promise<void> => {
        const { testCaseId } = params;
        // ENDPOINT: DELETE /api/v1/testcase/{testCaseId}
        await axios.delete(`${API_BASE_URL}/testcase/${testCaseId}`, getAuthHeaders());
    };

    return useMutation<void, Error, DeleteTestCaseParams>({
        mutationFn: deleteTestCase,
        onSuccess: (_, variables) => {
            toast.success("Test Case Dihapus", { description: `Test Case ID ${variables.testCaseId} berhasil dihapus.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menghapus TC.";
            toast.error("Gagal Hapus Test Case", { description: errorMessage });
        }
    });
};