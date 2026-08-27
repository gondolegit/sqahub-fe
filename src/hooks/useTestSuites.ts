// src/hooks/useTestSuites.ts (VERSI FINAL TERSELARAS)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import API from '@/utils/api'; // Asumsi ini adalah wrapper Axios dengan header auth
import type {
    TestSuite,
    TestSuiteRunRequest, // <-- Tipe Request CREATE yang sudah diperbarui
    TestSuiteFinalizeRequest,
    RunDetail, // Tipe untuk detail per Test Case dalam sebuah Run
    RunDetailRequest,
    DeployDecisionResponse,
} from '@/types/testSuite';
import type { Page } from '@/types/index';

import { toast } from 'sonner';

const TEST_SUITE_QUERY_KEY = 'testSuites';
const TEST_RUN_DETAIL_QUERY_KEY = 'testRunDetail'; // Key untuk detail Test Case Run

type ApiError = AxiosError<unknown>;

// ⚠️ Endpoint /testsuite/** backend mengembalikan error 403/404 sebagai STRING POLOS di body,
// bukan bentuk ErrorResponse standar { message: ... } — jadi ekstraksi pesannya perlu dua jalur.
const getTestSuiteErrorMessage = (error: ApiError, fallback: string): string => {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string') {
        return (data as { message: string }).message;
    }
    return error.message || fallback;
};

export interface PageParams {
    page?: number;
    size?: number;
    sort?: string;
}

// #########################################
// --- HOOKS QUERY (READ) ---
// #########################################

/**
 * 1. Mengambil Test Suites berdasarkan Project ID — [paginated] per spec backend.
 */
export const useTestSuitesByProject = (projectId: number | undefined, { page = 0, size = 10, sort }: PageParams = {}) => {
    return useQuery<Page<TestSuite>, Error>({
        queryKey: [TEST_SUITE_QUERY_KEY, 'project', projectId, { page, size, sort }],
        queryFn: async () => {
            // ENDPOINT: /api/v1/testsuite/project/{projectId}
            const { data } = await API.get(`/testsuite/project/${projectId}`, { params: { page, size, sort } });
            return data;
        },
        enabled: !!projectId && projectId > 0,
        placeholderData: (previousData) => previousData,
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

/**
 * Deploy Decision — pass rate vs threshold (default 95%).
 */
export const useDeployDecision = (testSuiteId: number | undefined) => {
    return useQuery<DeployDecisionResponse, ApiError>({
        queryKey: [TEST_SUITE_QUERY_KEY, 'deploy-decision', testSuiteId],
        queryFn: async () => {
            const { data } = await API.get(`/testsuite/${testSuiteId}/deploy-decision`);
            return data;
        },
        enabled: !!testSuiteId && testSuiteId > 0,
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
    return useMutation<TestSuite, ApiError, TestSuiteRunRequest>({
        mutationFn: async (payload: TestSuiteRunRequest) => {
            // ENDPOINT: POST /api/v1/testsuite/run
            const { data } = await API.post('/testsuite/run', payload);
            return data;
        },
        onSuccess: (newSuite: TestSuite) => {
            toast.success("Test Suite Run Dicatat", { description: `Run '${newSuite.name}' berhasil dibuat.` });
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'project', newSuite.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Mencatat Test Suite Run", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat membuat Test Suite Run.") });
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
    return useMutation<TestSuite, ApiError, FinalizeParams>({
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
        onError: (error) => {
            toast.error("Gagal Finalize Test Suite Run", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat memfinalisasi run.") });
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

    return useMutation<void, ApiError, DeleteTestSuiteParams>({
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
        onError: (error) => {
            toast.error("Gagal Hapus Test Suite Run", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat menghapus run.") });
        }
    });
};

/**
 * 7. Tambah satu hasil eksekusi test case ke run yang sudah ada.
 */
export const useAddRunDetail = (testSuiteId: number | undefined) => {
    const queryClient = useQueryClient();
    return useMutation<RunDetail, ApiError, RunDetailRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.post(`/testsuite/${testSuiteId}/detail`, payload);
            return data;
        },
        onSuccess: () => {
            toast.success("Hasil Test Case Ditambahkan");
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'detail', testSuiteId] });
        },
        onError: (error) => {
            toast.error("Gagal Menambah Hasil", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat menambah hasil test case.") });
        },
    });
};

/**
 * 8. Perbarui satu baris hasil eksekusi (RunDetail).
 */
interface UpdateRunDetailParams {
    runDetailId: number;
    idTestSuite: number; // untuk invalidasi cache detail suite induk
    payload: RunDetailRequest;
}

export const useUpdateRunDetail = () => {
    const queryClient = useQueryClient();
    return useMutation<RunDetail, ApiError, UpdateRunDetailParams>({
        mutationFn: async ({ runDetailId, payload }) => {
            const { data } = await API.put(`/testsuite/detail/${runDetailId}`, payload);
            return data;
        },
        onSuccess: (_data, variables) => {
            toast.success("Hasil Test Case Diperbarui");
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'detail', variables.idTestSuite] });
            queryClient.invalidateQueries({ queryKey: [TEST_RUN_DETAIL_QUERY_KEY, variables.runDetailId] });
        },
        onError: (error) => {
            toast.error("Gagal Memperbarui Hasil", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat memperbarui hasil.") });
        },
    });
};

/**
 * 9. Hapus satu baris hasil eksekusi (RunDetail).
 */
interface DeleteRunDetailParams {
    runDetailId: number;
    idTestSuite: number;
}

export const useDeleteRunDetail = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, DeleteRunDetailParams>({
        mutationFn: async ({ runDetailId }) => {
            await API.delete(`/testsuite/detail/${runDetailId}`);
        },
        onSuccess: (_data, variables) => {
            toast.success("Hasil Test Case Dihapus");
            queryClient.invalidateQueries({ queryKey: [TEST_SUITE_QUERY_KEY, 'detail', variables.idTestSuite] });
        },
        onError: (error) => {
            toast.error("Gagal Menghapus Hasil", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat menghapus hasil.") });
        },
    });
};

/**
 * 10. Export laporan Test Suite ke Excel (.xlsx) — memicu unduhan file di browser.
 */
export const useExportTestSuiteExcel = () => {
    return useMutation<void, ApiError, { testSuiteId: number; suiteName: string }>({
        mutationFn: async ({ testSuiteId, suiteName }) => {
            const response = await API.get(`/testsuite/${testSuiteId}/export/excel`, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `TestSuite_${suiteName.replace(/\s+/g, '_')}_${testSuiteId}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        },
        onError: (error) => {
            toast.error("Gagal Mengekspor Excel", { description: getTestSuiteErrorMessage(error, "Terjadi kesalahan saat mengunduh file Excel.") });
        },
    });
};
