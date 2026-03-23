// --- TIPE RESPONSE API ---

export interface RunDetail { 
    id: number;
    idTestSuite: number;
    idTestCase: number;
    testCaseName: string;
    // Menambahkan 'PENDING' karena biasanya ini status awal sebelum run selesai
    status: 'PENDING' | 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED' | string; 
    actualResult: string;
    remarks: string | null; // PERBAIKAN: Diperbolehkan null agar tidak error ts(2322)
    startDate: string; 
    endDate: string; 
    elapsedTime: number; 
    executedById: number;
    executedByUsername: string;
}

export interface TestSuite {
    id: number;
    projectId: number;
    projectName: string;
    name: string;
    description: string;
    tag: string | null;
    testStage: string;
    testEnvironment: string;
    executionType: string; 
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

export interface RunDetailRequest {
    idTestCase: number;
    status: 'PENDING' | 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED' | string; 
    actualResult: string;
    remarks?: string | null | undefined; // PERBAIKAN: Tambahkan null/undefined untuk fleksibilitas input
    startDate: string; 
    endDate: string; 
    elapsedTime: number; 
}

export interface TestSuiteRunRequest { 
    projectId: number;
    name: string;
    description: string;
    tag?: string | null;
    testStage: string; 
    testEnvironment: string; 
    executionType: string;
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
    runDetails: RunDetailRequest[]; 
}

// --- TIPE REQUEST (UPDATE/FINALIZE) ---

export interface TestSuiteFinalizeRequest {
    idProject: number;
    name: string;
    description: string;
    tag: string | null;
    testStage: string;
    testEnvironment: string;
    executionType: string;
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