// src/hooks/useTestSuites.ts (VERSI FINAL TERSELARAS)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/utils/api'; // Asumsi ini adalah wrapper Axios dengan header auth
import type{ 
    TestSuite, 
    TestSuiteRunRequest, // <-- Tipe Request CREATE yang sudah diperbarui
    TestSuiteFinalizeRequest,
    RunDetail // Tipe untuk detail per Test Case dalam sebuah Run
} from '@/types/testSuite';

import { toast } from 'sonner'; 

const TEST_SUITE_QUERY_KEY = 'testSuites';
const TEST_RUN_DETAIL_QUERY_KEY = 'testRunDetail'; // Key untuk detail Test Case Run

// #########################################
// --- HOOKS QUERY (READ) ---
// #########################################

/**
 * 1. Mengambil semua Test Suites berdasarkan Project ID
 */
export const useTestSuitesByProject = (projectId: number | undefined) => {
    return useQuery<TestSuite[], Error>({
        queryKey: [TEST_SUITE_QUERY_KEY, 'project', projectId],
        queryFn: async () => {
            if (!projectId || projectId < 1) {
                return [];
            }
            // ENDPOINT: /api/v1/testsuite/project/{projectId}
            const { data } = await API.get(`/testsuite/project/${projectId}`);
            return data;
        },
        enabled: !!projectId && projectId > 0,
    });
};

/**
 * 2. Mengambil detail satu Test Suite (Data Statis Suite)
 */
export const useTestSuiteById = (testSuiteId: number | undefined) => {
    return useQuery<TestSuite, Error>({ 
        queryKey: [TEST_SUITE_QUERY_KEY, 'detail', testSuiteId], 
        queryFn: async () => {
            if (!testSuiteId || testSuiteId < 1) {
                 throw new Error("Invalid Test Suite ID provided.");
            }
            // ENDPOINT: /api/v1/testsuite/{testSuiteId}
            const { data } = await API.get(`/testsuite/${testSuiteId}`);
            return data;
        },
        enabled: !!testSuiteId && testSuiteId > 0,
    });
};

/**
 * 3. Mengambil Detail Run Case Tunggal (Log Detail per Test Case)
 */
export const useTestRunDetailById = (runDetailId: number | undefined) => {
    return useQuery<RunDetail, Error>({ 
        queryKey: [TEST_RUN_DETAIL_QUERY_KEY, runDetailId],
        queryFn: async () => {
             if (!runDetailId || runDetailId < 1) {
                 throw new Error("Invalid Run Detail ID provided.");
            }
            // Sesuai API: GET /api/v1/testsuite/detail/{runDetailId}
            const { data } = await API.get(`/testsuite/detail/${runDetailId}`);
            return data;
        },
        enabled: !!runDetailId && runDetailId > 0,
        staleTime: 5 * 60 * 1000, // 5 menit
    });
};

// #########################################
// --- HOOKS MUTATION (CREATE, UPDATE, DELETE) ---
// #########################################

/**
 * 4. CREATE Test Suite Run
 */
export const useCreateTestSuiteRun = () => {
    const queryClient = useQueryClient();
    // Gunakan TestSuiteRunRequest yang sudah diselaraskan
    return useMutation<TestSuite, Error, TestSuiteRunRequest>({ 
        mutationFn: async (payload: TestSuiteRunRequest) => {
            // ENDPOINT: POST /api/v1/testsuite/run
            const { data } = await API.post('/testsuite/run', payload);
            return data;
        },
        onSuccess: (newSuite: TestSuite) => {
            toast.success("Test Suite Run Dicatat", { description: `Run '${newSuite.name}' berhasil dibuat.` });
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', newSuite.projectId] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat membuat Test Suite Run.";
            toast.error("Gagal Mencatat Test Suite Run", { description: errorMessage });
        },
    });
};

/**
 * 5. UPDATE/FINALIZE Test Suite Run
 */
interface FinalizeParams {
    testSuiteId: number;
    payload: TestSuiteFinalizeRequest;
}

export const useFinalizeTestSuiteRun = () => {
    const queryClient = useQueryClient();
    return useMutation<TestSuite, Error, FinalizeParams>({
        mutationFn: async ({ testSuiteId, payload }: FinalizeParams) => {
            // ENDPOINT: PUT /api/v1/testsuite/{testSuiteId}/finalize
            const { data } = await API.put(`/testsuite/${testSuiteId}/finalize`, payload);
            return data;
        },
        onSuccess: (updatedSuite: TestSuite) => {
            toast.success("Test Suite Run Diperbarui", { description: `Run '${updatedSuite.name}' telah difinalisasi.` });
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'detail', updatedSuite.id] });
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', updatedSuite.projectId] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memfinalisasi run.";
            toast.error("Gagal Finalize Test Suite Run", { description: errorMessage });
        },
    });
};


export interface DeleteTestSuiteParams {
    testSuiteId: number;
    projectId: number; 
}

/**
 * 6. DELETE Test Suite
 */
export const useDeleteTestSuite = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, DeleteTestSuiteParams>({
        mutationFn: async (params: DeleteTestSuiteParams) => {
            const { testSuiteId } = params;
            // Endpoint: DELETE /api/v1/testsuite/{testSuiteId}
            await API.delete(`/testsuite/${testSuiteId}`);
        },
        onSuccess: (_data, variables) => {
            const { testSuiteId, projectId } = variables;
            
            toast.success("Test Suite Run Dihapus", { 
                 description: `Run ID ${testSuiteId} berhasil dihapus.` 
            });
            
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', projectId] }); 
            queryClient.removeQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'detail', testSuiteId] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menghapus run.";
            toast.error("Gagal Hapus Test Suite Run", { description: errorMessage });
        }
    });
};