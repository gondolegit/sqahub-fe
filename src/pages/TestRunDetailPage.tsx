import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';

import {
    AlertTriangle, Loader2, CheckCircle, XCircle,
    Download, ChevronLeft, Clock, Monitor, Globe, User, Tag,
    Info, FastForward, Bug, Layers, Terminal, Server, Shield, Activity, Calendar, FileSpreadsheet,
    Radio, FlagTriangleRight,
} from 'lucide-react';

import { useTestSuiteById, useExportTestSuiteExcel, useFinalizeTestSuiteRun } from '@/hooks/useTestSuites';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import PdfExportButton from '@/components/reports/PdfExportButton';
import StatusPieChart from '@/components/reports/StatusPieChart';
import RunDetailList from '@/components/reports/RunDetailList';
import DeployDecisionCard from '@/components/reports/DeployDecisionCard';
import AddRunDetailDialog from '@/components/reports/AddRunDetailDialog';

const RUN_DETAIL_ADD_ROLES = ['ADMIN', 'TESTER', 'DEVELOPER'] as const;
// Sesuai matriks izin backend: PUT /testsuite/{id}/finalize butuh role global ADMIN/TESTER/DEVELOPER
// (persis sama dengan role yang boleh menambah detail run), jadi cukup pakai daftar yang sama.
const RUN_FINALIZE_ROLES = RUN_DETAIL_ADD_ROLES;

// --- ISO Standard Formatter ---
// elapsedTime dari backend dalam milidetik.
const formatDuration = (msInput: number): string => {
    const totalSeconds = Math.floor(msInput / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} (MM:SS)`;
};

// Kelas Tailwind statis lengkap per warna status — string interpolation seperti `bg-${color}-500`
// tidak terdeteksi oleh Tailwind JIT compiler sehingga akan hilang dari CSS hasil build produksi.
const STATUS_CARD_COLOR_CLASSES = {
    emerald: { bar: 'bg-emerald-500', label: 'text-emerald-600', icon: 'text-emerald-500', count: 'text-emerald-700' },
    red: { bar: 'bg-red-500', label: 'text-red-600', icon: 'text-red-500', count: 'text-red-700' },
    amber: { bar: 'bg-amber-500', label: 'text-amber-600', icon: 'text-amber-500', count: 'text-amber-700' },
    indigo: { bar: 'bg-indigo-500', label: 'text-indigo-600', icon: 'text-indigo-500', count: 'text-indigo-700' },
} as const;

const TestRunDetailPage: React.FC = () => {
    const { suiteId } = useParams<{ suiteId: string }>();
    const navigate = useNavigate();
    const testSuiteId = suiteId ? parseInt(suiteId) : undefined;
    const { data: testRun, isLoading, error } = useTestSuiteById(testSuiteId, { liveRefetch: true });
    const [pieChartBase64, setPieChartBase64] = useState<string>('');
    const chartRef = useRef<HTMLDivElement>(null);
    const { hasRole } = useAuth();
    const canAddRunDetail = hasRole([...RUN_DETAIL_ADD_ROLES]);
    const canFinalizeRun = hasRole([...RUN_FINALIZE_ROLES]);
    const exportExcelMutation = useExportTestSuiteExcel();
    const finalizeMutation = useFinalizeTestSuiteRun();
    const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

    // Jam berjalan (live) untuk run yang masih IN PROGRESS (endDate null) — di-tick setiap detik
    // selagi berjalan, dihentikan otomatis begitu run difinalisasi.
    const [liveNow, setLiveNow] = useState(() => Date.now());
    useEffect(() => {
        if (!testRun || testRun.endDate) return;
        const id = setInterval(() => setLiveNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [testRun]);

    useEffect(() => {
        if (testRun && chartRef.current) {
            toPng(chartRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
                .then(setPieChartBase64)
                .catch(err => console.error('Capture Error:', err));
        }
    }, [testRun]);

    const handleFinalize = () => {
        if (!testRun) return;
        const now = Date.now();
        finalizeMutation.mutate(
            {
                testSuiteId: testRun.id,
                payload: {
                    endDate: new Date(now).toISOString(),
                    elapsedTime: Math.max(0, now - new Date(testRun.startDate).getTime()),
                },
            },
            { onSuccess: () => setShowFinalizeConfirm(false) }
        );
    };

    if (!testSuiteId || isLoading || error || !testRun) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-50/50">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                            <Activity className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Retrieving Test Execution Data...</p>
                    </div>
                ) : (
                    <Card className="max-w-md w-full p-8 text-center border-2 border-red-100 shadow-2xl">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Fault Detected</h2>
                        <p className="text-slate-500 my-4 leading-relaxed font-medium">The requested Test Execution ID could not be identified or has been purged from the repository.</p>
                        <Button onClick={() => navigate(-1)} className="w-full bg-slate-900 font-bold">RETURN TO TEST REPOSITORY</Button>
                    </Card>
                )}
            </div>
        );
    }

    const total = (testRun.statusTotalPassed + testRun.statusTotalFailed + testRun.statusTotalError + testRun.statusTotalSkipped) || 1;
    const isInProgress = !testRun.endDate;
    const liveElapsedMs = isInProgress ? Math.max(0, liveNow - new Date(testRun.startDate).getTime()) : testRun.elapsedTime;

    const statusCards = [
        { label: 'PASSED', count: testRun.statusTotalPassed, color: 'emerald', icon: CheckCircle, desc: 'Success Criteria Met' },
        { label: 'FAILED', count: testRun.statusTotalFailed, color: 'red', icon: XCircle, desc: 'Requirement Not Met' },
        { label: 'ERROR', count: testRun.statusTotalError, color: 'amber', icon: Bug, desc: 'System Fault' },
        { label: 'SKIPPED', count: testRun.statusTotalSkipped, color: 'indigo', icon: FastForward, desc: 'Out of Scope' },
    ] as const;

    const metadataItems = [
        { label: 'Test Item / Project', value: testRun.projectName, icon: Layers },
        { label: 'Execution Mode', value: testRun.executionType, icon: Terminal },
        { label: 'Test Environment', value: testRun.testEnvironment, icon: Globe },
        { label: 'Target Hostname', value: testRun.hostname, icon: Server },
        { label: 'Infrastructure / OS', value: testRun.os, icon: Monitor },
        { label: 'System Version', value: testRun.version, icon: Tag },
        { label: 'User Agent / Browser', value: testRun.browser, icon: Globe },
        { label: 'Classification Tag', value: testRun.tag, icon: Shield },
        { label: 'Test Cycle Stage', value: testRun.testStage, icon: Info },
        { label: 'Cumulative Duration', value: formatDuration(liveElapsedMs), icon: Clock },
        { label: 'Testing Officer', value: testRun.executedByUsername, icon: User },
        { label: 'Execution Timestamp', value: new Date(testRun.startDate).toLocaleString('id-ID'), icon: Calendar },
    ];

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            
            {/* --- TOP HEADER (Standard ISO Reporting Header) --- */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Shield className="h-64 w-64" />
                </div>
                
                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                            <ChevronLeft className="h-4 w-4 mr-1" /> BACK TO SUMMARY
                        </Button>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                TEST REPORT: {testRun.name}
                            </h1>
                            <Badge className="bg-primary text-primary-foreground font-mono px-4 py-1 text-lg shadow-lg">ID_{testRun.id}</Badge>
                            {isInProgress ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono px-4 py-1 text-sm shadow-lg flex items-center gap-2 w-fit">
                                    <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE — IN PROGRESS
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-700 text-slate-200 border border-slate-600 font-mono px-4 py-1 text-sm shadow-lg w-fit">
                                    FINALIZED
                                </Badge>
                            )}
                        </div>
                        <p className="text-slate-300 text-lg max-w-4xl font-medium leading-relaxed opacity-90 border-l-2 border-primary/50 pl-4">
                            {testRun.description || "The test objective was executed according to standard operating procedures. No additional notes provided."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isInProgress && canFinalizeRun && (
                            <Button
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-700 font-black px-6 shadow-lg shadow-emerald-900/40"
                                onClick={() => setShowFinalizeConfirm(true)}
                            >
                                <FlagTriangleRight className="h-5 w-5 mr-2" /> SELESAIKAN RUN
                            </Button>
                        )}
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white font-bold px-6"
                            onClick={() => exportExcelMutation.mutate({ testSuiteId: testRun.id, suiteName: testRun.name })}
                            disabled={exportExcelMutation.isPending}
                        >
                            {exportExcelMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <FileSpreadsheet className="h-5 w-5 mr-2" />}
                            EXCEL
                        </Button>
                        <PdfExportButton
                            testSuite={testRun}
                            pieChartImage={pieChartBase64}
                            fileName={`ISO_IEC_29119_REPORT_${testRun.name}.pdf`}
                        >
                            {({ loading }) => (
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-red-500 hover:text-white font-black text-md px-10 py-8 shadow-2xl transition-all" disabled={loading}>
                                    {loading ? <Loader2 className="h-6 w-6 mr-3 animate-spin" /> : <Download className="h-6 w-6 mr-3" />}
                                    GENERATE DOCUMENT
                                </Button>
                            )}
                        </PdfExportButton>
                    </div>
                </div>
            </div>

            {/* --- DASHBOARD: VISUAL ANALYSIS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Visual Analytics */}
                <Card className="lg:col-span-5 xl:col-span-4 border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
                    <CardHeader className="bg-slate-50 py-5 border-b">
                        <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> Statistical Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-10 flex justify-center items-center h-[360px]" ref={chartRef}>
                        <StatusPieChart data={statusCards.map(s => ({
                            name: s.label,
                            value: s.count,
                            color: s.color === 'emerald' ? '#10B981' : s.color === 'red' ? '#EF4444' : s.color === 'amber' ? '#F59E0B' : '#6366F1',
                            percent: s.count / total
                        })).filter(d => d.value > 0)} />
                    </CardContent>
                </Card>

                {/* Counter Grid */}
                <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {statusCards.map((stat) => {
                        const colorClasses = STATUS_CARD_COLOR_CLASSES[stat.color];
                        return (
                            <Card key={stat.label} className="border-none shadow-lg bg-white overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
                                <div className={`h-2 w-full ${colorClasses.bar}`} />
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-black tracking-widest ${colorClasses.label} uppercase`}>{stat.label}</span>
                                        <stat.icon className={`h-5 w-5 ${colorClasses.icon} opacity-30 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                    <div className={`text-6xl font-black tracking-tighter ${colorClasses.count}`}>
                                        {stat.count}
                                    </div>
                                    <p className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-tight">{stat.desc}</p>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Deploy Decision */}
                    <div className="col-span-2 xl:col-span-4">
                        <DeployDecisionCard testSuiteId={testRun.id} />
                    </div>

                    {/* Metadata Wall (ISO 29119-3 standard labels) */}
                    <Card className="col-span-2 xl:col-span-4 border-none shadow-2xl ring-2 ring-primary/10 bg-white">
                        <CardHeader className="bg-slate-100/50 py-4 border-b">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-primary" /> Test Execution Context & Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-8">
                            {metadataItems.map((item, idx) => (
                                <div key={idx} className="group cursor-default">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <item.icon className="h-3 w-3" /> {item.label}
                                    </p>
                                    <p className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                                        {item.value || 'NOT_AVAILABLE'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- TEST CASES SECTION --- */}
            <div className="space-y-6 pt-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-slate-900 pb-4 px-2">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <div className="h-8 w-2 bg-primary" /> Test Specification Results
                        </h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Verification and Validation of Individual Test Cases</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {canAddRunDetail && (
                            <AddRunDetailDialog
                                testSuiteId={testRun.id}
                                projectId={testRun.projectId}
                                existingTestCaseIds={testRun.runDetails.map(d => d.idTestCase)}
                            />
                        )}
                        <Badge className="bg-slate-900 text-white px-6 py-2 text-md font-black italic">
                            TOTAL ITEMS: {testRun.runDetails.length}
                        </Badge>
                    </div>
                </div>
                
                <div className="bg-white rounded-[2rem] shadow-2xl border-none ring-1 ring-slate-200 overflow-hidden">
                    <RunDetailList runDetails={testRun.runDetails} testSuiteId={testRun.id} />
                </div>
            </div>

            {/* Konfirmasi Finalisasi Run — mengunci endDate/elapsedTime, mengubah status dari
                IN PROGRESS menjadi selesai. Tetap bisa ditambah/diedit hasilnya setelahnya,
                tapi run tidak akan lagi dianggap "berjalan". */}
            <AlertDialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Selesaikan Test Run Ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {testRun.runDetails.length === 0
                                ? `Belum ada satu pun hasil test case yang dicatat pada run "${testRun.name}". Run tetap bisa difinalisasi, tapi pertimbangkan untuk menambah hasil dulu jika belum selesai.`
                                : `Waktu selesai dan durasi run "${testRun.name}" akan dikunci sesuai waktu saat ini. Anda tetap bisa menambah atau mengubah hasil test case setelahnya, tapi run tidak lagi berstatus IN PROGRESS.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={finalizeMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleFinalize}
                            disabled={finalizeMutation.isPending}
                        >
                            {finalizeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlagTriangleRight className="h-4 w-4 mr-2" />}
                            Ya, Selesaikan Run
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TestRunDetailPage;