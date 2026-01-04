import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Loader2, BookOpen, Clock, Tag } from 'lucide-react';

// Import Hooks
// Gunakan hook yang sudah kita perbaiki di langkah sebelumnya
import { useTestSuiteById } from '@/hooks/useTestSuites'; 

// Import Komponen UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Import Komponen Child (akan dibuat di langkah berikutnya)
// Asumsi TestCasesList adalah komponen yang menampilkan daftar test case statis
const TestCasesList = ({ testSuiteId }: { testSuiteId: number }) => (
    <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Daftar Test Case (Statik)</h3>
        <p className="text-gray-500">
            {/* Di sini Anda akan meletakkan fetching useTestCasesBySuiteId */}
            Memuat daftar Test Case untuk Suite #{testSuiteId}...
        </p>
    </div>
);


const TestSuiteDetailView: React.FC = () => {
    // Rute yang kita gunakan di App.tsx adalah /test-suites/:suiteId
    const { suiteId } = useParams<{ suiteId: string }>(); 
    const testSuiteId = suiteId ? parseInt(suiteId) : undefined;

    // 1. Fetch Detail Test Suite Statis
    const { 
        data: testSuite, 
        isLoading, 
        error 
    } = useTestSuiteById(testSuiteId);

    // --- Loading dan Error Handling ---
    
    if (!testSuiteId) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Invalid Test Suite ID.</h2>
                <p className="text-gray-600">Pastikan ID Test Suite yang diakses sudah benar.</p>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2">Memuat detail Test Suite...</p>
            </div>
        );
    }

    if (error || !testSuite) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Gagal Memuat Detail Test Suite.</h2>
                <p className="text-gray-600">{error?.message || "Data Test Suite tidak ditemukan."}</p>
            </div>
        );
    }

    // --- Konten Utama (Setelah data berhasil di-fetch) ---

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-4xl font-extrabold flex items-center">
                    <BookOpen className="h-8 w-8 mr-3 text-green-600" /> 
                    {testSuite.name}
                    <Badge variant="outline" className="ml-4 text-lg p-2">#{testSuite.id}</Badge>
                </h1>
                <p className="text-gray-600 mt-2">{testSuite.description}</p>
            </header>

            <Separator />

            {/* Ringkasan Metadata */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Proyek & Stage</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{testSuite.projectName}</p>
                        <p className="text-sm text-gray-500 mt-1">Stage: <Badge>{testSuite.testStage}</Badge></p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tag & Lingkungan</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{testSuite.tag || '-'}</p>
                        <p className="text-sm text-gray-500 mt-1">Env: <Badge variant="secondary">{testSuite.testEnvironment}</Badge></p>
                    </CardContent>
                </Card>
                
                {/* Anda bisa menambahkan card lain, misalnya Status Terakhir Run atau Creator */}
                
            </section>
            
            <Separator />

            {/* Daftar Test Cases */}
            <section>
                {/* 🚨 Komponen ini akan menampilkan Test Case yang terkait dengan Test Suite ini */}
                <TestCasesList testSuiteId={testSuite.id} />
            </section>
        </div>
    );
};

export default TestSuiteDetailView;