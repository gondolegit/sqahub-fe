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
    DeleteTestCaseParams,
    TestCaseImportResponse,
    BulkOperationResponse,
    RequirementImportResponse,
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

/**
 * 6b. IMPORT massal Test Case dari file CSV/Excel ke satu Feature.
 * Baris yang gagal validasi TIDAK melempar error di sini — backend tetap mengembalikan
 * 200 OK berisi ringkasan (importedCount/failedCount/errors), jadi pemanggil harus
 * memeriksa `failedCount` sendiri untuk memberi feedback per baris ke pengguna.
 */
export const useImportTestCases = (idFeature: number | undefined) => {
    const queryClient = useQueryClient();
    const importTestCases = async (file: File): Promise<TestCaseImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        // Jangan set Content-Type manual — biarkan browser menentukan multipart boundary-nya.
        // ENDPOINT: POST /api/v1/testcase/feature/{featureId}/import
        const response = await API.post(`/testcase/feature/${idFeature}/import`, formData);
        return response.data;
    };

    return useMutation<TestCaseImportResponse, ApiError, File>({
        mutationFn: importTestCases,
        onSuccess: (result) => {
            if (result.importedCount > 0) {
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', idFeature] });
            }
            if (result.failedCount === 0) {
                toast.success("Import Selesai", { description: `${result.importedCount} test case berhasil diimpor.` });
            } else if (result.importedCount > 0) {
                toast.warning("Import Sebagian Berhasil", {
                    description: `${result.importedCount} berhasil, ${result.failedCount} baris gagal — lihat rincian di bawah.`,
                });
            } else {
                toast.error("Import Gagal", { description: `Semua ${result.failedCount} baris gagal divalidasi — lihat rincian di bawah.` });
            }
        },
        onError: (error) => {
            toast.error("Gagal Mengimpor File", { description: getErrorMessage(error, "Terjadi kesalahan saat memproses file import.") });
        },
    });
};

/**
 * 6c. Unduh template Excel siap-isi untuk import Test Case.
 */
export const useDownloadImportTemplate = () => {
    return useMutation<void, ApiError, void>({
        mutationFn: async () => {
            const response = await API.get('/testcase/import/template', { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'template-import-test-case.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        },
        onError: (error) => {
            toast.error("Gagal Mengunduh Template", { description: getErrorMessage(error, "Terjadi kesalahan saat mengunduh template.") });
        },
    });
};

/**
 * 6c2. GENERATE Test Case dari file requirement (Module Name + Gherkin Given-When-Then), per
 * Project (bukan per Feature — satu file boleh mencakup beberapa Module/Feature sekaligus).
 * Baris yang gagal validasi TIDAK melempar error di sini, sama seperti useImportTestCases.
 */
export const useGenerateFromRequirements = (projectId: number | undefined) => {
    const queryClient = useQueryClient();
    const generate = async (file: File): Promise<RequirementImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        // ENDPOINT: POST /api/v1/testcase/project/{projectId}/generate-from-requirements
        const response = await API.post(`/testcase/project/${projectId}/generate-from-requirements`, formData);
        return response.data;
    };

    return useMutation<RequirementImportResponse, ApiError, File>({
        mutationFn: generate,
        onSuccess: (result) => {
            if (result.generatedCount > 0) {
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'project', projectId] });
                if (result.featuresCreatedCount > 0) {
                    queryClient.invalidateQueries({ queryKey: ['features', projectId] });
                }
            }
            if (result.failedCount === 0) {
                toast.success("Generate Selesai", { description: `${result.generatedCount} test case berhasil dibuat.` });
            } else if (result.generatedCount > 0) {
                toast.warning("Generate Sebagian Berhasil", {
                    description: `${result.generatedCount} berhasil, ${result.failedCount} baris gagal — lihat rincian di bawah.`,
                });
            } else {
                toast.error("Generate Gagal", { description: `Semua ${result.failedCount} baris gagal divalidasi — lihat rincian di bawah.` });
            }
        },
        onError: (error) => {
            toast.error("Gagal Memproses File", { description: getErrorMessage(error, "Terjadi kesalahan saat memproses file requirement.") });
        },
    });
};

/**
 * 6c3. Unduh template Excel siap-isi untuk generate Test Case dari requirement.
 */
export const useDownloadRequirementTemplate = () => {
    return useMutation<void, ApiError, void>({
        mutationFn: async () => {
            const response = await API.get('/testcase/generate-from-requirements/template', { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'template-generate-test-case-from-requirements.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        },
        onError: (error) => {
            toast.error("Gagal Mengunduh Template", { description: getErrorMessage(error, "Terjadi kesalahan saat mengunduh template.") });
        },
    });
};

/**
 * 6c4. GENERATE skrip automation Playwright (TypeScript, Page Object Model) dari file elemen
 * form, per Project. Respons berupa file .zip yang langsung dipicu untuk diunduh browser; jumlah
 * baris yang dilewati (kalau ada) dibaca dari header X-Generation-Warnings-Count agar pengguna
 * tahu untuk memeriksa README_WARNINGS.txt di dalam ZIP tanpa perlu membukanya lebih dulu.
 */
export const useGenerateAutomationScript = (projectId: number | undefined) => {
    return useMutation<number, ApiError, File>({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            // ENDPOINT: POST /api/v1/testcase/project/{projectId}/generate-automation-script
            const response = await API.post(`/testcase/project/${projectId}/generate-automation-script`, formData, {
                responseType: 'blob',
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'playwright-automation-scripts.zip';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            const warningsCount = parseInt(response.headers['x-generation-warnings-count'] ?? '0', 10);
            return Number.isNaN(warningsCount) ? 0 : warningsCount;
        },
        onSuccess: (warningsCount) => {
            if (warningsCount === 0) {
                toast.success("Skrip Automation Berhasil Dibuat", { description: "File .zip sudah diunduh." });
            } else {
                toast.warning("Skrip Automation Dibuat (Sebagian Baris Dilewati)", {
                    description: `${warningsCount} baris dilewati — lihat README_WARNINGS.txt di dalam file .zip.`,
                });
            }
        },
        onError: (error) => {
            toast.error("Gagal Generate Automation Script", { description: getErrorMessage(error, "Terjadi kesalahan saat memproses file.") });
        },
    });
};

/**
 * 6c5. Unduh template Excel siap-isi untuk generate automation script.
 */
export const useDownloadAutomationScriptTemplate = () => {
    return useMutation<void, ApiError, void>({
        mutationFn: async () => {
            const response = await API.get('/testcase/generate-automation-script/template', { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'template-generate-automation-script.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        },
        onError: (error) => {
            toast.error("Gagal Mengunduh Template", { description: getErrorMessage(error, "Terjadi kesalahan saat mengunduh template.") });
        },
    });
};

// #########################################
// --- HOOKS BULK ACTIONS ---
// #########################################

interface BulkDeleteParams {
    ids: number[];
    idFeature: number;
}

// 6d. BULK DELETE — beberapa Test Case sekaligus, satu ID gagal tidak menggagalkan yang lain
// (backend selalu HTTP 200 berisi ringkasan; pemanggil memeriksa failedCount sendiri).
export const useBulkDeleteTestCases = () => {
    const queryClient = useQueryClient();
    return useMutation<BulkOperationResponse, ApiError, BulkDeleteParams>({
        mutationFn: async ({ ids }) => {
            const response = await API.post('/testcase/bulk-delete', { ids });
            return response.data;
        },
        onSuccess: (result, variables) => {
            if (result.successCount > 0) {
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
            }
            if (result.failedCount === 0) {
                toast.success("Test Case Dihapus", { description: `${result.successCount} test case berhasil dihapus.` });
            } else if (result.successCount > 0) {
                toast.warning("Sebagian Berhasil Dihapus", {
                    description: `${result.successCount} berhasil, ${result.failedCount} gagal dihapus.`,
                });
            } else {
                toast.error("Gagal Menghapus", { description: `Semua ${result.failedCount} test case gagal dihapus.` });
            }
        },
        onError: (error) => {
            toast.error("Gagal Menghapus Test Case", { description: getErrorMessage(error, "Terjadi kesalahan saat menghapus.") });
        },
    });
};

interface BulkTagParams {
    ids: number[];
    tag: string;
    idFeature: number;
}

// 6e. BULK UPDATE TAG — set tag yang sama untuk beberapa Test Case sekaligus
export const useBulkUpdateTag = () => {
    const queryClient = useQueryClient();
    return useMutation<BulkOperationResponse, ApiError, BulkTagParams>({
        mutationFn: async ({ ids, tag }) => {
            const response = await API.put('/testcase/bulk-tag', { ids, tag });
            return response.data;
        },
        onSuccess: (result, variables) => {
            if (result.successCount > 0) {
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
            }
            if (result.failedCount === 0) {
                toast.success("Tag Diperbarui", { description: `Tag berhasil diubah untuk ${result.successCount} test case.` });
            } else {
                toast.warning("Sebagian Berhasil Diperbarui", {
                    description: `${result.successCount} berhasil, ${result.failedCount} gagal diperbarui.`,
                });
            }
        },
        onError: (error) => {
            toast.error("Gagal Memperbarui Tag", { description: getErrorMessage(error, "Terjadi kesalahan saat memperbarui tag.") });
        },
    });
};

interface BulkMoveParams {
    ids: number[];
    targetFeatureId: number;
    idFeature: number; // Feature ASAL, dipakai untuk invalidasi list halaman saat ini
}

// 6f. BULK MOVE — pindahkan beberapa Test Case sekaligus ke Feature lain
export const useBulkMoveTestCases = () => {
    const queryClient = useQueryClient();
    return useMutation<BulkOperationResponse, ApiError, BulkMoveParams>({
        mutationFn: async ({ ids, targetFeatureId }) => {
            const response = await API.put('/testcase/bulk-move', { ids, targetFeatureId });
            return response.data;
        },
        onSuccess: (result, variables) => {
            if (result.successCount > 0) {
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.idFeature] });
                queryClient.invalidateQueries({ queryKey: [TC_QUERY_KEY, 'feature', variables.targetFeatureId] });
            }
            if (result.failedCount === 0) {
                toast.success("Test Case Dipindahkan", { description: `${result.successCount} test case berhasil dipindahkan.` });
            } else {
                toast.warning("Sebagian Berhasil Dipindahkan", {
                    description: `${result.successCount} berhasil, ${result.failedCount} gagal dipindahkan.`,
                });
            }
        },
        onError: (error) => {
            toast.error("Gagal Memindahkan Test Case", { description: getErrorMessage(error, "Terjadi kesalahan saat memindahkan.") });
        },
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
