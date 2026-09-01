// src/types/testCase.ts

/**
 * 🚨 CATATAN: Definisi ini dipindahkan ke sini untuk konvensi terbaik.
 * Ini adalah struktur data TestCase dari respons API.
 */
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

// --- Import massal (CSV/Excel) ---

export interface TestCaseImportRowError {
    rowNumber: number;
    testCaseName: string | null;
    message: string;
}

export interface TestCaseImportResponse {
    totalRows: number;
    importedCount: number;
    failedCount: number;
    errors: TestCaseImportRowError[];
}

// --- Bulk actions (delete / tag / move) ---

export interface BulkOperationError {
    id: number;
    message: string;
}

export interface BulkOperationResponse {
    totalRequested: number;
    successCount: number;
    failedCount: number;
    errors: BulkOperationError[];
}