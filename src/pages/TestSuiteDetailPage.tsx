import React from 'react';
import { useParams } from 'react-router-dom'; 
import { LayoutDashboard, Loader2, AlertTriangle } from 'lucide-react';

// Import Hooks & Types
import { useTestRunDetail, useTestSuitesByProject } from '@/hooks/useTestSuites'; 
import type { TestRunDetail } from '@/types/testSuite'; 

// Impor komponen
import TestRunSidebar from '@/components/testsuite/TestRunSidebar'; 
import TestRunSummary from '@/components/testsuite/TestRunSummary'; 
import TestRunDetailsTable from '@/components/testsuite/TestRunDetailsTable';

import { Separator } from '@/components/ui/separator';

const TestSuiteDetailPage: React.FC = () => {
    
    // Menggunakan runId sesuai input Anda, meskipun App.tsx menggunakan testSuiteId
    const { runId } = useParams<{ runId: string }>(); 
    const testRunId = runId ? parseInt(runId) : undefined;

    // 1. Fetch Detail Test Run
    const { 
        data: testRun, 
        isLoading: isLoadingRun, 
        error: errorRun
    } = useTestRunDetail(testRunId); 

    // Mendapatkan Project ID dari data Test Run yang berhasil di-fetch
    const projectId = testRun?.projectId;

    // 2. Fetch Daftar Test Suites berdasarkan Project ID
    // 🚨 PERBAIKAN: Menggunakan 'projectId || 0' untuk menjamin nilai number (Solusi Jangka Pendek)
    const {
        data: testSuites,
        isLoading: isLoadingSuites
    } = useTestSuitesByProject(projectId || 0); 

    // --- Loading dan Error Handling ---

    if (!testRunId) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Invalid Test Run ID.</h2>
                <p className="text-gray-600">Pastikan ID Run yang diakses sudah benar.</p>
            </div>
        );
    }

    if (isLoadingRun || isLoadingSuites) { // Cek kedua loading state
        return (
            <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2">Memuat detail Test Run dan daftar Test Suites...</p>
            </div>
        );
    }
    
    if (errorRun || !testRun) {
        // Tampilkan error jika gagal fetch data Test Run utama
         return (
            <div className="p-16 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Gagal Memuat Detail Test Run.</h2>
                <p className="text-gray-600">{errorRun?.message || "Data Test Run tidak ditemukan."}</p>
            </div>
        );
    }
    
    // --- Data Mapping (Setelah yakin testRun ada) ---
    
    const summaryData = {
        name: testRun.name,
        date: new Date(testRun.startDate).toLocaleString(),
        passed: testRun.statusTotalPassed,
        failed: testRun.statusTotalFailed,
        skipped: testRun.statusTotalSkipped + testRun.statusTotalError, 
        duration: testRun.elapsedTime, 
        description: testRun.description,
    };
    
    return (
        <div className="flex h-[calc(100vh-60px)]"> 
            
            {/* Bagian Kiri: Sidebar Detail (W-80) */}
            <div className="w-80 flex-shrink-0">
                <TestRunSidebar 
                    testRunId={testRunId} 
                    runDetail={testRun}
                    testSuites={testSuites} // Data Test Suites untuk navigasi
                /> 
            </div>

            {/* Bagian Kanan: Konten Utama */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                
                <header className="pb-4">
                    <h1 className="text-4xl font-extrabold flex items-center">
                        <LayoutDashboard className="h-8 w-8 mr-3 text-blue-600" /> 
                        Dashboard Test Run
                    </h1>
                </header>

                {/* Ringkasan Test Run */}
                <section>
                    <TestRunSummary runData={summaryData} /> 
                </section>

                <Separator />

                {/* Detail Test Case per Run */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2">
                        Detail Test Case Eksekusi ({testRun.runDetails.length} Kasus)
                    </h2>
                    
                    <TestRunDetailsTable data={testRun.runDetails} />
                    
                </section>
                
            </div>
        </div>
    );
};

export default TestSuiteDetailPage;