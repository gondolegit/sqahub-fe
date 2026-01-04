// src/views/TestRunDetailPage.tsx

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer'; 
import { toPng } from 'html-to-image'; 

import { 
    AlertTriangle, Loader2, FileText, CheckCircle, XCircle, Download, ChevronLeft 
} from 'lucide-react';

// Import Types
import { type TestSuite } from '@/types/testSuite'; 
import { useTestSuiteById } from '@/hooks/useTestSuites'; 

// Import Komponen UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Import Komponen Report
import ReportDocument from '@/components/reports/ReportDocument'; 
import StatusPieChart from '@/components/reports/StatusPieChart'; 
import RunDetailList from '@/components/reports/RunDetailList'; 

// --- Helper Functions ---
const formatDuration = (secondsInput: number): string => {
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
// -------------------------------------------------------------------

const TestRunDetailPage: React.FC = () => {
    const { suiteId } = useParams<{ suiteId: string }>(); 
    const navigate = useNavigate(); 
    const testSuiteId = suiteId ? parseInt(suiteId) : undefined;

    const { data: testRun, isLoading, error } = useTestSuiteById(testSuiteId);

    const [pieChartBase64, setPieChartBase64] = useState<string>('');
    const chartRef = useRef<HTMLDivElement>(null);

    // --- Efek untuk Mengkonversi Chart ke Base64 ---
    useEffect(() => {
        if (testRun && chartRef.current) {
            toPng(chartRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
                .then((dataUrl) => {
                    setPieChartBase64(dataUrl);
                })
                .catch((err) => {
                    console.error('Gagal mengkonversi chart ke gambar:', err);
                    setPieChartBase64(''); 
                });
        }
    }, [testRun]);


    // --- Handler Navigasi Kembali ---
    const handleBack = () => {
        navigate(-1); 
    };


    // --- Loading dan Error Handling ---
    if (!testSuiteId || isLoading || error || !testRun) {
        if (!testSuiteId) return <div className="p-16 text-center space-y-4"><AlertTriangle className="h-10 w-10 mx-auto text-red-500" /><h2 className="text-xl font-semibold">Invalid Test Run ID.</h2></div>;
        if (isLoading) return <div className="p-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Memuat Laporan Test Run...</p></div>;
        if (error || !testRun) return <div className="p-16 text-center space-y-4"><AlertTriangle className="h-10 w-10 mx-auto text-red-500" /><h2 className="text-xl font-semibold">Gagal Memuat Laporan Test Run.</h2><p className="text-gray-600">{error?.message || "Data Test Run tidak ditemukan."}</p></div>;
    }

    // 🚨 PERBAIKAN: Hitung totalRun dan tambahkan properti 'percent'
    const totalRuns = testRun.statusTotalPassed + testRun.statusTotalFailed + testRun.statusTotalError + testRun.statusTotalSkipped;
    const total = totalRuns > 0 ? totalRuns : 1; // Cegah pembagian dengan nol

    // Siapkan data untuk Chart dengan properti 'percent'
    const pieData = [
        { 
            name: 'Passed', 
            value: testRun.statusTotalPassed, 
            color: '#10B981',
            percent: testRun.statusTotalPassed / total // 🚨 Tambahkan 'percent'
        },
        { 
            name: 'Failed', 
            value: testRun.statusTotalFailed, 
            color: '#EF4444',
            percent: testRun.statusTotalFailed / total // 🚨 Tambahkan 'percent'
        },
        { 
            name: 'Error', 
            value: testRun.statusTotalError, 
            color: '#F59E0B',
            percent: testRun.statusTotalError / total // 🚨 Tambahkan 'percent'
        },
        { 
            name: 'Skipped', 
            value: testRun.statusTotalSkipped, 
            color: '#6B7280',
            percent: testRun.statusTotalSkipped / total // 🚨 Tambahkan 'percent'
        },
    ].filter(item => item.value > 0);
    
    // Nama file PDF
    const filename = `Laporan_TestRun_${testRun.name.replace(/\s/g, '_')}_${testRun.id}.pdf`;


    return (
        <div className="p-6 space-y-8">
            
            {/* Tombol Back */}
            <Button variant="outline" onClick={handleBack} className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Run
            </Button>

            {/* Header dengan Tombol Aksi */}
            <header className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold flex items-center">
                    <FileText className="h-8 w-8 mr-3 text-indigo-600" /> 
                    Laporan: {testRun.name}
                    <Badge variant="outline" className="ml-4 text-lg p-2">#{testRun.id}</Badge>
                </h1>
                
                {/* Tombol Export menggunakan PDFDownloadLink */}
                <PDFDownloadLink 
                    document={<ReportDocument testSuite={testRun} pieChartImage={pieChartBase64} />} 
                    fileName={filename}
                >
                    {({ loading }) => {
                        if (loading) {
                            return (
                                <Button disabled>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyiapkan PDF...
                                </Button>
                            );
                        }
                        return (
                            <Button className="bg-red-600 hover:bg-red-700">
                                <Download className="h-4 w-4 mr-2" /> Export ke PDF
                            </Button>
                        );
                    }}
                </PDFDownloadLink>

            </header>

            <p className="text-gray-600 mt-2">{testRun.description}</p>

            <Separator />

            {/* Ringkasan Metadata, Status CARD, dan PIE CHART */}
            <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                
                {/* 1. Pie Chart (Dibungkus dengan Ref untuk Screenshot) */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Visualisasi Hasil</CardTitle>
                    </CardHeader>
                    {/* Elemen yang di-ref ini akan diubah menjadi Base64 */}
                    <CardContent className="h-[250px] flex justify-center items-center" ref={chartRef}>
                        <StatusPieChart data={pieData} />
                    </CardContent>
                </Card>
                
                {/* 2. Metadata Run, Status Passed, Status Failed/Error (Tetap Sama) */}
                {/* ... (Kartu metadata dan status tetap sama) ... */}
                <Card className="col-span-1">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Metadata Run</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p><strong>Proyek:</strong> {testRun.projectName}</p>
                        <p><strong>Stage:</strong> {testRun.testStage}</p>
                        <p><strong>Waktu:</strong> {formatDuration(testRun.elapsedTime)}</p>
                        <p><strong>Eksekutor:</strong> {testRun.executedByUsername}</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Passed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{testRun.statusTotalPassed}</div></CardContent>
                </Card>

                <Card className="bg-red-50 border-l-4 border-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gagal/Error</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-700">{testRun.statusTotalFailed + testRun.statusTotalError + testRun.statusTotalSkipped}</div></CardContent>
                </Card>
                
            </section>
            
            <Separator />

            {/* Detail Test Case */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Detail Hasil Test Case</h2>
                <RunDetailList runDetails={testRun.runDetails} />
            </section>
        </div>
    );
};

export default TestRunDetailPage;