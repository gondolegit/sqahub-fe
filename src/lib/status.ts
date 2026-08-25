// src/lib/status.ts
// Sumber tunggal untuk styling status hasil eksekusi test case (RunDetail.status),
// menggantikan implementasi getStatus*/getStatusBadge yang sebelumnya diduplikasi
// di beberapa komponen (TestSuiteDetailDialog, RunDetailList, dll).

import { CheckCircle, XCircle, AlertTriangle, Ban, Info, type LucideIcon } from 'lucide-react';
import type { RunDetail } from '@/types/testSuite';

type RunStatus = RunDetail['status'];

export interface StatusConfig {
    label: string;
    icon: LucideIcon;
    iconClassName: string; // warna ikon, mis. "text-green-500"
    badgeClassName: string; // untuk Badge datar, mis. "bg-green-100 text-green-800"
    cardClassName: string; // untuk kartu/border, mis. "bg-green-100 border-green-300 text-green-800"
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    PASS: {
        label: 'PASS',
        icon: CheckCircle,
        iconClassName: 'text-green-500',
        badgeClassName: 'bg-green-100 text-green-800',
        cardClassName: 'bg-green-100 border-green-300 text-green-800',
    },
    FAIL: {
        label: 'FAIL',
        icon: XCircle,
        iconClassName: 'text-red-500',
        badgeClassName: 'bg-red-100 text-red-800',
        cardClassName: 'bg-red-100 border-red-300 text-red-800',
    },
    ERROR: {
        label: 'ERROR',
        icon: AlertTriangle,
        iconClassName: 'text-yellow-600',
        badgeClassName: 'bg-yellow-100 text-yellow-800',
        cardClassName: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    },
    SKIPPED: {
        label: 'SKIPPED',
        icon: Ban,
        iconClassName: 'text-gray-500',
        badgeClassName: 'bg-gray-100 text-gray-800',
        cardClassName: 'bg-gray-100 border-gray-300 text-gray-800',
    },
};

const DEFAULT_STATUS_CONFIG: Omit<StatusConfig, 'label'> = {
    icon: Info,
    iconClassName: 'text-gray-500',
    badgeClassName: 'bg-gray-100 text-gray-800',
    cardClassName: 'bg-gray-100 border-gray-300 text-gray-800',
};

export const getStatusConfig = (status: RunStatus): StatusConfig =>
    STATUS_CONFIG[status.toUpperCase()] ?? { ...DEFAULT_STATUS_CONFIG, label: status };

// Prioritas urutan saat menampilkan hasil eksekusi: FAIL/ERROR ditampilkan lebih dulu.
const STATUS_SORT_ORDER: Record<string, number> = { FAIL: 0, ERROR: 1, PASS: 2, SKIPPED: 3 };

export const statusRank = (status: RunStatus): number => STATUS_SORT_ORDER[status.toUpperCase()] ?? 99;
