// src/components/reports/RunDetailList.tsx

import React from 'react';
// 🚨 PERBAIKAN IMPOR: Gunakan tipe RunDetail yang sudah diselaraskan
import { type RunDetail } from '@/types/testSuite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusConfig } from '@/lib/status';

interface RunDetailListProps {
    // 🚨 PERBAIKAN TIPE DATA: Cukup gunakan RunDetail
    runDetails: RunDetail[];
}

const RunDetailList: React.FC<RunDetailListProps> = ({ runDetails }) => {

    return (
        <div className="overflow-x-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px]">ID TC</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Nama Test Case</TableHead>
                        <TableHead>Hasil Aktual</TableHead>
                        <TableHead className="w-[200px]">Catatan (Remarks)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runDetails.map((detail) => {
                        const status = getStatusConfig(detail.status);
                        const StatusIcon = status.icon;

                        return (
                            // Menggunakan id (dari RunDetail) sebagai key, atau idTestCase jika id RunDetail tidak unik
                            <TableRow key={detail.id} className={detail.status !== 'PASS' ? 'bg-red-50/50 hover:bg-red-50' : ''}>
                                <TableCell className="font-semibold">TC-{detail.idTestCase}</TableCell>
                                <TableCell>
                                    <Badge className={`font-semibold ${status.badgeClassName}`}>
                                        <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                                    </Badge>
                                </TableCell>
                                {/* 🚨 Menggunakan testCaseName dari RunDetail */}
                                <TableCell className="font-medium">{detail.testCaseName}</TableCell>
                                <TableCell className="text-sm">{detail.actualResult}</TableCell>
                                <TableCell className="text-xs text-gray-600 max-w-xs whitespace-pre-wrap">{detail.remarks || '-'}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default RunDetailList;