// src/components/reports/DeployDecisionCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rocket, ShieldAlert, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDeployDecision } from '@/hooks/useTestSuites';

interface DeployDecisionCardProps {
    testSuiteId: number;
    className?: string;
}

const DeployDecisionCard: React.FC<DeployDecisionCardProps> = ({ testSuiteId, className }) => {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useDeployDecision(testSuiteId);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> {t('testSuites.deployDecision.computing')}
                </CardContent>
            </Card>
        );
    }

    if (isError || !data) {
        return null; // Non-esensial — jangan pecahkan halaman laporan jika endpoint ini gagal.
    }

    const isDeployReady = data.decision === 'LAYAK_DEPLOY';

    return (
        <Card className={`overflow-hidden border-none shadow-xl ring-1 ${isDeployReady ? 'ring-emerald-200 dark:ring-emerald-500/30' : 'ring-red-200 dark:ring-red-500/30'} ${className}`}>
            <CardHeader className={`pb-3 ${isDeployReady ? 'bg-emerald-50/70 dark:bg-emerald-500/10' : 'bg-red-50/70 dark:bg-red-500/10'}`}>
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        {isDeployReady ? (
                            <Rocket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        {t('testSuites.deployDecision.title')}
                    </span>
                    <Badge className={isDeployReady ? 'bg-emerald-600' : 'bg-red-600'}>
                        {isDeployReady ? t('testSuites.deployDecision.ready') : t('testSuites.deployDecision.notReady')}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="text-muted-foreground">{t('testSuites.deployDecision.passRate')}</span>
                        <span className="font-bold text-lg">
                            {data.passRatePercent.toFixed(1)}%
                            <span className="text-xs font-normal text-muted-foreground ml-1">{t('testSuites.deployDecision.threshold', { value: data.thresholdPercent })}</span>
                        </span>
                    </div>
                    <Progress
                        value={Math.min(100, data.passRatePercent)}
                        indicatorClassName={isDeployReady ? 'bg-emerald-500' : 'bg-red-500'}
                    />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">{data.totalPassed}</div>
                        <div className="text-emerald-600 dark:text-emerald-400/80">{t('testSuites.deployDecision.passed')}</div>
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                        <div className="font-bold text-red-700 dark:text-red-400">{data.totalFailed}</div>
                        <div className="text-red-600 dark:text-red-400/80">{t('testSuites.deployDecision.failed')}</div>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-2">
                        <div className="font-bold text-amber-700 dark:text-amber-400">{data.totalError}</div>
                        <div className="text-amber-600 dark:text-amber-400/80">{t('testSuites.deployDecision.error')}</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                        <div className="font-bold text-foreground">{data.totalSkipped}</div>
                        <div className="text-muted-foreground">{t('testSuites.deployDecision.skipped')}</div>
                    </div>
                </div>

                <div className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${isDeployReady ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300'}`}>
                    {isDeployReady ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                    {data.reason}
                </div>
            </CardContent>
        </Card>
    );
};

export default DeployDecisionCard;
