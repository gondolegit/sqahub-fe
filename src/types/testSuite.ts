// src/types/testSuite.ts (VERSI PERBAIKAN LENGKAP)

// 🚨 Tipe untuk setiap detail eksekusi TestCase di dalam Test Suite
// PERBAIKAN NAMA TYPE DARI TestRunDetail MENJADI RunDetail
export interface RunDetail { // <-- PASTIKAN NAMA INI SAMA DENGAN KOMPONEN
    id: number;
    idTestSuite: number;
    idTestCase: number;
    testCaseName: string;
    status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED' | string; 
    actualResult: string;
    remarks: string;
    startDate: string; 
    endDate: string; 
    elapsedTime: number; 
    executedById: number;
    executedByUsername: string;
}

// 🚨 Tipe untuk keseluruhan Test Suite Run
export interface TestSuite { 
    id: number;
    projectId: number;
    projectName: string;
    name: string;
    description: string;
    tag: string | null;
    testStage: string;
    testEnvironment: string;
    hostname: string;
    os: string;
    version: string;
    browser: string;
    statusTotalPassed: number;
    statusTotalFailed: number;
    statusTotalError: number;
    statusTotalSkipped: number;
    startDate: string; 
    endDate: string | null; 
    elapsedTime: number; 
    executedById: number;
    executedByUsername: string;
    createdById: number;
    createdByUsername: string;
    createdAt: string;
    updatedAt: string;
    runDetails: RunDetail[]; // Menggunakan RunDetail yang sudah diperbarui
}

// 🚨 Tipe untuk Request POST (Test Suite Run)
export interface TestSuiteRunRequest {
    projectId: number;
    name: string;
    description: string;
    tag: string | null;
    testStage: string;
    testEnvironment: string;
    hostname: string;
    os: string;
    version: string;
    browser: string;
    startDate: string;
    endDate: string;
    elapsedTime: number;
    statusTotalPassed: number;
    statusTotalFailed: number;
    statusTotalError: number;
    statusTotalSkipped: number;
    runDetails: {
        idTestCase: number;
        status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED' | string;
        actualResult: string;
        remarks: string;
        startDate: string;
        endDate: string;
        elapsedTime: number;
    }[];
}

// 🚨 Tipe untuk Request PUT (Finalize)
export interface TestSuiteFinalizeRequest {
    idProject: number;
    name: string;
    description: string;
    tag: string | null;
    testStage: string;
    testEnvironment: string;
    hostname: string;
    os: string;
    version: string;
    browser: string;
    statusTotalPassed: number;
    statusTotalFailed: number;
    statusTotalError: number;
    statusTotalSkipped: number;
    elapsedTime: number;
    endDate: string;
}

export interface RunDetailResponse {
    id: number;
    idTestCase: number;
    testCaseName: string; // Asumsi dari join
    status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';
    actualResult: string;
    remarks: string | null;
    startDate: string; // ISO String
    endDate: string;   // ISO String
    elapsedTime: number; // Dalam detik
}

export interface TestRunDetail {
    id: number;
    projectId: number;
    name: string;
    description: string;
    tag: string | null;
    testStage: 'SIT' | 'UAT' | 'STAGING' | 'PRODUCTION';
    testEnvironment: 'Local' | 'Dev' | 'Staging' | 'Production';
    hostname: string;
    os: string;
    version: string;
    browser: string;
    
    // Status Aggregates
    statusTotalPassed: number;
    statusTotalFailed: number;
    statusTotalError: number;
    statusTotalSkipped: number;

    startDate: string;
    endDate: string;
    elapsedTime: number;

    testSuiteId: number;

    runDetails: RunDetailResponse[];
}