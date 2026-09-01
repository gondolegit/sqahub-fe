// src/components/dashboard/FeatureCoverageChart.tsx
//
// Menampilkan jumlah Test Case per Feature sebagai bar horizontal, diurutkan dari yang
// paling sedikit (backend sudah mengurutkan ascending) — feature dengan 0 test case
// ditandai sebagai "gap" cakupan yang perlu diperhatikan.
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import type { FeatureCoverageItem } from '@/types/dashboard';

interface FeatureCoverageChartProps {
    data: FeatureCoverageItem[];
}

const barColor = (count: number): string => {
    if (count === 0) return '#EF4444'; // red — gap cakupan
    if (count < 3) return '#F59E0B'; // amber — cakupan tipis
    return '#10B981'; // emerald — cakupan cukup
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: FeatureCoverageItem }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    const { t } = useTranslation();
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
        <div className="bg-card border border-border shadow-lg text-sm rounded-md p-3">
            <p className="font-bold text-foreground">{item.featureName}</p>
            <p className="text-muted-foreground text-xs">
                {item.testCaseCount === 0 ? t('qualityDashboard.coverageChart.gap') : t('qualityDashboard.coverageChart.count', { count: item.testCaseCount })}
            </p>
        </div>
    );
};

const ROW_HEIGHT = 34;

const FeatureCoverageChart: React.FC<FeatureCoverageChartProps> = ({ data }) => {
    const chartHeight = Math.max(120, data.length * ROW_HEIGHT);

    return (
        <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 24, left: 8, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
                    <YAxis
                        type="category"
                        dataKey="featureName"
                        width={140}
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                    <Bar dataKey="testCaseCount" radius={[0, 4, 4, 0]} barSize={16}>
                        {data.map((entry) => (
                            <Cell key={entry.featureId} fill={barColor(entry.testCaseCount)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FeatureCoverageChart;
