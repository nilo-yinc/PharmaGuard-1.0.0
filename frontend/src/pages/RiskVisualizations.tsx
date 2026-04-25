import React from 'react';
import { motion } from 'framer-motion';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { AnalysisResult, HEATMAP_DATA, RADAR_DATA, RISK_COLORS } from '../utils/mockData';

interface RiskVisualizationsProps {
    result: AnalysisResult;
}

// Circular risk meter
const RiskMeter: React.FC<{ score: number }> = ({ score }) => {
    const radius = 70;
    const circumference = Math.PI * radius;
    const dashOffset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return '#DC2626';
        if (s >= 60) return '#D97706';
        if (s >= 40) return '#E8645A';
        return '#059669';
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width="180" height="110" viewBox="0 0 180 110">
                    <path
                        d={`M 20 100 A ${radius} ${radius} 0 0 1 160 100`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        className="text-gray-200 dark:text-gray-800"
                    />
                    <motion.path
                        d={`M 20 100 A ${radius} ${radius} 0 0 1 160 100`}
                        fill="none"
                        stroke={getColor(score)}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    />
                    {[0, 25, 50, 75, 100].map((tick) => {
                        const angle = -180 + (tick / 100) * 180;
                        const rad = (angle * Math.PI) / 180;
                        const x = 90 + (radius + 16) * Math.cos(rad);
                        const y = 100 + (radius + 16) * Math.sin(rad);
                        return (
                            <text key={tick} x={x} y={y + 4} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="monospace">
                                {tick}
                            </text>
                        );
                    })}
                </svg>
                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-4xl font-black"
                        style={{ color: getColor(score) }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-sm" style={{ color: '#9CA3AF' }}>/100</span>
                </div>
            </div>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Overall Risk Score</p>
            <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${getColor(score)}12`, border: `1px solid ${getColor(score)}30`, color: getColor(score) }}
            >
                {score >= 80 ? 'CRITICAL RISK' : score >= 60 ? 'HIGH RISK' : score >= 40 ? 'MODERATE RISK' : 'LOW RISK'}
            </div>
        </div>
    );
};

// Heatmap cell
const HeatmapCell: React.FC<{ value: number; drug: string; gene: string }> = ({ value, drug, gene }) => {
    const getHeatColor = (v: number) => {
        if (v >= 80) return { bg: 'rgba(220,38,38,0.15)', text: '#DC2626' };
        if (v >= 60) return { bg: 'rgba(217,119,6,0.15)', text: '#D97706' };
        if (v >= 40) return { bg: 'rgba(232,100,90,0.12)', text: '#E8645A' };
        if (v >= 20) return { bg: 'rgba(13,115,119,0.08)', text: '#0D7377' };
        return { bg: '#F9FAFB', text: '#D1D5DB' };
    };

    const { bg, text } = getHeatColor(value);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            title={`${gene} × ${drug}: ${value}%`}
            className="aspect-square rounded flex items-center justify-center text-xs font-bold cursor-pointer relative"
            style={{ background: bg, color: text }}
        >
            {value >= 40 ? value : ''}
        </motion.div>
    );
};

const RADAR_COLORS = ['#DC2626', '#D97706', '#2563EB', '#7C3AED', '#DC2626', '#059669'];

const RiskVisualizations: React.FC<RiskVisualizationsProps> = ({ result }) => {
    const drugs = ['codeine', 'warfarin', 'clopidogrel', 'simvastatin', 'azathioprine', 'fluorouracil'];

    return (
        <div className="space-y-8">
            {/* Row 1: Risk Meter + Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Risk Meter */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-6 rounded-2xl"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                        Overall Risk Assessment
                    </h3>
                    <div className="flex flex-col items-center">
                        <RiskMeter score={result.overallRiskScore} />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                        {result.drugs.map(d => (
                            <div key={d.drug} className="flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[d.riskLevel] }} />
                                <span style={{ color: 'var(--text-secondary)' }} className="truncate">{d.drug}</span>
                                <span className="ml-auto font-mono" style={{ color: 'var(--text-muted)' }}>{d.confidence}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-6 rounded-2xl"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                        Multi-Drug Risk Radar
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={RADAR_DATA}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                            />
                            {result.drugs.slice(0, 4).map((d, i) => (
                                <Radar
                                    key={d.drug}
                                    name={d.drug}
                                    dataKey={d.drug.toLowerCase()}
                                    stroke={RADAR_COLORS[i]}
                                    fill={RADAR_COLORS[i]}
                                    fillOpacity={0.08}
                                    strokeWidth={1.5}
                                />
                            ))}
                            <Legend
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', color: '#6B7280' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Clinical Risk Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Clinical Risk Heatmap — Genes × Drugs
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }} />
                            Low
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded" style={{ background: 'rgba(232,100,90,0.15)' }} />
                            Moderate
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded" style={{ background: 'rgba(220,38,38,0.2)' }} />
                            High
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div style={{ minWidth: 500 }}>
                        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}>
                            <div className="text-xs font-mono text-right pr-2" style={{ color: '#9CA3AF' }}>Gene</div>
                            {drugs.map(d => (
                                <div key={d} className="text-center text-[10px] font-mono truncate uppercase" style={{ color: '#9CA3AF' }}>
                                    {d.slice(0, 5)}
                                </div>
                            ))}
                        </div>

                        {HEATMAP_DATA.map((row, ri) => (
                            <motion.div
                                key={row.gene}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ri * 0.05 }}
                                className="grid gap-1 mb-1"
                                style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}
                            >
                                <div className="text-xs font-mono text-right pr-2 flex items-center justify-end" style={{ color: '#0D7377' }}>
                                    {row.gene}
                                </div>
                                {drugs.map(drug => (
                                    <HeatmapCell
                                        key={drug}
                                        value={row[drug as keyof typeof row] as number}
                                        drug={drug.toUpperCase()}
                                        gene={row.gene}
                                    />
                                ))}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RiskVisualizations;
