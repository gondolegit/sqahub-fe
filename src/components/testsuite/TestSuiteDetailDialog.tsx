import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Loader2, Zap, Clock, Info, Frown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// --- PERBAIKAN IMPORT TIPE DATA & HOOK ---
// 🚨 PERBAIKAN 1: Ganti useTestSuiteDetail menjadi useTestSuiteById
import { useTestSuiteById } from '@/hooks/useTestSuites';
// 🚨 PERBAIKAN 2: Ganti TestRunDetail menjadi RunDetail
import type { RunDetail, TestSuite } from '@/types/testSuite';
// Import tipe data dari file types/testSuite.ts
import { formatDate, formatElapsedTime } from '@/lib/utils'; // Asumsi utilitas sudah ada
import { getStatusConfig, statusRank } from '@/lib/status';

// --- PROPS KOMPONEN ---
interface TestSuiteDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    testSuiteId: number | null;
}

// --- KOMPONEN UTAMA ---
const TestSuiteDetailDialog: React.FC<TestSuiteDetailDialogProps> = ({ 
    open, 
    onOpenChange, 
    testSuiteId 
}) => {
    
    // Ambil data Test Suite berdasarkan ID
    // 🚨 Menggunakan useTestSuiteById (seperti yang diekspor di useTestSuites.ts)
    const { data: suite, isLoading, isError } = useTestSuiteById(testSuiteId || -1);

    // --- RENDER DETAIL PER TEST CASE ---
    // 🚨 Menggunakan RunDetail
    const renderRunDetail = (detail: RunDetail) => {
        const statusConfig = getStatusConfig(detail.status);
        const StatusIcon = statusConfig.icon;
        return (
        <Card key={detail.id} className={`shadow-sm mb-4 ${statusConfig.cardClassName} border`}>
            <CardHeader className="flex flex-row justify-between items-center p-3">
                <CardTitle className="text-md font-bold flex items-center">
                    <StatusIcon className={`h-4 w-4 mr-1 ${statusConfig.iconClassName}`} />
                    TC-{detail.idTestCase}: {detail.testCaseName}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                    Waktu: {formatElapsedTime(detail.elapsedTime)}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm space-y-2">
                <div>
                    <strong className="block text-gray-600">Actual Result:</strong>
                    <p className="whitespace-pre-wrap">{detail.actualResult}</p>
                </div>
                {detail.remarks && (
                    <div>
                        <strong className="block text-gray-600">Remarks/Bug:</strong>
                        <p className="whitespace-pre-wrap font-mono text-xs">{detail.remarks}</p>
                    </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 pt-1 border-t mt-2">
                    <span>Start: {formatDate(detail.startDate, true)}</span>
                    {/* Pastikan endDate tidak null sebelum memanggil formatDate */}
                    <span>End: {detail.endDate ? formatDate(detail.endDate, true) : 'N/A'}</span>
                </div>
            </CardContent>
        </Card>
        );
    };

    // --- RENDER STATISTIK RINGKAS ---
    const renderSummary = (suite: TestSuite) => {
        const total = suite.statusTotalPassed + suite.statusTotalFailed + suite.statusTotalError + suite.statusTotalSkipped;
        
        return (
            <div className="grid grid-cols-5 gap-4 text-center mt-4">
                <Card className="bg-gray-50 p-2"><div className="text-2xl font-bold">{total}</div><div className="text-sm text-gray-600">Total TC</div></Card>
                <Card className="bg-green-50 p-2"><div className="text-2xl font-bold text-green-600">{suite.statusTotalPassed}</div><div className="text-sm text-green-600">Passed</div></Card>
                <Card className="bg-red-50 p-2"><div className="text-2xl font-bold text-red-600">{suite.statusTotalFailed}</div><div className="text-sm text-red-600">Failed</div></Card>
                <Card className="bg-yellow-50 p-2"><div className="text-2xl font-bold text-yellow-600">{suite.statusTotalError}</div><div className="text-sm text-yellow-600">Error</div></Card>
                <Card className="bg-blue-50 p-2"><div className="text-2xl font-bold text-blue-600">{suite.statusTotalSkipped}</div><div className="text-sm text-blue-600">Skipped</div></Card>
            </div>
        );
    };

    const dialogTitle = suite?.name || "Detail Test Suite Run";
    const statusLabel = suite && suite.endDate ? 
        (suite.statusTotalFailed > 0 || suite.statusTotalError > 0 ? "FAILED" : "PASSED") 
        : "IN PROGRESS";
        
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Zap className="inline h-6 w-6 mr-2 text-primary" /> {dialogTitle}
                    </DialogTitle>
                    <DialogDescription>
                        Analisis lengkap dari eksekusi Test Suite (ID: {testSuiteId}).
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow pr-6">
                    {isLoading && (
                        <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p>Memuat Detail Run...</p></div>
                    )}
                    {isError && (
                         <div className="text-center p-8 text-red-600"><Frown className="h-6 w-6 mx-auto" /><p>Gagal memuat data Test Suite.</p></div>
                    )}

                    {suite && (
                        <div className="space-y-6">
                            
                            {/* Ringkasan & Status */}
                            <Card>
                                <CardHeader className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold">Status Eksekusi: <Badge className={`text-lg font-bold ${statusLabel === 'FAILED' ? 'bg-red-500' : statusLabel === 'PASSED' ? 'bg-green-500' : 'bg-yellow-500'}`}>{statusLabel}</Badge></h3>
                                        <div className="text-sm text-gray-600 flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Total Waktu: {formatElapsedTime(suite.elapsedTime)}
                                        </div>
                                    </div>
                                    <CardDescription className="pt-2">{suite.description}</CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent className="p-4">
                                    {renderSummary(suite)}
                                </CardContent>
                            </Card>

                            {/* Metadata Lingkungan */}
                            <Card>
                                <CardHeader className="p-4 pb-2"><CardTitle className="text-lg">Detail Lingkungan</CardTitle></CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <p><strong>Stage:</strong> {suite.testStage}</p>
                                        <p><strong>Environment:</strong> {suite.testEnvironment}</p>
                                        <p><strong>App Version:</strong> {suite.version}</p>
                                        <p><strong>Hostname:</strong> {suite.hostname}</p>
                                        <p><strong>OS:</strong> {suite.os}</p>
                                        <p><strong>Browser:</strong> {suite.browser}</p>
                                        <p className="col-span-2"><strong>Tags:</strong> <Badge variant="secondary">{suite.tag || '-'}</Badge></p>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                                        <p><strong>Start:</strong> {formatDate(suite.startDate, true)}</p>
                                        <p><strong>End:</strong> {suite.endDate ? formatDate(suite.endDate, true) : 'N/A (In Progress)'}</p>
                                        <p><strong>Executed By:</strong> {suite.executedByUsername}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detail Eksekusi Test Case */}
                            <h3 className="text-xl font-bold border-b pb-2">Detail Hasil ({suite.runDetails.length} Test Case)</h3>
                            <div className="space-y-3">
                                {suite.runDetails.length > 0 ? (
                                    // Salin array sebelum sort agar tidak memutasi cache React Query;
                                    // urutkan berdasar prioritas status (FAIL/ERROR lebih dulu) via statusRank.
                                    [...suite.runDetails]
                                        .sort((a, b) => statusRank(a.status) - statusRank(b.status))
                                        .map(renderRunDetail)
                                ) : (
                                    <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-md">
                                        <Info className="h-5 w-5 mx-auto mb-2" />
                                        <p>Tidak ada detail eksekusi yang tercatat untuk Test Suite ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default TestSuiteDetailDialog;