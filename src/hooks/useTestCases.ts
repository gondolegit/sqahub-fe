// src/hooks/useTestCases.ts atau src/types/testcase.ts

export interface TestCase {
    id: number;
    idFeature: number;
    idProject: number; // Untuk navigasi atau invalidasi
    name: string;
    description: string;
    type: string; // Contoh: FUNCTIONAL, REGRESSION, PERFORMANCE, dll.
    tag: string | null;
    preCondition: string;
    testSteps: string; // Isi yang mungkin panjang, seringkali berformat list/markdown
    testData: string;
    postCondition: string;
    expectedResult: string;
    
    // Status (Akan ditambahkan di FE, karena tidak ada di response API Anda saat ini)
    // Asumsi kita akan menampilkannya di tabel, misalnya: status: "passed" | "failed" | "pending"
    // Untuk saat ini, kita akan fokus pada data yang ada di API.

    createdBy: number;
    createdByUsername: string;
    createdAt: string;
    updatedAt: string;
}

// Data yang dikirim untuk POST/PUT
export interface TestCaseRequest {
    idFeature: number;
    idProject: number; // Disertakan dalam payload POST/PUT
    name: string;
    description: string;
    type: string;
    tag?: string | null;
    preCondition: string;
    testSteps: string;
    testData: string;
    postCondition: string;
    expectedResult: string;
}

// Data untuk Update (membutuhkan ID Test Case di URL)
export interface UpdateTestCaseParams extends TestCaseRequest {
    testCaseId: number;
}

// Data untuk Delete (membutuhkan ID Test Case di URL dan ID Feature/Project untuk invalidasi)
export interface DeleteTestCaseParams {
    testCaseId: number;
    idFeature: number;
}

// src/hooks/useTestCases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

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

// --- DEFINISI TIPE ---
// [Salin definisi TestCase, TestCaseRequest, UpdateTestCaseParams, DeleteTestCaseParams dari atas]

export interface TestCase { /* ... (Definisi seperti di atas) */ }
export interface TestCaseRequest { /* ... (Definisi seperti di atas) */ }
export interface UpdateTestCaseParams extends TestCaseRequest { testCaseId: number; }
export interface DeleteTestCaseParams { testCaseId: number; idFeature: number; }


// --- HOOKS QUERY (READ) ---

// 1. Mengambil semua Test Case berdasarkan Feature ID
export const useTestCases = (featureId: number) => {
    const fetchTestCases = async (): Promise<TestCase[]> => {
        // ENDPOINT: /api/v1/testcase/feature/{featureId}
        const response = await axios.get(`${API_BASE_URL}/testcase/feature/${featureId}`, getAuthHeaders());
        return response.data;
    };

    return useQuery<TestCase[], Error>({
        queryKey: [TC_QUERY_KEY, featureId],
        queryFn: fetchTestCases,
        enabled: featureId > 0,
    });
};

// 2. Mengambil detail satu Test Case
export const useTestCaseDetail = (testCaseId: number) => {
    const fetchTestCaseDetail = async (): Promise<TestCase> => {
        // ENDPOINT: /api/v1/testcase/{testCaseId}
        const response = await axios.get(`${API_BASE_URL}/testcase/${testCaseId}`, getAuthHeaders());
        return response.data;
    };

    return useQuery<TestCase, Error>({
        queryKey: [TC_QUERY_KEY, 'detail', testCaseId],
        queryFn: fetchTestCaseDetail,
        enabled: testCaseId > 0, 
    });
};


// --- HOOKS MUTATION (CREATE, UPDATE, DELETE) ---

// 3. CREATE Test Case
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
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, variables.idFeature] });
        },
        onError: (error) => {
            toast.error("Gagal Membuat Test Case", { description: error.message || "Terjadi kesalahan saat membuat TC." });
        }
    });
};

// 4. UPDATE Test Case
export const useUpdateTestCase = () => {
    const queryClient = useQueryClient();
    const updateTestCase = async (params: UpdateTestCaseParams): Promise<TestCase> => {
        const { testCaseId, ...payload } = params;
        // ENDPOINT: PUT /api/v1/testcase/{testCaseId}
        const response = await axios.put(`${API_BASE_URL}/testcase/${testCaseId}`, payload, getAuthHeaders());
        return response.data;
    };

    return useMutation<TestCase, Error, UpdateTestCaseParams>({
        mutationFn: updateTestCase,
        onSuccess: (updatedTc, variables) => {
            toast.success("Test Case Diperbarui", { description: `TC '${updatedTc.name}' berhasil diubah.` });
            // Invalidasi list Test Case berdasarkan ID Feature
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, variables.idFeature] });
            // Invalidasi detail Test Case
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'detail', updatedTc.id] });
        },
        onError: (error) => {
            toast.error("Gagal Update Test Case", { description: error.message || "Terjadi kesalahan saat memperbarui TC." });
        }
    });
};

// 5. DELETE Test Case
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
            queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, variables.idFeature] });
        },
        onError: (error) => {
            toast.error("Gagal Hapus Test Case", { description: error.message || "Terjadi kesalahan saat menghapus TC." });
        }
    });
};