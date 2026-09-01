import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import API from '@/utils/api';
import {
    useFeatures,
    useDeleteFeature,
    type Feature,
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
interface TestCase { id: number; }
const fetchTestCasesByFeature = async (featureId: number): Promise<TestCase[]> => {
    if (featureId <= 0) return [];
    const response = await API.get<TestCase[]>(`/testcase/feature/${featureId}`);
    return response.data;
};

interface FeatureWithCount extends Feature {
    testCaseCount: number;
}

const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { projectId: projectIdStr } = useParams<{ projectId: string }>();
    const projectId = projectIdStr ? parseInt(projectIdStr) : undefined;
    const isValidId = projectId && !isNaN(projectId);

    const [searchQuery, setSearchQuery] = useState('');
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [initialFeatureData, setInitialFeatureData] = useState<Feature | null>(null);
    const [featureToDelete, setFeatureToDelete] = useState<{ id: number; name: string } | null>(null);

    const { data: features, isLoading: isLoadingFeatures } = useFeatures(isValidId ? projectId : -1);
    const { data: projectDetail, isLoading: isLoadingProject } = useProjectDetail(isValidId ? projectId : -1);
    const deleteMutation = useDeleteFeature();

    const projectName = projectDetail?.name || t('features.projectFallback', { id: projectId });

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
                toast.success(t('features.deleteSuccessTitle'), { description: t('features.deleteSuccessDescription', { name: featureToDelete.name }) });
                setFeatureToDelete(null);
            },
            onError: (err) => {
                const message = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || err.message : err.message;
                toast.error(t('features.deleteErrorTitle'), { description: message });
                setFeatureToDelete(null);
            }
        });
    };

    if (!isValidId) return <div className="p-8 text-center"><Frown className="mx-auto h-12 w-12 text-red-500" /><p>{t('features.invalidId')}</p></div>;
    if (isLoadingTotal) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-8 bg-muted/30 min-h-screen">
            {/* --- TOP HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1 cursor-pointer hover:underline" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('features.backToProjects')}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{projectName}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Layers className="h-4 w-4" /> {t('features.subtitle')}
                    </p>
                </div>
                <Button onClick={handleOpenCreateDialog} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('features.addFeature')}
                </Button>
            </div>

            {/* --- DASHBOARD STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title={t('features.stats.totalFeatures')} value={featuresWithCount.length} icon={<Layers className="text-blue-500" />} color="blue" />
                <StatCard title={t('features.stats.activeFeatures')} value={activeFeatures} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
                <StatCard title={t('features.stats.totalTestCases')} value={totalTCs} icon={<BarChart3 className="text-purple-500" />} color="purple" />
            </div>

            {/* --- MAIN CONTENT --- */}
            <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-6 border-b">
                    <div className="w-full md:w-auto">
                        <CardTitle>{t('features.listTitle')}</CardTitle>
                        <CardDescription>{t('features.listSubtitle')}</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('features.searchPlaceholder')}
                            className="pl-9 bg-muted/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredFeatures.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold text-foreground">{t('features.table.nameDescription')}</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold text-foreground">{t('features.table.status')}</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold text-foreground">{t('features.table.type')}</TableHead>
                                    <TableHead className="text-center font-bold text-foreground">{t('features.table.testCases')}</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">{t('features.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFeatures.map((f) => (
                                    <TableRow key={f.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleViewTestCases(f.id)}>
                                                    {f.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-clamp-1 italic">{f.description || 'N/A'}</span>
                                                {f.tag && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                                        <Tag className="h-3 w-3" /> {f.tag}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <StatusBadge status={f.status} />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-[10px] font-mono font-semibold bg-muted px-2 py-0.5 rounded border">
                                                {f.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/15 font-bold"
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
                                                    <DropdownMenuLabel>{t('features.actionsMenu')}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewTestCases(f.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> {t('features.viewTestCases')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(f)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> {t('features.edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handlePrepareDelete(f)} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/15">
                                                        <Trash className="mr-2 h-4 w-4" /> {t('features.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-20 text-center"><Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground font-medium italic">{t('features.notFound')}</p></div>
                    )}
                </CardContent>
            </Card>

            {/* --- Dialogs --- */}
            <FeatureFormDialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen} initialData={initialFeatureData} projectId={projectId!} />
            
            <AlertDialog open={!!featureToDelete} onOpenChange={(o) => !o && setFeatureToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('features.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('features.deleteConfirmDescription', { name: featureToDelete?.name })}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFeature} className="bg-red-600 hover:bg-red-700">{t('features.deleteConfirmAction')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// --- Sub-components for Cleanliness ---
// Kelas Tailwind harus berupa string statis lengkap agar terdeteksi oleh JIT compiler saat build produksi
// (string interpolation seperti `border-l-${color}-500` tidak akan pernah masuk ke CSS hasil build).
const STAT_CARD_COLORS = {
    blue: { border: 'border-l-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-500/15' },
    emerald: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/15' },
    purple: { border: 'border-l-purple-500', iconBg: 'bg-purple-50 dark:bg-purple-500/15' },
} as const;

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: keyof typeof STAT_CARD_COLORS;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const { border, iconBg } = STAT_CARD_COLORS[color];
    return (
        <Card className={`border-l-4 ${border} shadow-md`}>
            <CardContent className="p-5 flex items-center justify-between">
                <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p><h3 className="text-2xl font-bold text-foreground">{value}</h3></div>
                <div className={`p-3 ${iconBg} rounded-xl`}>{icon}</div>
            </CardContent>
        </Card>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();
    const config: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
        pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
        deprecated: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config[status] || "bg-muted text-muted-foreground"}`}>
            {t(`features.status.${status}`, status)}
        </span>
    );
};

export default FeaturesPage;