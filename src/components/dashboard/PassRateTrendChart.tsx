// src/components/dashboard/PassRateTrendChart.tsx
import React from 'react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import type { PassRateTrendPoint } from '@/types/dashboard';

interface PassRateTrendChartProps {
    data: PassRateTrendPoint[];
    thresholdPercent?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: PassRateTrendPoint & { label: string } }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload;
    return (
        <div className="bg-card border border-border shadow-lg text-sm rounded-md p-3 space-y-1">
            <p className="font-bold text-foreground">{point.testSuiteName}</p>
            <p className="text-muted-foreground text-xs">{new Date(point.startDate).toLocaleDateString('id-ID')}</p>
            <p className="font-semibold" style={{ color: point.passRatePercent >= 95 ? '#10B981' : point.passRatePercent >= 70 ? '#F59E0B' : '#EF4444' }}>
                Pass Rate: {point.passRatePercent.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
                {point.totalPassed} passed · {point.totalFailed} failed · {point.totalError} error · {point.totalSkipped} skipped
            </p>
        </div>
    );
};

const PassRateTrendChart: React.FC<PassRateTrendChartProps> = ({ data, thresholdPercent = 95 }) => {
    const chartData = data.map((d, i) => ({
        ...d,
        label: `#${i + 1}`,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={thresholdPercent} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Ambang ${thresholdPercent}%`, fontSize: 10, fill: '#94a3b8', position: 'insideTopRight' }} />
                <Line
                    type="monotone"
                    dataKey="passRatePercent"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PassRateTrendChart;
