// src/components/reports/DeployDecisionCard.tsx
import React from 'react';
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
    const { data, isLoading, isError } = useDeployDecision(testSuiteId);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Menghitung kelayakan deploy...
                </CardContent>
            </Card>
        );
    }

    if (isError || !data) {
        return null; // Non-esensial — jangan pecahkan halaman laporan jika endpoint ini gagal.
    }

    const isDeployReady = data.decision === 'LAYAK_DEPLOY';

    return (
        <Card className={`overflow-hidden border-none shadow-xl ring-1 ${isDeployReady ? 'ring-emerald-200' : 'ring-red-200'} ${className}`}>
            <CardHeader className={`pb-3 ${isDeployReady ? 'bg-emerald-50/70' : 'bg-red-50/70'}`}>
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        {isDeployReady ? (
                            <Rocket className="h-5 w-5 text-emerald-600" />
                        ) : (
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                        )}
                        Keputusan Deploy
                    </span>
                    <Badge className={isDeployReady ? 'bg-emerald-600' : 'bg-red-600'}>
                        {isDeployReady ? 'LAYAK DEPLOY' : 'TIDAK LAYAK DEPLOY'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="text-muted-foreground">Pass Rate</span>
                        <span className="font-bold text-lg">
                            {data.passRatePercent.toFixed(1)}%
                            <span className="text-xs font-normal text-muted-foreground ml-1">/ ambang {data.thresholdPercent}%</span>
                        </span>
                    </div>
                    <Progress
                        value={Math.min(100, data.passRatePercent)}
                        indicatorClassName={isDeployReady ? 'bg-emerald-500' : 'bg-red-500'}
                    />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-emerald-50 p-2">
                        <div className="font-bold text-emerald-700">{data.totalPassed}</div>
                        <div className="text-emerald-600">Passed</div>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2">
                        <div className="font-bold text-red-700">{data.totalFailed}</div>
                        <div className="text-red-600">Failed</div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2">
                        <div className="font-bold text-amber-700">{data.totalError}</div>
                        <div className="text-amber-600">Error</div>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-2">
                        <div className="font-bold text-slate-600">{data.totalSkipped}</div>
                        <div className="text-slate-500">Skipped</div>
                    </div>
                </div>

                <div className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${isDeployReady ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    {isDeployReady ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                    {data.reason}
                </div>
            </CardContent>
        </Card>
    );
};

export default DeployDecisionCard;
