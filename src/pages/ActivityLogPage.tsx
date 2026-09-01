// src/pages/ActivityLogPage.tsx
import React, { useState } from 'react';
import { ScrollText, Loader2, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

import { useActivityLog } from '@/hooks/useActivityLog';
import { formatDate } from '@/lib/utils';

const PAGE_SIZE = 20;

const actionBadgeClass = (action: string): string => {
    const a = action.toUpperCase();
    if (a.includes('DELETE') || a.includes('REVOKE') || a.includes('REMOVE')) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30';
    if (a.includes('CREATE') || a.includes('ADD') || a.includes('REGISTER')) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
    if (a.includes('LOGIN') || a.includes('LOGOUT') || a.includes('AUTH')) return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30';
    return 'bg-muted text-muted-foreground border-border';
};

const ActivityLogPage: React.FC = () => {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useActivityLog({ page, size: PAGE_SIZE });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ScrollText className="h-7 w-7 text-primary" /> Activity Log
                </h1>
                <p className="text-muted-foreground mt-1">Riwayat aktivitas seluruh sistem (khusus Admin).</p>
            </div>

            <Card className="shadow-md border-none overflow-hidden">
                <CardHeader className="bg-muted/40 border-b">
                    <CardTitle className="text-lg">Log Aktivitas</CardTitle>
                    <CardDescription>{data ? `${data.totalElements} entri tercatat` : 'Memuat...'}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isError ? (
                        <div className="p-10 text-center text-destructive flex flex-col items-center gap-2">
                            <AlertTriangle className="h-8 w-8" />
                            Gagal memuat log aktivitas. Pastikan Anda memiliki akses Admin.
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center p-20 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Memuat log...
                        </div>
                    ) : !data || data.content.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground">Belum ada aktivitas tercatat.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[170px]">Waktu</TableHead>
                                            <TableHead className="w-[90px]">User ID</TableHead>
                                            <TableHead className="w-[150px]">Aksi</TableHead>
                                            <TableHead>Entitas</TableHead>
                                            <TableHead>Detail</TableHead>
                                            <TableHead className="w-[130px]">IP</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.content.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(log.createdAt, true)}
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">{log.idUser ?? '—'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`font-semibold ${actionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.entityType} <span className="text-muted-foreground">#{log.entityId}</span>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={log.details}>
                                                    {log.details || '-'}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">{log.ipAddress || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {data.totalPages > 1 && (
                                <div className="px-4 pb-4">
                                    <Pagination
                                        page={data.number}
                                        totalPages={data.totalPages}
                                        totalElements={data.totalElements}
                                        pageSize={data.size}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLogPage;
