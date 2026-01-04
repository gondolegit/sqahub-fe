// src/components/reports/RunDetailList.tsx

import React from 'react';
// 🚨 PERBAIKAN IMPOR: Gunakan tipe RunDetail yang sudah diselaraskan
import { type RunDetail } from '@/types/testSuite'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertOctagon, Ban } from 'lucide-react';

interface RunDetailListProps {
    // 🚨 PERBAIKAN TIPE DATA: Cukup gunakan RunDetail
    runDetails: RunDetail[]; 
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'PASS': return { label: 'PASS', className: 'bg-green-100 text-green-800', Icon: Check };
        case 'FAIL': return { label: 'FAIL', className: 'bg-red-100 text-red-800', Icon: X };
        case 'ERROR': return { label: 'ERROR', className: 'bg-yellow-100 text-yellow-800', Icon: AlertOctagon };
        case 'SKIPPED': return { label: 'SKIPPED', className: 'bg-gray-100 text-gray-800', Icon: Ban };
        default: return { label: status, className: 'bg-gray-500 text-white', Icon: Check };
    }
};

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
                        const status = getStatusBadge(detail.status);
                        
                        return (
                            // Menggunakan id (dari RunDetail) sebagai key, atau idTestCase jika id RunDetail tidak unik
                            <TableRow key={detail.id} className={detail.status !== 'PASS' ? 'bg-red-50/50 hover:bg-red-50' : ''}>
                                <TableCell className="font-semibold">TC-{detail.idTestCase}</TableCell>
                                <TableCell>
                                    <Badge className={`font-semibold ${status.className}`}>
                                        <status.Icon className="h-3 w-3 mr-1" /> {status.label}
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