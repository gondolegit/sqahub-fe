// src/components/testsuite/TestRunSidebar.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ListChecks, TestTube, ChevronRight } from 'lucide-react'; // 🚨 IMPORT BARU: TestTube, ChevronRight
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator'; // 🚨 IMPORT BARU: Separator
import { Link } from 'react-router-dom'; // 🚨 IMPORT BARU: Link untuk navigasi

// Import Tipe
import type { TestRunDetail, TestSuite } from '@/types/testSuite'; 

// 🚨 PERBAIKAN: Tambahkan 'testSuites' ke Props (buat opsional)
interface TestRunSidebarProps {
    testRunId?: number; 
    runDetail: TestRunDetail; 
    testSuites?: TestSuite[]; // Daftar Test Suites (Opsional, dari useTestSuitesByProject)
}

const TestRunSidebar: React.FC<TestRunSidebarProps> = ({ runDetail, testSuites }) => {
    
    // Asumsi rute untuk Test Suite Detail adalah /test-suites/:suiteId (sesuai App.tsx terakhir)
    
    return (
        <Card className="shadow-none border-t-0 border-r-0 h-full overflow-y-auto">
            
            {/* Bagian 1: Detail Run yang Sedang Aktif */}
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-md flex items-center">
                    <ListChecks className="w-4 h-4 mr-2" /> 
                    {runDetail.name} 
                    <Badge variant="secondary" className="ml-2">#{runDetail.id}</Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                    {runDetail.description}
                </p>
            </CardHeader>

            <CardContent className="p-4 space-y-2 text-sm border-b">
                <h4 className="font-bold border-b pb-1 mb-2">Meta Data Eksekusi</h4>
                <p><strong>Stage:</strong> <Badge>{runDetail.testStage}</Badge></p>
                <p><strong>Lingkungan:</strong> <Badge variant="outline">{runDetail.testEnvironment}</Badge></p>
                <p><strong>Versi Aplikasi:</strong> {runDetail.version}</p>
                <p><strong>OS:</strong> {runDetail.os}</p>
                <p><strong>Browser:</strong> {runDetail.browser}</p>
                <p><strong>Hostname:</strong> {runDetail.hostname}</p>
            </CardContent>

            <Separator />
            
            {/* Bagian 2: Daftar Test Suites di Project yang Sama */}
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center">
                    <TestTube className="w-4 h-4 mr-2" /> 
                    Test Suites Proyek ({testSuites?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                    {testSuites && testSuites.length > 0 ? (
                        testSuites.map((suite) => (
                            <li 
                                key={suite.id} 
                                // Sorot Test Suite yang terkait dengan Run yang sedang aktif (asumsi runDetail memiliki suiteId)
                                className={suite.id === runDetail.testSuiteId ? "bg-blue-50" : ""} 
                            >
                                <Link 
                                    to={`/test-suites/${suite.id}`} 
                                    className="flex justify-between items-center p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-800 truncate">{suite.name}</p>
                                        <p className="text-xs text-gray-500">Suite ID: {suite.id}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-sm text-gray-500 italic">
                            Tidak ada Test Suite yang terdaftar dalam proyek ini.
                        </li>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
};

export default TestRunSidebar;