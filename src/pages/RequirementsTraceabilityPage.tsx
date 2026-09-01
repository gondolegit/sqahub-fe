// src/pages/RequirementsTraceabilityPage.tsx
//
// Requirements Traceability Matrix per Proyek: setiap Feature (berperan sebagai unit requirement
// di model data ini — setiap Test Case wajib dikaitkan ke satu Feature) beserta Test Case-nya dan
// status eksekusi TERAKHIR masing-masing. Dua gap yang disorot: requirement tanpa test case sama
// sekali, dan test case yang belum pernah dieksekusi oleh Test Suite Run manapun.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    GitBranch, Loader2, AlertTriangle, Layers, ClipboardList, ShieldAlert, CircleSlash,
    ChevronRight, ChevronDown, ExternalLink,
} from 'lucide-react';

import { useProjects } from '@/hooks/useProjects';
import { useTraceabilityMatrix } from '@/hooks/useTraceability';
import { getStatusConfig } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import type { TraceabilityFeatureItem } from '@/types/traceability';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    tone: 'default' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, tone }) => (
    <Card className={tone === 'warning' && Number(value) > 0 ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-primary'}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
            <div className="p-2.5 bg-muted rounded-xl shrink-0">{icon}</div>
        </CardContent>
    </Card>
);

const NotExecutedBadge: React.FC<{ label: string }> = ({ label }) => (
    <Badge variant="outline" className="text-muted-foreground gap-1">
        <CircleSlash className="h-3 w-3" /> {label}
    </Badge>
);

const RequirementsTraceabilityPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
    const [expandedFeatureIds, setExpandedFeatureIds] = useState<Set<number>>(new Set());

    const { data: projectsPage, isLoading: isLoadingProjects } = useProjects({ size: 100 });
    const projects = projectsPage?.content;

    useEffect(() => {
        if (!selectedProjectId && projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects]);

    const { data: matrix, isLoading, isError } = useTraceabilityMatrix(selectedProjectId);

    const toggleFeature = (featureId: number) => {
        setExpandedFeatureIds((prev) => {
            const next = new Set(prev);
            if (next.has(featureId)) next.delete(featureId); else next.add(featureId);
            return next;
        });
    };

    const features = matrix?.features ?? [];
    const uncoveredCount = features.filter((f) => f.testCaseCount === 0).length;
    const totalTestCases = features.reduce((sum, f) => sum + f.testCaseCount, 0);
    const neverExecutedCount = features.reduce((sum, f) => sum + f.notExecutedCount, 0);

    const renderCoverageBadge = (feature: TraceabilityFeatureItem) => {
        if (feature.testCaseCount === 0) {
            return <Badge variant="destructive">{t('traceability.noCoverage')}</Badge>;
        }
        const tone = feature.coveragePercent >= 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400'
            : feature.coveragePercent > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400'
            : 'bg-muted text-muted-foreground';
        return <Badge className={tone}>{feature.coveragePercent.toFixed(0)}%</Badge>;
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <GitBranch className="h-7 w-7 mr-3 text-primary" /> {t('nav.traceability')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('traceability.subtitle')}</p>
                </div>
                <div className="w-full md:w-64 space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('qualityDashboard.projectLabel')}</label>
                    <Select
                        onValueChange={(v) => setSelectedProjectId(parseInt(v))}
                        value={selectedProjectId ? String(selectedProjectId) : undefined}
                        disabled={isLoadingProjects}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder={isLoadingProjects ? t('qualityDashboard.projectLoading') : t('qualityDashboard.projectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {projects?.map((project) => (
                                <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">{t('traceability.loading')}</p>
                </div>
            ) : isError ? (
                <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/30">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
                    {t('traceability.loadError')}
                </div>
            ) : !matrix ? (
                <div className="p-16 text-center text-muted-foreground">{t('qualityDashboard.selectProjectPrompt')}</div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title={t('traceability.stats.requirements')} value={features.length} icon={<Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />} tone="default" />
                        <StatCard title={t('traceability.stats.uncoveredRequirements')} value={uncoveredCount} icon={<ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />} tone="warning" />
                        <StatCard title={t('traceability.stats.totalTestCases')} value={totalTestCases} icon={<ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />} tone="default" />
                        <StatCard title={t('traceability.stats.neverExecuted')} value={neverExecutedCount} icon={<CircleSlash className="h-5 w-5 text-amber-600 dark:text-amber-400" />} tone="warning" />
                    </div>

                    <Card className="shadow-lg border-none">
                        <CardContent className="p-0">
                            {features.length === 0 ? (
                                <div className="py-16 text-center text-muted-foreground text-sm">{t('traceability.emptyHint')}</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]" />
                                            <TableHead>{t('traceability.table.requirement')}</TableHead>
                                            <TableHead className="text-center">{t('traceability.table.testCaseCount')}</TableHead>
                                            <TableHead className="text-center">{t('traceability.table.executed')}</TableHead>
                                            <TableHead className="text-center">{t('traceability.table.passed')}</TableHead>
                                            <TableHead className="text-center">{t('traceability.table.failed')}</TableHead>
                                            <TableHead className="text-center">{t('traceability.table.coverage')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {features.map((feature) => {
                                            const isExpanded = expandedFeatureIds.has(feature.featureId);
                                            return (
                                                <React.Fragment key={feature.featureId}>
                                                    <TableRow
                                                        className="cursor-pointer"
                                                        onClick={() => feature.testCaseCount > 0 && toggleFeature(feature.featureId)}
                                                    >
                                                        <TableCell>
                                                            {feature.testCaseCount > 0 && (
                                                                isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{feature.featureName}</TableCell>
                                                        <TableCell className="text-center">{feature.testCaseCount}</TableCell>
                                                        <TableCell className="text-center">{feature.executedCount}</TableCell>
                                                        <TableCell className="text-center text-emerald-600 dark:text-emerald-400 font-medium">{feature.passedCount || '-'}</TableCell>
                                                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">{feature.failedCount || '-'}</TableCell>
                                                        <TableCell className="text-center">{renderCoverageBadge(feature)}</TableCell>
                                                    </TableRow>
                                                    {isExpanded && feature.testCases.map((tc) => (
                                                        <TableRow key={tc.testCaseId} className="bg-muted/30 hover:bg-muted/50">
                                                            <TableCell />
                                                            <TableCell colSpan={2} className="py-2">
                                                                <div className="flex items-center gap-2 pl-4">
                                                                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                                    <span className="text-sm">{tc.testCaseName}</span>
                                                                    {tc.tag && <Badge variant="outline" className="text-[10px]">{tc.tag}</Badge>}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell colSpan={2} className="py-2 text-xs text-muted-foreground">
                                                                {tc.lastTestSuiteName ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); navigate(`/test-suites/detail/${tc.lastTestSuiteId}`); }}
                                                                        className="flex items-center gap-1 hover:text-primary hover:underline"
                                                                    >
                                                                        {tc.lastTestSuiteName} <ExternalLink className="h-3 w-3" />
                                                                    </button>
                                                                ) : '-'}
                                                            </TableCell>
                                                            <TableCell colSpan={2} className="py-2 text-center">
                                                                {tc.lastExecutionStatus ? (
                                                                    <div className="flex flex-col items-center gap-0.5">
                                                                        <Badge className={getStatusConfig(tc.lastExecutionStatus).badgeClassName}>
                                                                            {tc.lastExecutionStatus}
                                                                        </Badge>
                                                                        {tc.lastExecutedAt && (
                                                                            <span className="text-[10px] text-muted-foreground">{formatDate(tc.lastExecutedAt, true)}</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <NotExecutedBadge label={t('traceability.neverExecuted')} />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default RequirementsTraceabilityPage;
