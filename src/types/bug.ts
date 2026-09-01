// src/types/bug.ts

// Harus sama persis dengan enum BugStatus di backend, urut sesuai 10-state lifecycle.
export type BugStatus =
    | 'NEW'
    | 'IN_ANALYSIS'
    | 'READY_FOR_DEVELOPMENT'
    | 'IN_DEVELOPMENT'
    | 'READY_FOR_TESTING'
    | 'IN_TESTING'
    | 'READY_FOR_UAT'
    | 'IN_UAT'
    | 'READY_FOR_DEPLOYMENT'
    | 'DEPLOYED';

export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Bug {
    id: number;
    projectId: number;
    projectName: string;
    testCaseId: number | null;
    testCaseName: string | null;
    testSuiteRunDetailId: number | null;
    testSuiteId: number | null;
    testSuiteName: string | null;
    title: string;
    description: string | null;
    severity: BugSeverity;
    status: BugStatus;
    reportedById: number;
    reportedByUsername: string;
    assignedToId: number | null;
    assignedToUsername: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BugRequest {
    projectId: number;
    testCaseId?: number | null;
    testSuiteRunDetailId?: number | null;
    title: string;
    description?: string | null;
    severity: BugSeverity;
    assignedToUserId?: number | null;
}

export interface UpdateBugParams extends BugRequest {
    bugId: number;
}
