// src/types/traceability.ts
import type { RunDetailStatus } from '@/types/testSuite';

// Satu Test Case di dalam matriks, beserta status eksekusi TERAKHIRnya lintas semua Test Suite
// Run di proyek ini. `lastExecutionStatus` null berarti belum pernah dieksekusi sama sekali.
export interface TraceabilityTestCaseItem {
    testCaseId: number;
    testCaseName: string;
    tag: string | null;
    lastExecutionStatus: RunDetailStatus | null;
    lastExecutedAt: string | null;
    lastTestSuiteId: number | null;
    lastTestSuiteName: string | null;
}

// Satu baris "requirement" — di SQAHUB, Feature berperan sebagai unit requirement.
export interface TraceabilityFeatureItem {
    featureId: number;
    featureName: string;
    testCaseCount: number;
    executedCount: number;
    passedCount: number;
    failedCount: number;
    notExecutedCount: number;
    coveragePercent: number;
    testCases: TraceabilityTestCaseItem[];
}

export interface TraceabilityMatrixResponse {
    projectId: number;
    projectName: string;
    features: TraceabilityFeatureItem[];
}
