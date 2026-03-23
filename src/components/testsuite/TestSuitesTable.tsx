// src/components/TestSuitesTable.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Eye, Trash, CheckCircle, XCircle, AlertTriangle, Clock, Ban, Loader2 
} from 'lucide-react';

// Import Types
import { type TestSuite } from '@/types/testSuite'; 
import { ConfirmationDialog } from '@/components/custom/ConfirmationDialog'; 
import { useDeleteTestSuite } from '@/hooks/useTestSuites'; 

// Import UI Components (Shadcn/UI)
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; 

// --- Helper Functions ---
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
    if (suite.statusTotalPassed === 0 && suite.statusTotalFailed === 0 && suite.statusTotalError === 0) {
        return { label: "SKIPPED", Icon: Ban, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" };
    }
    return { label: "COMPLETED", Icon: CheckCircle, className: "bg-gray-100 text-gray-800 hover:bg-gray-100" };
};

// 🌟 PERBAIKAN FUNGSI FORMAT DURASI 🌟
const formatDuration = (secondsInput: number): string => {
    // Pembulatan ke bawah agar tampilan lebih rapi
    const seconds = Math.floor(secondsInput); 

    if (seconds < 60) return `${seconds} dtk`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} dtk` : `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60; 
    
    return remainingMinutes > 0 
        ? `${hours} jam ${remainingMinutes} min` 
        : `${hours} jam`;
};
// -------------------------------------

interface TestSuitesTableProps {
    data: TestSuite[] | undefined;
    isLoading: boolean;
    projectId: number;
}

const TestSuitesTable: React.FC<TestSuitesTableProps> = ({ data, isLoading, projectId }) => {
    const navigate = useNavigate();
    const deleteMutation = useDeleteTestSuite();
    
    // State untuk Confirmation Dialog
    const [suiteToDelete, setSuiteToDelete] = useState<TestSuite | null>(null);

    // ✅ PERBAIKAN FINAL: Menggunakan kedua ID untuk navigasi
    // Handler Navigasi ke Halaman Detail Run (Laporan Eksekusi)
    const handleViewDetail = (suiteId: number) => {
        // Menggunakan format URL yang memberikan konteks Proyek dan Run:
        // /projects/:projectId/test-runs/:runId
        navigate(`/test-suites/detail/${suiteId}`); 
        
    };

    // Handler konfirmasi delete (tidak ada perubahan)
    const handleDeleteSuite = () => {
        if (!suiteToDelete || deleteMutation.isPending) return;

        // Mengirim objek payload yang sesuai dengan definisi useDeleteTestSuite
        deleteMutation.mutate({ 
            testSuiteId: suiteToDelete.id, 
            projectId: projectId 
        }, {
            onSuccess: () => {
                setSuiteToDelete(null);
            },
            onError: () => {
                setSuiteToDelete(null);
            }
        });
    };
    
    // --- SKELTON LOADING ---
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-2 border rounded-md">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // --- DATA KOSONG ---
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
                <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                <p className="font-semibold">Belum ada Test Run yang tereksekusi untuk proyek ini (ID: {projectId}).</p>
                <p className="text-sm">Silahkan mulai eksekusi Test Suite Run yang baru.</p>
            </div>
        );
    }
    
    return (
        <>
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
                            
                            // Cek apakah run yang sedang di-loop adalah yang sedang dihapus
                            const isDeletingThisSuite = deleteMutation.isPending && suiteToDelete?.id === suite.id;

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
                                    <TableCell 
                                        className="font-medium max-w-[200px] truncate cursor-pointer hover:text-blue-600" 
                                        title={suite.name}
                                        onClick={() => handleViewDetail(suite.id)} // ✅ Menggunakan handleViewDetail yang sudah diperbaiki
                                    >
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
                                        {/* Mengirimkan elapsedTime yang sudah dalam detik */}
                                        {suite.endDate ? formatDuration(suite.elapsedTime) : 'N/A'}
                                    </TableCell>
                                    
                                    {/* Aksi */}
                                    <TableCell className="text-right flex space-x-2 justify-end">
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => handleViewDetail(suite.id)} // ✅ Menggunakan handleViewDetail yang sudah diperbaiki
                                            title="Lihat Detail Run"
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            onClick={() => setSuiteToDelete(suite)} 
                                            title="Hapus Run"
                                            disabled={deleteMutation.isPending}
                                        >
                                            {isDeletingThisSuite ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Dialog untuk Delete */}
            {suiteToDelete && (
                <ConfirmationDialog
                    open={!!suiteToDelete}
                    onOpenChange={() => setSuiteToDelete(null)}
                    onConfirm={handleDeleteSuite}
                    title="Hapus Test Suite Run"
                    description={`Apakah Anda yakin ingin menghapus Test Suite Run '${suiteToDelete.name}'? Tindakan ini tidak dapat dibatalkan. ID Run: ${suiteToDelete.id}`}
                    confirmText="Ya, Hapus Run"
                    isDeleting={deleteMutation.isPending}
                />
            )}
        </>
    );
};

export default TestSuitesTable;