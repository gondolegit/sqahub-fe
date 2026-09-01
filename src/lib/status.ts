// src/lib/status.ts
// Sumber tunggal untuk styling status hasil eksekusi test case (RunDetail.status),
// menggantikan implementasi getStatus*/getStatusBadge yang sebelumnya diduplikasi
// di beberapa komponen (TestSuiteDetailDialog, RunDetailList, dll).
//
// PENTING: nilai status HARUS "PASSED"/"FAILED"/"ERROR"/"SKIPPED" — sama persis dengan
// backend (bukan "PASS"/"FAIL" seperti versi lama kode ini).

import { CheckCircle, XCircle, AlertTriangle, Ban, Info, type LucideIcon } from 'lucide-react';
import type { RunDetail } from '@/types/testSuite';

type RunStatus = RunDetail['status'];

export interface StatusConfig {
    label: string;
    icon: LucideIcon;
    iconClassName: string; // warna ikon, mis. "text-green-500"
    badgeClassName: string; // untuk Badge datar, mis. "bg-green-100 text-green-800"
    cardClassName: string; // untuk kartu/border, mis. "bg-green-100 border-green-300 text-green-800"
    barClassName: string; // untuk aksen solid (mis. strip warna di atas kartu), mis. "bg-green-500"
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    PASSED: {
        label: 'PASSED',
        icon: CheckCircle,
        iconClassName: 'text-green-500 dark:text-green-400',
        badgeClassName: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
        cardClassName: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400',
        barClassName: 'bg-emerald-500',
    },
    FAILED: {
        label: 'FAILED',
        icon: XCircle,
        iconClassName: 'text-red-500 dark:text-red-400',
        badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
        cardClassName: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400',
        barClassName: 'bg-rose-500',
    },
    ERROR: {
        label: 'ERROR',
        icon: AlertTriangle,
        iconClassName: 'text-yellow-600 dark:text-yellow-400',
        badgeClassName: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400',
        cardClassName: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400',
        barClassName: 'bg-amber-500',
    },
    SKIPPED: {
        label: 'SKIPPED',
        icon: Ban,
        iconClassName: 'text-gray-500 dark:text-gray-400',
        badgeClassName: 'bg-muted text-muted-foreground',
        cardClassName: 'bg-muted border-border text-muted-foreground',
        barClassName: 'bg-slate-400',
    },
};

const DEFAULT_STATUS_CONFIG: Omit<StatusConfig, 'label'> = {
    icon: Info,
    iconClassName: 'text-gray-500 dark:text-gray-400',
    badgeClassName: 'bg-muted text-muted-foreground',
    cardClassName: 'bg-muted border-border text-muted-foreground',
    barClassName: 'bg-slate-400',
};

export const getStatusConfig = (status: RunStatus): StatusConfig =>
    STATUS_CONFIG[status.toUpperCase()] ?? { ...DEFAULT_STATUS_CONFIG, label: status };

// Prioritas urutan saat menampilkan hasil eksekusi: FAILED/ERROR ditampilkan lebih dulu.
const STATUS_SORT_ORDER: Record<string, number> = { FAILED: 0, ERROR: 1, PASSED: 2, SKIPPED: 3 };

export const statusRank = (status: RunStatus): number => STATUS_SORT_ORDER[status.toUpperCase()] ?? 99;
