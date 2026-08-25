// src/pages/TestSuiteDetailPage.tsx (VERSI LENGKAP)

import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTestSuiteById } from '@/hooks/useTestSuites'; 
import { 
    ArrowLeft, Loader2, PieChart as PieIcon, FileText, CheckCircle, XCircle, AlertTriangle 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { type TestSuite } from '@/types/testSuite';
import StatusPieChart from '@/components/reports/StatusPieChart';
import RunDetailList from '@/components/reports/RunDetailList';
import PdfExportButton from '@/components/reports/PdfExportButton'; // <-- @react-pdf/renderer di-lazy-load di dalam sini
import * as htmlToImage from 'html-to-image'; // <-- Import utility konversi gambar

const durationDisplay = (suite: TestSuite) => {
    const seconds = Math.floor(suite.elapsedTime); 
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


const TestSuiteDetailPage: React.FC = () => {
    const { projectId, testSuiteId } = useParams<{ projectId: string, testSuiteId: string }>();
    const parsedTestSuiteId = testSuiteId ? parseInt(testSuiteId) : undefined;
    
    // State dan Ref untuk Fungsionalitas PDF
    const [pieChartImage, setPieChartImage] = useState<string>(''); 
    const chartRef = useRef<HTMLDivElement>(null); 

    const { data: testSuite, isLoading, error } = useTestSuiteById(parsedTestSuiteId);
    
    // --- Efek untuk merender Pie Chart menjadi Gambar (Base64) ---
    useEffect(() => {
        if (testSuite && chartRef.current) {
            // Konversi elemen SVG/HTML Pie Chart menjadi Base64 PNG
            htmlToImage.toPng(chartRef.current, { backgroundColor: '#FFFFFF' })
                .then(function (dataUrl) {
                    setPieChartImage(dataUrl);
                })
                .catch(function (error) {
                    console.error('Gagal mengkonversi chart ke gambar:', error);
                });
        }
    }, [testSuite]); // Dijalankan saat data Test Suite tersedia

    // --- LOADING & ERROR STATE ---
    if (!testSuiteId || !projectId) {
        return (
            <div className="p-8 space-y-4">
                <h1 className="text-3xl font-bold text-red-600">ID Tidak Ditemukan</h1>
                <p>Pastikan URL memiliki Project ID dan Test Suite ID yang valid.</p>
                <Button asChild><Link to="/dashboard">Kembali</Link></Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2">Memuat Detail Test Suite Run...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
                <h1 className="text-xl font-bold">Gagal Memuat Data</h1>
                <p className="text-sm">{error.message}</p>
                <Button asChild className="mt-4"><Link to={`/projects/${projectId}`}>Kembali ke Project</Link></Button>
            </div>
        );
    }

    if (!testSuite) {
        return (
            <div className="p-8 text-center text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-3" />
                <p className="font-semibold">Test Suite Run (ID: {testSuiteId}) tidak ditemukan.</p>
                <Button asChild className="mt-4"><Link to={`/projects/${projectId}`}>Kembali ke Project</Link></Button>
            </div>
        );
    }
    
    const totalRuns = testSuite.statusTotalPassed + testSuite.statusTotalFailed + testSuite.statusTotalError + testSuite.statusTotalSkipped;
    const failureRate = totalRuns > 0 ? ((testSuite.statusTotalFailed + testSuite.statusTotalError) / totalRuns) * 100 : 0;
    
    const pieData = [
        { 
            name: 'Passed', 
            value: testSuite.statusTotalPassed, 
            color: '#10B981',
            percent: totalRuns > 0 ? (testSuite.statusTotalPassed / totalRuns) * 100 : 0,
            totalRuns
        },
        { 
            name: 'Failed', 
            value: testSuite.statusTotalFailed, 
            color: '#EF4444',
            percent: totalRuns > 0 ? (testSuite.statusTotalFailed / totalRuns) * 100 : 0,
            totalRuns
        },
        { 
            name: 'Error', 
            value: testSuite.statusTotalError, 
            color: '#F59E0B',
            percent: totalRuns > 0 ? (testSuite.statusTotalError / totalRuns) * 100 : 0,
            totalRuns
        },
        { 
            name: 'Skipped', 
            value: testSuite.statusTotalSkipped, 
            color: '#6B7280',
            percent: totalRuns > 0 ? (testSuite.statusTotalSkipped / totalRuns) * 100 : 0,
            totalRuns
        },
    ].filter(item => item.value > 0);
    
    // --- MAIN RENDER ---
    return (
        <div className="p-6 md:p-8 space-y-6">
            <header className="flex justify-between items-center pb-4 border-b">
                <div>
                    <Button variant="ghost" asChild className="mb-2 -ml-3">
                        <Link to={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Project</Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold text-primary">{testSuite.name}</h1>
                    <p className="text-gray-500 mt-1">Laporan Eksekusi Run ID: TS-{testSuiteId}</p>
                </div>
                
                {/* 🚨 Fungsionalitas Export PDF */}
                {testSuite && (
                    <PdfExportButton
                        testSuite={testSuite}
                        pieChartImage={pieChartImage}
                        fileName={`Laporan_TestRun_${testSuite.id}_${testSuite.name.replace(/\s/g, '_')}.pdf`}
                    >
                        {({ loading }) => (
                            <Button
                                className="bg-red-600 hover:bg-red-700 font-bold"
                                disabled={loading || !pieChartImage} // Disable saat loading atau chart belum terkonversi
                            >
                                {loading || !pieChartImage ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Siapkan PDF...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5 mr-2" /> Export Laporan (PDF)
                                    </>
                                )}
                            </Button>
                        )}
                    </PdfExportButton>
                )}
            </header>

            {/* --- BAGIAN 1: RINGKASAN & CHART --- */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Kolom 1: Status Ringkasan */}
                <Card className="lg:col-span-1 shadow-lg h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-gray-700"><FileText className="h-5 w-5 mr-2"/> Ringkasan Run</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><strong>Deskripsi:</strong> {testSuite.description}</p>
                        <p><strong>Tag:</strong> <Badge variant="secondary">{testSuite.tag || 'N/A'}</Badge></p>
                        <p><strong>Tahap Uji:</strong> <Badge>{testSuite.testStage}</Badge></p>
                        <p><strong>Lingkungan:</strong> <Badge>{testSuite.testEnvironment}</Badge></p>
                        <Separator />
                        <p><strong>Waktu Mulai:</strong> {new Date(testSuite.startDate).toLocaleString('id-ID')}</p>
                        <p><strong>Waktu Selesai:</strong> {testSuite.endDate ? new Date(testSuite.endDate).toLocaleString('id-ID') : 'IN PROGRESS'}</p>
                        <p><strong>Durasi Total:</strong> <span className="font-bold text-lg">{durationDisplay(testSuite)}</span></p>
                        <Separator />
                        <p><strong>Versi Aplikasi:</strong> {testSuite.version}</p>
                        <p><strong>OS/Browser:</strong> {testSuite.os} / {testSuite.browser}</p>
                    </CardContent>
                </Card>

                {/* Kolom 2 & 3: Statistik dan Pie Chart */}
                <Card className="lg:col-span-2 shadow-lg">
                    <CardHeader>
                         <CardTitle className="flex items-center text-xl text-gray-700"><PieIcon className="h-5 w-5 mr-2"/> Statistik Hasil</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2">
                        {/* Statistik Teks */}
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">{totalRuns} Test Cases Dijalankan</h3>
                            <div className="flex items-center text-2xl font-semibold text-green-600">
                                <CheckCircle className="h-6 w-6 mr-2" /> {testSuite.statusTotalPassed} Passed
                            </div>
                            <div className="flex items-center text-2xl font-semibold text-red-600">
                                <XCircle className="h-6 w-6 mr-2" /> {testSuite.statusTotalFailed + testSuite.statusTotalError} Failed/Error
                            </div>
                            <Separator className="my-2"/>
                            <p className="text-xl font-bold">Tingkat Kegagalan: <span className={`text-2xl ${failureRate > 0 ? 'text-red-500' : 'text-green-500'}`}>{failureRate.toFixed(2)}%</span></p>
                            <p className="text-sm text-gray-500">Total Skipped: {testSuite.statusTotalSkipped}</p>
                        </div>
                        {/* Pie Chart (Diberi Ref untuk di-capture) */}
                        <div ref={chartRef} className="h-64 flex justify-center items-center">
                            <StatusPieChart data={pieData} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- BAGIAN 2: DETAIL TEST CASE YANG DIUJI --- */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Detail Eksekusi Test Case ({totalRuns} Items)</CardTitle>
                    <CardDescription>Daftar lengkap hasil dan catatan untuk setiap Test Case yang dieksekusi.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <RunDetailList runDetails={testSuite.runDetails} />
                </CardContent>
            </Card>

        </div>
    );
};

export default TestSuiteDetailPage;