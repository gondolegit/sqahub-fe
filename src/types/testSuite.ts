    // src/types/testSuite.ts (FINAL & CLEANED UP)

    // Tipe untuk setiap detail eksekusi TestCase di dalam Test Suite (Response API)
    export interface RunDetail { 
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
        runDetails: RunDetail[]; // Di dalam TestSuite
    }

    // Tipe untuk keseluruhan Test Suite Run (Response API)
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
        runDetails: RunDetail[]; 
    }


    // --- TIPE REQUEST (CREATE) ---

    // 1. Detail minimal yang dibutuhkan saat membuat Run baru (Sub-object di Request)
    export interface RunDetailRequest { // Ganti nama dari NewRunDetailRequest agar lebih ringkas
        idTestCase: number;
        // Nilai default yang diisi saat inisiasi Run baru
        status: 'PENDING' | 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED' | string; 
        actualResult: string;
        remarks: string;
        startDate: string; // ISO Date String
        endDate: string; // ISO Date String
        elapsedTime: number; // Dalam detik
    }

    // 2. Payload lengkap untuk membuat Run Test baru (CREATE)
    // Mengganti nama NewTestSuiteRunRequest menjadi TestSuiteRunRequest
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

        // Array dari Test Case yang dipilih
        runDetails: RunDetailRequest[]; // Menggunakan tipe yang sudah diringkas
    }

    // --- TIPE REQUEST (UPDATE) ---

    // Tipe untuk Request PUT (Finalize)
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