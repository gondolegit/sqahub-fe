// src/components/testsuite/TestRunSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Separator } from '../ui/separator';

// 🚨 PERBAIKAN #3.2: Definisikan Props yang sesuai dengan summaryData
interface SummaryData {
    name: string;
    date: string; // Sudah diolah menjadi string format lokal
    passed: number;
    failed: number;
    skipped: number; 
    duration: number; 
    description: string;
}

interface TestRunSummaryProps {
    runData: SummaryData; // Diharapkan selalu ada
}

const TestRunSummary: React.FC<TestRunSummaryProps> = ({ runData }) => {
    
    const total = runData.passed + runData.failed + runData.skipped;
    const passedPercentage = total > 0 ? ((runData.passed / total) * 100).toFixed(1) : '0.0';

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{runData.name}</h1>
            <p className="text-sm text-gray-500 mb-4">Eksekusi pada: {runData.date}</p>
            
            <p className="text-gray-700 italic">{runData.description}</p>
            
            <Separator />
            
            <div className="grid grid-cols-4 gap-4">
                {/* Total Passed */}
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PASS</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{runData.passed}</div>
                        <p className="text-xs text-green-500">{passedPercentage}% dari Total</p>
                    </CardContent>
                </Card>
                
                {/* Total Failed */}
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">FAIL</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{runData.failed}</div>
                        <p className="text-xs text-red-500">{(total > 0 ? ((runData.failed / total) * 100).toFixed(1) : '0.0')}% dari Total</p>
                    </CardContent>
                </Card>
                
                {/* Total Skipped/Error */}
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SKIPPED / ERROR</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">{runData.skipped}</div>
                        <p className="text-xs text-yellow-500">{runData.skipped} Test Cases</p>
                    </CardContent>
                </Card>

                {/* Duration */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Durasi Total</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{runData.duration.toFixed(1)}s</div>
                        <p className="text-xs text-blue-500">Total Test Cases: {total}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TestRunSummary;