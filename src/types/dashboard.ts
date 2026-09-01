// src/types/dashboard.ts
// Bentuk respons GET /api/v1/dashboard/project/{projectId} — lihat DashboardService/
// ProjectDashboardResponse di backend untuk definisi otoritatifnya.

export interface FeatureCoverageItem {
    featureId: number;
    featureName: string;
    testCaseCount: number;
}

export interface PassRateTrendPoint {
    testSuiteId: number;
    testSuiteName: string;
    startDate: string;
    endDate: string;
    totalPassed: number;
    totalFailed: number;
    totalError: number;
    totalSkipped: number;
    totalTests: number;
    passRatePercent: number;
}

export interface StatusBreakdown {
    totalPassed: number;
    totalFailed: number;
    totalError: number;
    totalSkipped: number;
    totalTests: number;
    passRatePercent: number;
}

export interface DeployDecisionSummary {
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

export interface ProjectDashboard {
    projectId: number;
    projectName: string;
    totalFeatures: number;
    totalTestCases: number;
    totalTestSuiteRuns: number;
    totalFinalizedRuns: number;
    statusBreakdown: StatusBreakdown;
    featureCoverage: FeatureCoverageItem[];
    passRateTrend: PassRateTrendPoint[];
    // null jika belum ada satu pun run yang difinalisasi di proyek ini.
    latestDeployDecision: DeployDecisionSummary | null;
}
