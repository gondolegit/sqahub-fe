import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import {
    useFeatures,
    useDeleteFeature,
    type Feature,
    type DeleteFeatureParams
} from '@/hooks/useFeatures';
import { useProjectDetail } from '@/hooks/useProjects';

import { 
    Loader2, PlusCircle, Frown, ArrowLeft, Search, 
    Pencil, Trash, Layers, BarChart3, CheckCircle2, 
    MoreHorizontal, Eye, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import FeatureFormDialog from '@/components/feature/FeatureFormDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- (API & Fetching Logic tetap sama) ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || '';
    return { headers: { Authorization: `Bearer ${token}` } };
};
interface TestCase { id: number; }
const fetchTestCasesByFeature = async (featureId: number): Promise<TestCase[]> => {
    if (featureId <= 0) return [];
    const response = await axios.get<TestCase[]>(`${API_BASE_URL}/testcase/feature/${featureId}`, getAuthHeaders());
    return response.data;
};

interface FeatureWithCount extends Feature {
    testCaseCount: number;
}

const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();
    const { projectId: projectIdStr } = useParams<{ projectId: string }>();
    const projectId = projectIdStr ? parseInt(projectIdStr) : undefined;
    const isValidId = projectId && !isNaN(projectId);

    const [searchQuery, setSearchQuery] = useState('');
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [initialFeatureData, setInitialFeatureData] = useState<Feature | null>(null);
    const [featureToDelete, setFeatureToDelete] = useState<{ id: number; name: string } | null>(null);

    const { data: features, isLoading: isLoadingFeatures, isError: isErrorFeatures, error: errorFeatures } = useFeatures(isValidId ? projectId : -1);
    const { data: projectDetail, isLoading: isLoadingProject } = useProjectDetail(isValidId ? projectId : -1);
    const deleteMutation = useDeleteFeature();

    const projectName = projectDetail?.name || `Proyek ID: ${projectId}`;

    // --- Data Mapping & Stats ---
    const featureQueries = features?.map(feature => ({
        queryKey: ['testCasesByFeature', feature.id],
        queryFn: () => fetchTestCasesByFeature(feature.id),
        enabled: !!feature.id,
    })) || [];

    const testCaseResults = useQueries({ queries: featureQueries });
    const isLoadingTCCounts = testCaseResults.some(result => result.isLoading);
    const isLoadingTotal = isLoadingFeatures || isLoadingProject || isLoadingTCCounts;

    const featuresWithCount: FeatureWithCount[] = useMemo(() => {
        return features?.map((feature, index) => ({
            ...feature,
            testCaseCount: testCaseResults[index]?.data?.length || 0,
        })) || [];
    }, [features, testCaseResults]);

    const filteredFeatures = featuresWithCount.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats Calculation
    const totalTCs = featuresWithCount.reduce((acc, curr) => acc + curr.testCaseCount, 0);
    const activeFeatures = featuresWithCount.filter(f => f.status === 'active').length;

    // --- Handlers ---
    const handleViewTestCases = (featureId: number) => navigate(`/projects/${projectId}/features/${featureId}/testcases`);
    const handleOpenEditDialog = (feature: Feature) => { setInitialFeatureData(feature); setIsFeatureDialogOpen(true); };
    const handleOpenCreateDialog = () => { setInitialFeatureData(null); setIsFeatureDialogOpen(true); };
    const handlePrepareDelete = (feature: Feature) => setFeatureToDelete({ id: feature.id, name: feature.name });

    const handleDeleteFeature = () => {
        if (!featureToDelete) return;
        deleteMutation.mutate({ featureId: featureToDelete.id, projectId: projectId! }, {
            onSuccess: () => {
                toast.success("Fitur Dihapus", { description: `Fitur '${featureToDelete.name}' berhasil dihapus.` });
                setFeatureToDelete(null);
            },
            onError: (err: any) => {
                toast.error("Gagal", { description: err.message });
                setFeatureToDelete(null);
            }
        });
    };

    if (!isValidId) return <div className="p-8 text-center"><Frown className="mx-auto h-12 w-12 text-red-500" /><p>ID Tidak Valid</p></div>;
    if (isLoadingTotal) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-8 bg-slate-50/30 min-h-screen">
            {/* --- TOP HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1 cursor-pointer hover:underline" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Kembali ke Proyek</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{projectName}</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Kelola cakupan testing fitur aplikasi
                    </p>
                </div>
                <Button onClick={handleOpenCreateDialog} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Fitur
                </Button>
            </div>

            {/* --- DASHBOARD STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Fitur" value={featuresWithCount.length} icon={<Layers className="text-blue-500" />} color="blue" />
                <StatCard title="Fitur Aktif" value={activeFeatures} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
                <StatCard title="Total Test Case" value={totalTCs} icon={<BarChart3 className="text-purple-500" />} color="purple" />
            </div>

            {/* --- MAIN CONTENT --- */}
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-6 border-b">
                    <div className="w-full md:w-auto">
                        <CardTitle>Daftar Fitur</CardTitle>
                        <CardDescription>Cari dan kelola fungsionalitas aplikasi.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari fitur..." 
                            className="pl-9 bg-slate-50/50" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredFeatures.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700">Fitur & Deskripsi</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold text-slate-700">Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold text-slate-700">Tipe</TableHead>
                                    <TableHead className="text-center font-bold text-slate-700">Test Cases</TableHead>
                                    <TableHead className="text-right font-bold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFeatures.map((f) => (
                                    <TableRow key={f.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleViewTestCases(f.id)}>
                                                    {f.name}
                                                </span>
                                                <span className="text-xs text-slate-500 line-clamp-1 italic">{f.description || 'N/A'}</span>
                                                {f.tag && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                                                        <Tag className="h-3 w-3" /> {f.tag}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <StatusBadge status={f.status} />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-[10px] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border">
                                                {f.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
                                                onClick={() => handleViewTestCases(f.id)}
                                            >
                                                {f.testCaseCount} TC
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewTestCases(f.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Lihat TC
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(f)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handlePrepareDelete(f)} className="text-red-600 focus:bg-red-50">
                                                        <Trash className="mr-2 h-4 w-4" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-20 text-center"><Search className="mx-auto h-12 w-12 text-slate-200 mb-4" /><p className="text-slate-500 font-medium italic">Data tidak ditemukan</p></div>
                    )}
                </CardContent>
            </Card>

            {/* --- Dialogs --- */}
            <FeatureFormDialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen} initialData={initialFeatureData} projectId={projectId!} />
            
            <AlertDialog open={!!featureToDelete} onOpenChange={(o) => !o && setFeatureToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Fitur?</AlertDialogTitle>
                        <AlertDialogDescription>Semua test case di "{featureToDelete?.name}" akan ikut terhapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFeature} className="bg-red-600 hover:bg-red-700">Hapus Permanen</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// --- Sub-components for Cleanliness ---
const StatCard = ({ title, value, icon, color }: any) => (
    <Card className={`border-l-4 border-l-${color}-500 shadow-md`}>
        <CardContent className="p-5 flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p><h3 className="text-2xl font-bold text-slate-900">{value}</h3></div>
            <div className={`p-3 bg-${color}-50 rounded-xl`}>{icon}</div>
        </CardContent>
    </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        deprecated: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config[status] || "bg-slate-100 text-slate-600"}`}>
            {status}
        </span>
    );
};

export default FeaturesPage;