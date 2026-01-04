// src/hooks/useTestSuites.ts (VERSI PERBAIKAN LENGKAP)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/utils/api'; 
// 🚨 Import tipe yang baru diubah namanya: RunDetail
import type{ 
    TestSuite, 
    TestSuiteRunRequest, 
    TestSuiteFinalizeRequest,
    RunDetail // <--- PASTIKAN INI DIIMPORT!
} from '@/types/testSuite';

import axios from 'axios';
import type { TestRunDetail } from '@/types/testSuite'; // Pastikan Anda mengimpor TestRunDetail

const API_URL = import.meta.env.VITE_API_URL; // Asumsi variabel lingkungan

// --- HOOK BARU: Mengambil Detail Test Run ---
export const useTestRunDetail = (runId: number | undefined) => {
    return useQuery<TestRunDetail, Error>({
        queryKey: ['testRunDetail', runId],
        queryFn: async () => {
            if (!runId || runId < 1) {
                // Seharusnya tidak tercapai karena 'enabled' menangani ini, tapi untuk keamanan
                throw new Error("Invalid Run ID provided.");
            }
            const { data } = await axios.get(`${API_URL}/testsuite/run/${runId}`);
            return data;
        },
        // Hook hanya akan berjalan jika runId adalah angka positif yang valid
        enabled: !!runId && runId > 0, 
    });
};

const TEST_SUITE_QUERY_KEY = 'testSuites';
const TEST_RUN_DETAIL_QUERY_KEY = 'testRunDetail'; // Key baru untuk detail Test Case

// --- 1. GET ALL Test Suites by Project ---
// 🚨 PERBAIKAN: Menerima 'number | undefined'
export const useTestSuitesByProject = (projectId: number | undefined) => {
    return useQuery<TestSuite[]>({
        queryKey: [TEST_SUITE_QUERY_KEY, 'project', projectId],
        queryFn: async () => {
            // Periksa di sini agar TypeScript puas dan logic berjalan lancar
            if (!projectId || projectId < 1) {
                 return [];
            }
            const { data } = await API.get(`/testsuite/project/${projectId}`);
            return data;
        },
        // 🚨 PERBAIKAN: Hanya aktifkan query jika projectId adalah angka positif
        enabled: !!projectId && projectId > 0,
    });
};

// --- 2. GET Test Suite by ID (Detail Suite Statis) ---
// 🚨 PERBAIKAN: Menerima 'number | undefined' untuk fleksibilitas
export const useTestSuiteById = (testSuiteId: number | undefined) => {
    return useQuery<TestSuite, Error>({ // Tambahkan Error Type
        queryKey: [TEST_SUITE_QUERY_KEY, testSuiteId],
        queryFn: async () => {
            if (!testSuiteId || testSuiteId < 1) {
                 throw new Error("Invalid Test Suite ID provided.");
            }
            const { data } = await API.get(`/testsuite/${testSuiteId}`);
            return data;
        },
        // Hanya aktifkan jika ID valid
        enabled: !!testSuiteId && testSuiteId > 0,
    });
};

// 🚨 TAMBAHAN BARU: 3. GET Single Test Case Run Detail (Log Detail)
// 🚨 PERBAIKAN: Menerima 'number | undefined'
export const useTestRunDetailById = (runDetailId: number | undefined) => {
    return useQuery<RunDetail, Error>({ // Tambahkan Error Type
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
        // Data ini cenderung statis setelah dicatat, jadi bisa di-cache lebih lama
        staleTime: 5 * 60 * 1000, // 5 menit
    });
};

// --- 4. CREATE Test Suite Run ---
export const useCreateTestSuiteRun = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: TestSuiteRunRequest) => {
            const { data } = await API.post('/testsuite/run', payload);
            return data;
        },
        onSuccess: (newSuite: TestSuite) => {
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', newSuite.projectId] });
        },
        onError: (error) => {
            console.error("Gagal membuat Test Suite Run:", error);
            // Tambahkan toast error di sini
        },
    });
};

// --- 5. UPDATE/FINALIZE Test Suite Run ---
interface FinalizeParams {
    testSuiteId: number;
    payload: TestSuiteFinalizeRequest;
}

export const useFinalizeTestSuiteRun = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ testSuiteId, payload }: FinalizeParams) => {
            const { data } = await API.put(`/testsuite/${testSuiteId}/finalize`, payload);
            return data;
        },
        onSuccess: (updatedSuite: TestSuite) => {
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, updatedSuite.id] });
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', updatedSuite.projectId] });
        },
        onError: (error) => {
            console.error("Gagal Finalize Test Suite Run:", error);
        },
    });
};


// --- 6. DELETE Test Suite ---
export const useDeleteTestSuite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (testSuiteId: number) => {
            await API.delete(`/testsuite/${testSuiteId}`);
        },
        onSuccess: (_data, testSuiteId) => {
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project'] });
            queryClient.removeQueries({ queryKey: [TEST_SUITE_QUERY_KEY, testSuiteId] });
        },
        onError: (error) => {
            console.error("Gagal menghapus Test Suite:", error);
        }
    });
};