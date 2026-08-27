// --- TIPE RESPONSE API ---

// PENTING: nilai status HARUS sama persis dengan backend ("PASSED"/"FAILED", bukan "PASS"/"FAIL").
// Lihat TestSuiteRunDetailRequest.status di spec backend.
export type RunDetailStatus = 'PASSED' | 'FAILED' | 'ERROR' | 'SKIPPED';

export interface RunDetail {
    id: number;
    idTestSuite: number;
    idTestCase: number;
    testCaseName: string;
    status: RunDetailStatus;
    actualResult: string;
    remarks: string | null;
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
    status: RunDetailStatus;
    actualResult?: string;
    remarks?: string | null;
    startDate: string;
    endDate?: string;
    elapsedTime?: number;
}

export interface TestSuiteRunRequest {
    projectId: number;
    name: string;
    description?: string;
    tag?: string | null;
    testStage: string;
    testEnvironment: string;
    executionType: string;
    hostname?: string;
    os?: string;
    version?: string;
    browser?: string;
    startDate: string;
    endDate?: string;
    elapsedTime: number;
    statusTotalPassed?: number;
    statusTotalFailed?: number;
    statusTotalError?: number;
    statusTotalSkipped?: number;
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

// --- DEPLOY DECISION ---
export interface DeployDecisionResponse {
    testSuiteId: number;
    testSuiteName: string;
    totalPassed: number;
    totalFailed: number;
    totalError: number;
    totalSkipped: number;
    totalTests: number;
    passRatePercent: number;
    thresholdPercent: number;
    deployRecommended: boolean;
    decision: 'LAYAK_DEPLOY' | 'TIDAK_LAYAK_DEPLOY';
    reason: string;
}
