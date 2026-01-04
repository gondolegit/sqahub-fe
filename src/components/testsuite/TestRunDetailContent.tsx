import React from 'react';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

// Import Hooks & Types (Anda perlu membuat hook ini)
import { useTestRunDetailById } from '@/hooks/useTestSuites'; 
import { type RunDetail } from '@/types/testSuite'; // Pastikan tipe RunDetail tersedia secara global

// Import UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface TestRunDetailContentProps {
    runDetailId: number;
}

// Helper untuk format durasi
const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms} ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} dtk`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${seconds % 60} dtk`;
};

// Helper untuk status badge
const getStatusBadgeClass = (status: RunDetail['status']) => {
    switch (status) {
        case 'PASSED': return 'bg-green-500 hover:bg-green-600';
        case 'FAILED': return 'bg-red-500 hover:bg-red-600';
        case 'ERROR': return 'bg-yellow-500 hover:bg-yellow-600';
        case 'SKIPPED': return 'bg-gray-500 hover:bg-gray-600';
        default: return 'bg-blue-500 hover:bg-blue-600';
    }
};

const TestRunDetailContent: React.FC<TestRunDetailContentProps> = ({ runDetailId }) => {
    
    // 🚨 PANGGILAN API TERAKHIR: GET /api/v1/testsuite/detail/{runDetailId}
    const { 
        data: detail, 
        isLoading, 
        isError 
    } = useTestRunDetailById(runDetailId);

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <p className="text-lg ml-2 text-gray-500">Memuat detail Test Case...</p>
            </div>
        );
    }

    if (isError || !detail) {
        return (
            <Card className="shadow-lg p-6">
                 <div className="flex items-center text-red-500">
                    <AlertTriangle className="h-5 w-5 mr-2" /> 
                    Gagal memuat detail log untuk Test Case ID: {runDetailId}.
                </div>
            </Card>
        );
    }
    
    const StatusIcon = detail.status === 'PASSED' ? CheckCircle : XCircle;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                    <StatusIcon className={`h-6 w-6 mr-3 ${detail.status === 'PASSED' ? 'text-green-500' : 'text-red-500'}`} />
                    {detail.testCaseName} (Case ID: {detail.idTestCase})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Status dan Waktu */}
                <div className="flex flex-wrap items-center gap-4">
                    <Badge className={`text-sm ${getStatusBadgeClass(detail.status)}`}>
                        {detail.status}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <strong>Durasi:</strong> {formatDuration(detail.elapsedTime)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Eksekusi oleh:</strong> {detail.executedByUsername}
                    </div>
                </div>

                <Separator />

                {/* Hasil Aktual */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-1">Hasil Aktual (Actual Result)</h3>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border whitespace-pre-wrap">
                        {detail.actualResult || "Tidak ada hasil aktual dicatat."}
                    </p>
                </div>

                {/* Catatan (Remarks) */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-1">Catatan (Remarks)</h3>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border whitespace-pre-wrap">
                        {detail.remarks || "Tidak ada catatan tambahan."}
                    </p>
                </div>
                
                {/* Waktu Mulai/Selesai */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Start Date:</strong> {new Date(detail.startDate).toLocaleString()}</p>
                    <p><strong>End Date:</strong> {detail.endDate ? new Date(detail.endDate).toLocaleString() : 'N/A'}</p>
                </div>

            </CardContent>
        </Card>
    );
};

export default TestRunDetailContent;