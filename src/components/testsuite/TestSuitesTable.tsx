import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Eye, Trash, Loader2, CheckCircle, XCircle, AlertTriangle, Clock 
} from 'lucide-react';

// Import Types
import { type TestSuite } from '@/types/testSuite'; 
// Asumsi Anda punya hook untuk delete, dan dialog konfirmasi (sudah dibahas sebelumnya)
// import { useDeleteTestSuite } from '@/hooks/useTestSuites'; 

// Import UI Components (Diasumsikan menggunakan Shadcn/UI)
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TestSuitesTableProps {
    data: TestSuite[];
    projectId: number;
    // Tambahkan prop handler untuk delete dan dialog konfirmasi jika diperlukan
    // onDeletePrepare: (suite: TestSuite) => void;
}

// --- Helper Functions (Pindahkan ini ke utilitas global jika sudah ada) ---
const getSuiteStatus = (suite: TestSuite) => {
    if (!suite.endDate) {
        return { label: "IN PROGRESS", Icon: Clock, className: "bg-blue-100 text-blue-800 hover:bg-blue-100" };
    }
    if (suite.statusTotalFailed > 0 || suite.statusTotalError > 0) {
        return { label: "FAILED", Icon: XCircle, className: "bg-red-100 text-red-800 hover:bg-red-100" };
    }
    if (suite.statusTotalPassed > 0) {
        return { label: "PASSED", Icon: CheckCircle, className: "bg-green-100 text-green-800 hover:bg-green-100" };
    }
    return { label: "COMPLETED", Icon: CheckCircle, className: "bg-gray-100 text-gray-800 hover:bg-gray-100" };
};

const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms} ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} dtk`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours} jam ${minutes % 60} min`;
};

const TestSuitesTable: React.FC<TestSuitesTableProps> = ({ data, projectId }) => {
    const navigate = useNavigate();

    // Handler Navigasi ke Halaman Detail Run (Langkah 3)
    const handleViewDetail = (suiteId: number) => {
        // Menggunakan rute yang sudah kita sepakati: /projects/:projectId/test-suites/:testSuiteId
        navigate(`/test-suites/${suiteId}`); 
        // Catatan: Jika Anda tidak ingin menggunakan projectId di URL detail, 
        // rute bisa disederhanakan menjadi `/test-suites/${suiteId}` saja.
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p>Belum ada Test Run yang tereksekusi untuk proyek ini.</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Nama Run</TableHead>
                        <TableHead>Waktu Mulai</TableHead>
                        <TableHead className="text-center">Passed</TableHead>
                        <TableHead className="text-center">Failed/Error</TableHead>
                        <TableHead className="text-center">Durasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((suite) => {
                        const status = getSuiteStatus(suite);
                        const totalFailedError = suite.statusTotalFailed + suite.statusTotalError;
                        
                        return (
                            <TableRow key={suite.id}>
                                {/* Status Badge */}
                                <TableCell>
                                    <Badge className={`font-semibold ${status.className}`}>
                                        <status.Icon className="h-4 w-4 mr-1.5" />
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                
                                {/* Nama Run */}
                                <TableCell className="font-medium max-w-[200px] truncate" title={suite.name}>
                                    {suite.name}
                                </TableCell>
                                
                                {/* Waktu Mulai */}
                                <TableCell>
                                    {new Date(suite.startDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                </TableCell>
                                
                                {/* Total Passed */}
                                <TableCell className="text-center text-green-600 font-semibold">
                                    {suite.statusTotalPassed}
                                </TableCell>
                                
                                {/* Total Failed/Error */}
                                <TableCell className="text-center text-red-600 font-semibold">
                                    {totalFailedError}
                                </TableCell>
                                
                                {/* Durasi */}
                                <TableCell className="text-center text-gray-600">
                                    {suite.endDate ? formatDuration(suite.elapsedTime) : 'N/A'}
                                </TableCell>
                                
                                {/* Aksi */}
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => handleViewDetail(suite.id)}
                                        title="Lihat Detail Run"
                                    >
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        // onClick={() => onDeletePrepare(suite)} // Uncomment ini jika handler sudah ada
                                        title="Hapus Run"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default TestSuitesTable;