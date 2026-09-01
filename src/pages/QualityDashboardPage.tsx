// src/pages/QualityDashboardPage.tsx
//
// Quality Dashboard per Proyek: cakupan test case per fitur (untuk melihat gap pengujian),
// tren pass rate dari histori run yang sudah difinalisasi, dan keputusan kelayakan deploy
// dari run terakhir — semuanya dari satu panggilan agregat (useProjectDashboard).
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Gauge, Loader2, AlertTriangle, Layers, ClipboardList, ListChecks, TrendingUp,
    LineChart as LineChartIcon, BarChart3, ShieldAlert,
} from 'lucide-react';

import { useProjects } from '@/hooks/useProjects';
import { useProjectDashboard } from '@/hooks/useDashboard';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PassRateTrendChart from '@/components/dashboard/PassRateTrendChart';
import FeatureCoverageChart from '@/components/dashboard/FeatureCoverageChart';
import DeployDecisionCard from '@/components/reports/DeployDecisionCard';

const STAT_CARD_COLORS = {
    blue: { border: 'border-l-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-500/15', icon: 'text-blue-600 dark:text-blue-400' },
    emerald: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400' },
    purple: { border: 'border-l-purple-500', iconBg: 'bg-purple-50 dark:bg-purple-500/15', icon: 'text-purple-600 dark:text-purple-400' },
    amber: { border: 'border-l-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-500/15', icon: 'text-amber-600 dark:text-amber-400' },
} as const;

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: keyof typeof STAT_CARD_COLORS;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
    const { border, iconBg } = STAT_CARD_COLORS[color];
    return (
        <Card className={`border-l-4 ${border} shadow-md`}>
            <CardContent className="p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                <div className={`p-3 ${iconBg} rounded-xl shrink-0`}>{icon}</div>
            </CardContent>
        </Card>
    );
};

const QualityDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

    const { data: projectsPage, isLoading: isLoadingProjects } = useProjects({ size: 100 });
    const projects = projectsPage?.content;

    useEffect(() => {
        if (!selectedProjectId && projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects]);

    const { data: dashboard, isLoading: isLoadingDashboard, isError } = useProjectDashboard(selectedProjectId);

    const hasTrend = !!dashboard && dashboard.passRateTrend.length > 0;
    const hasFeatures = !!dashboard && dashboard.featureCoverage.length > 0;
    const gapCount = dashboard?.featureCoverage.filter((f) => f.testCaseCount === 0).length ?? 0;

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Gauge className="h-7 w-7 mr-3 text-primary" /> {t('nav.qualityDashboard')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('qualityDashboard.subtitle')}</p>
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

            {isLoadingDashboard ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">{t('qualityDashboard.composing')}</p>
                </div>
            ) : isError ? (
                <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/30">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
                    {t('qualityDashboard.loadError')}
                </div>
            ) : !dashboard ? (
                <div className="p-16 text-center text-muted-foreground">{t('qualityDashboard.selectProjectPrompt')}</div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title={t('qualityDashboard.stats.totalFeatures')}
                            value={dashboard.totalFeatures}
                            subtitle={gapCount > 0 ? t('qualityDashboard.stats.gapCount', { count: gapCount }) : t('qualityDashboard.stats.allCovered')}
                            icon={<Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            color="blue"
                        />
                        <StatCard
                            title={t('qualityDashboard.stats.totalTestCases')}
                            value={dashboard.totalTestCases}
                            icon={<ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            color="purple"
                        />
                        <StatCard
                            title={t('qualityDashboard.stats.testSuiteRun')}
                            value={dashboard.totalFinalizedRuns}
                            subtitle={t('qualityDashboard.stats.totalRunsSubtitle', { count: dashboard.totalTestSuiteRuns })}
                            icon={<ListChecks className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                            color="amber"
                        />
                        <StatCard
                            title={t('qualityDashboard.stats.overallPassRate')}
                            value={`${dashboard.statusBreakdown.passRatePercent.toFixed(1)}%`}
                            subtitle={t('qualityDashboard.stats.passRateSubtitle', { passed: dashboard.statusBreakdown.totalPassed, total: dashboard.statusBreakdown.totalTests })}
                            icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                            color="emerald"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Pass Rate Trend */}
                        <Card className="lg:col-span-3 shadow-lg border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <LineChartIcon className="h-5 w-5 mr-2 text-primary" /> {t('qualityDashboard.trend.title')}
                                </CardTitle>
                                <CardDescription>
                                    {hasTrend
                                        ? t('qualityDashboard.trend.subtitleWithData', { count: dashboard.passRateTrend.length })
                                        : t('qualityDashboard.trend.subtitleEmpty')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {hasTrend ? (
                                    <PassRateTrendChart
                                        data={dashboard.passRateTrend}
                                        thresholdPercent={dashboard.latestDeployDecision?.thresholdPercent ?? 95}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                                        <LineChartIcon className="h-10 w-10 opacity-20" />
                                        {t('qualityDashboard.trend.emptyHint')}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Latest Deploy Decision */}
                        <div className="lg:col-span-2">
                            {dashboard.latestDeployDecision ? (
                                <DeployDecisionCard testSuiteId={dashboard.latestDeployDecision.testSuiteId} className="h-full" />
                            ) : (
                                <Card className="h-full shadow-lg border-none flex items-center justify-center">
                                    <CardContent className="text-center text-muted-foreground text-sm p-8 space-y-2">
                                        <ShieldAlert className="h-10 w-10 mx-auto opacity-20" />
                                        {t('qualityDashboard.deployDecision.empty')}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Feature Coverage */}
                    <Card className="shadow-lg border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <BarChart3 className="h-5 w-5 mr-2 text-primary" /> {t('qualityDashboard.coverage.title')}
                            </CardTitle>
                            <CardDescription>
                                {hasFeatures
                                    ? t('qualityDashboard.coverage.subtitleWithData')
                                    : t('qualityDashboard.coverage.subtitleEmpty')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasFeatures ? (
                                <FeatureCoverageChart data={dashboard.featureCoverage} />
                            ) : (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    {t('qualityDashboard.coverage.emptyHint')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default QualityDashboardPage;
