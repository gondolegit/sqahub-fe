// src/components/testsuite/TestRunDetailsTable.tsx

import React from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, Clock } from 'lucide-react';

// Import Types (Asumsi tipe ini sudah ada di src/types/testSuite.ts)
import type { RunDetailResponse } from '@/types/testSuite';

interface TestRunDetailsTableProps {
    data: RunDetailResponse[];
}

// --- Helper Functions ---

const getStatusIconAndStyle = (status: RunDetailResponse['status']) => {
    switch (status.toUpperCase()) {
        case 'PASS':
            return { Icon: CheckCircle, className: "bg-green-100 text-green-800 border-green-300" };
        case 'FAIL':
            return { Icon: XCircle, className: "bg-red-100 text-red-800 border-red-300" };
        case 'ERROR':
            return { Icon: AlertTriangle, className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
        case 'SKIPPED':
            return { Icon: MinusCircle, className: "bg-gray-100 text-gray-600 border-gray-300" };
        default:
            return { Icon: Clock, className: "bg-blue-100 text-blue-800 border-blue-300" };
    }
};

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)} dtk`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);
    return `${minutes} min ${remainingSeconds} dtk`;
};

const TestRunDetailsTable: React.FC<TestRunDetailsTableProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-md border">
                <p>Tidak ada detail eksekusi Test Case yang tercatat.</p>
            </div>
        );
    }
    
    // Sort data: FAIL/ERROR first
    const sortedData = data.slice().sort((a, b) => {
        const priority = ['FAIL', 'ERROR', 'PASS', 'SKIPPED'];
        return priority.indexOf(a.status) - priority.indexOf(b.status);
    });

    return (
        <div className="overflow-x-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px]">ID TC</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Nama Test Case</TableHead>
                        <TableHead className="w-[200px]">Durasi</TableHead>
                        <TableHead className="w-[300px]">Hasil Aktual / Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((detail) => {
                        const { Icon, className } = getStatusIconAndStyle(detail.status);
                        
                        return (
                            <TableRow key={detail.id} className="hover:bg-gray-50">
                                <TableCell className="font-semibold">TC-{detail.idTestCase}</TableCell>
                                
                                <TableCell>
                                    <Badge className={`text-xs font-semibold ${className}`}>
                                        <Icon className="h-3 w-3 mr-1" />
                                        {detail.status}
                                    </Badge>
                                </TableCell>
                                
                                <TableCell className="font-medium">{detail.testCaseName}</TableCell>
                                
                                <TableCell className="text-sm text-gray-700">
                                    {formatDuration(detail.elapsedTime)}
                                </TableCell>

                                <TableCell className="text-xs text-gray-600 max-w-sm truncate">
                                    <p className="font-semibold text-gray-800">{detail.actualResult}</p>
                                    {detail.remarks && <p className="mt-1 italic">[{detail.remarks}]</p>}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default TestRunDetailsTable;