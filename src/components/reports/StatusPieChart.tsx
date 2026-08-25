// src/components/reports/StatusPieChart.tsx

import React from 'react';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer // 🚨 PENTING: Import tipe bawaan recharts
} from 'recharts';

import type { 
    PieLabelRenderProps // 🚨 PENTING: Import tipe bawaan recharts
} from 'recharts';

interface PieData {
    name: string;
    value: number;
    color: string;
    totalRuns?: number;
    percent: number; // Tetap definisikan ini di data kita
    // recharts' <Pie data> mensyaratkan index signature (ChartDataInput); gunakan `unknown`, bukan `any`,
    // agar pemanggil tetap wajib menyempitkan tipe sebelum memakainya.
    [key: string]: unknown;
}

interface StatusPieChartProps {
    data: PieData[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: PieData }>;
}

// CustomTooltip tidak perlu diubah, karena ia menggunakan 'payload' yang tipenya berbeda
// dan kita sudah menangani null/undefined di sana.

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const value = item.value;
        const total = item.payload.totalRuns || 0;

        let percent = 0;
        if (total > 0) {
            percent = (value / total) * 100;
        }

        return (
            <div className="bg-white p-2 border shadow-lg text-sm rounded-md">
                <p className="font-bold text-lg" style={{ color: item.payload.color }}>
                    {item.name}:
                </p>
                <p>Total: {value}</p>
                <p>Persentase: {percent.toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
    const totalRuns = data.reduce((sum, entry) => sum + entry.value, 0);
    
    // Kita buat data yang akan diumpankan ke Pie Chart
    const dataWithTotal: PieData[] = data.map(item => ({
        ...item,
        totalRuns: totalRuns, 
        percent: totalRuns > 0 ? (item.value / totalRuns) : 0 
    }));
    
    const dataToRender = dataWithTotal.filter(item => item.value > 0);

    // 🚨 FUNGSI RENDER LABEL YANG DIPERBAIKI
    // Menggunakan PieLabelRenderProps dari recharts
    const renderCustomizedLabel = ({ name, percent }: PieLabelRenderProps) => {
        // Karena PieLabelRenderProps mendefinisikan name sebagai string | undefined, 
        // kita perlu pemeriksaan cepat:
        if (name && percent !== undefined) {
            // Percent yang dikirim Recharts adalah prop yang kita definisikan (desimal 0.XX)
            return `${name} (${(percent * 100).toFixed(0)}%)`;
        }
        return '';
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={dataToRender}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomizedLabel} // 🚨 Gunakan fungsi render yang baru
                >
                    {dataToRender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default StatusPieChart;