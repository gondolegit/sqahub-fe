// src/lib/bugStatus.ts
// Sumber tunggal untuk styling & urutan status Bug (10-state lifecycle). Peta transisi di bawah
// HARUS tetap sinkron dengan ALLOWED_TRANSITIONS di BugService.java (backend) — daftar ini hanya
// dipakai untuk membatasi pilihan di dropdown FE; backend tetap menegakkan validasi sesungguhnya.
import type { BugStatus, BugSeverity } from '@/types/bug';

export const BUG_STATUS_ORDER: BugStatus[] = [
    'NEW', 'IN_ANALYSIS', 'READY_FOR_DEVELOPMENT', 'IN_DEVELOPMENT', 'READY_FOR_TESTING',
    'IN_TESTING', 'READY_FOR_UAT', 'IN_UAT', 'READY_FOR_DEPLOYMENT', 'DEPLOYED',
];

const ALLOWED_TRANSITIONS: Record<BugStatus, BugStatus[]> = {
    NEW: ['IN_ANALYSIS'],
    IN_ANALYSIS: ['READY_FOR_DEVELOPMENT'],
    READY_FOR_DEVELOPMENT: ['IN_DEVELOPMENT'],
    IN_DEVELOPMENT: ['READY_FOR_TESTING'],
    READY_FOR_TESTING: ['IN_TESTING'],
    IN_TESTING: ['READY_FOR_UAT', 'IN_DEVELOPMENT'],
    READY_FOR_UAT: ['IN_UAT'],
    IN_UAT: ['READY_FOR_DEPLOYMENT', 'IN_DEVELOPMENT'],
    READY_FOR_DEPLOYMENT: ['DEPLOYED'],
    DEPLOYED: ['IN_ANALYSIS'],
};

export const getAllowedNextStatuses = (current: BugStatus): BugStatus[] => ALLOWED_TRANSITIONS[current] ?? [];

const STATUS_BADGE_CLASS: Record<BugStatus, string> = {
    NEW: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
    IN_ANALYSIS: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    READY_FOR_DEVELOPMENT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
    IN_DEVELOPMENT: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    READY_FOR_TESTING: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
    IN_TESTING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    READY_FOR_UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
    IN_UAT: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
    READY_FOR_DEPLOYMENT: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
    DEPLOYED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
};

export const getBugStatusBadgeClass = (status: BugStatus): string =>
    STATUS_BADGE_CLASS[status] ?? 'bg-muted text-muted-foreground';

const SEVERITY_BADGE_CLASS: Record<BugSeverity, string> = {
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export const getSeverityBadgeClass = (severity: BugSeverity): string =>
    SEVERITY_BADGE_CLASS[severity] ?? 'bg-muted text-muted-foreground';
