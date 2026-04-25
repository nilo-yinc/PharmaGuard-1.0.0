import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Users, Award, Lock, Info } from 'lucide-react';
import {
    MOCK_ANALYSIS_RESULT,
    CONFIDENCE_DECOMPOSITION,
    POPULATION_STATS,
    FDA_BIOMARKER_PAIRS,
    RISK_COLORS,
} from '../utils/mockData';

// ─── Confidence Decomposition Gauge ─────────────────────────────────────────

const CircularGauge: React.FC<{ value: number; size?: number; color?: string; label?: string }> = ({
    value, size = 60, color = '#0D7377', label,
}) => {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                <text x={size / 2} y={size / 2 + 4} textAnchor="middle"
                    fontSize="11" fontWeight="800" fill={color}>{value}%</text>
            </svg>
            {label && <p className="text-[9px] text-center" style={{ color: 'var(--text-secondary)' }}>{label}</p>}
        </div>
    );
};

const ConfidenceDecompositionCard: React.FC<{ drugName: string; overallConfidence: number }> = ({
    drugName, overallConfidence,
}) => {
    const decomp = CONFIDENCE_DECOMPOSITION[drugName.toUpperCase()];
    if (!decomp) return null;

    const subScores = [
        { label: 'Evidence Strength', value: decomp.evidenceStrength, color: '#6366f1' },
        { label: 'Variant Coverage', value: decomp.variantCoverage, color: '#3b82f6' },
        { label: 'Data Quality', value: decomp.dataQuality, color: '#10b981' },
        { label: 'Guideline Alignment', value: decomp.guidelineAlignment, color: '#f59e0b' },
    ];

    return (
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{drugName}</p>
                    <p className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        CPIC Level {decomp.cpicLevel}
                        <span className="px-1 py-0.5 rounded text-[8px] font-bold"
                            style={{ background: '#ECFDF5', color: '#059669' }}>Grade A</span>
                    </p>
                </div>
                <CircularGauge value={overallConfidence} size={56} color={overallConfidence > 90 ? '#10b981' : '#f59e0b'} />
            </div>

            <div className="space-y-2">
                {subScores.map(s => (
                    <div key={s.label}>
                        <div className="flex justify-between text-[9px] mb-0.5">
                            <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                            <span className="font-semibold" style={{ color: s.color }}>{s.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: s.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${s.value}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Population Context Card ─────────────────────────────────────────────────

const RARITY_COLOR: Record<string, string> = {
    common: '#10b981', uncommon: '#f59e0b', rare: '#ef4444', 'very rare': '#7c3aed',
};

const PopulationContextCard: React.FC = () => {
    const genes = MOCK_ANALYSIS_RESULT.analyzedGenes;
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Users size={14} style={{ color: 'var(--primary)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Population Context</p>
            </div>
            {genes.map(gene => {
                const stat = POPULATION_STATS[gene];
                if (!stat) return null;
                const rc = RARITY_COLOR[stat.rarity];
                return (
                    <motion.div key={gene}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl"
                        style={{ background: 'var(--bg-surface)', border: `1px solid ${rc}20` }}>
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{gene}</span>
                                <span className="ml-2 text-[9px]" style={{ color: 'var(--text-secondary)' }}>{stat.phenotype}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
                                style={{ background: `${rc}15`, color: rc, border: `1px solid ${rc}20` }}>
                                {stat.rarity}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px]">
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Prevalence: <span className="font-semibold" style={{ color: rc }}>{stat.prevalence}%</span>
                                {' '}({stat.ancestry})
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Risk percentile: <span className="font-semibold" style={{ color: rc }}>{stat.percentile}th</span>
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: rc }}
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.percentile}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                        </div>
                        <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            This genotype is in the {stat.percentile}th risk percentile for this phenotype globally.
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ─── FDA Biomarker Badge System ──────────────────────────────────────────────

const FDABadgeCard: React.FC = () => {
    const [hoveredPair, setHoveredPair] = useState<string | null>(null);
    const drugs = MOCK_ANALYSIS_RESULT.drugs;

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Award size={14} style={{ color: '#DC2626' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>FDA PGx Biomarker Badges</p>
            </div>
            <div className="space-y-2">
                {drugs.map(drug => {
                    const pairs = drug.variants
                        .map(v => ({ key: `${v.gene}-${drug.drug}`, gene: v.gene, data: FDA_BIOMARKER_PAIRS[`${v.gene}-${drug.drug}`] }))
                        .filter(p => p.data?.recognized);

                    if (pairs.length === 0) return null;
                    return (
                        <div key={drug.drug} className="p-3 rounded-xl"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{drug.drug}</p>
                            <div className="flex flex-wrap gap-2">
                                {pairs.map(p => (
                                    <div key={p.key} className="relative">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            onMouseEnter={() => setHoveredPair(p.key)}
                                            onMouseLeave={() => setHoveredPair(null)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer"
                                            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                            <Shield size={9} style={{ color: '#DC2626' }} />
                                            <span className="text-[9px] font-bold" style={{ color: '#DC2626' }}>{p.data.label}</span>
                                            <span className="text-[9px]" style={{ color: '#6B7280' }}>· {p.gene}</span>
                                            <Info size={8} style={{ color: '#9CA3AF' }} />
                                        </motion.div>
                                        <AnimatePresence>
                                            {hoveredPair === p.key && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="absolute left-0 top-full mt-1 p-2 rounded-xl z-20 text-[9px] leading-relaxed w-56"
                                                    style={{ background: '#1f2937', color: '#f9fafb', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                                                    {p.data.tooltip}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Privacy Shield Toggle ───────────────────────────────────────────────────

const PrivacyShieldCard: React.FC = () => {
    const [privacyOn, setPrivacyOn] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div className="p-4 rounded-2xl" style={{ background: privacyOn ? '#FFFBEB' : 'var(--bg-surface)', border: `1px solid ${privacyOn ? '#FDE68A' : 'var(--border)'}` }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {privacyOn ? <Lock size={14} style={{ color: '#D97706' }} /> : <Eye size={14} style={{ color: 'var(--text-secondary)' }} />}
                    <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Genomic Privacy Shield</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                            {privacyOn ? 'Variant IDs masked · Auto-delete enabled' : 'Full data visible'}
                        </p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setPrivacyOn(v => !v); setConfirmed(false); }}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-colors"
                    style={{
                        background: privacyOn ? '#FDE68A' : 'var(--primary)',
                        color: privacyOn ? '#92400E' : 'white',
                    }}>
                    {privacyOn ? <><EyeOff size={10} className="inline mr-1" />Disable</> : <><Lock size={10} className="inline mr-1" />Enable</>}
                </motion.button>
            </div>

            {privacyOn && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {['rs████████ → masked', '██████████ → diplotype', 'auto-delete: 24h'].map(badge => (
                            <span key={badge} className="px-2 py-0.5 rounded text-[9px] font-mono"
                                style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                                🔒 {badge}
                            </span>
                        ))}
                    </div>
                    {!confirmed && (
                        <button
                            onClick={() => setConfirmed(true)}
                            className="text-[9px] px-2 py-1 rounded-lg underline"
                            style={{ color: '#D97706' }}>
                            Show raw JSON (confirm identity)
                        </button>
                    )}
                    {confirmed && (
                        <p className="text-[9px] font-mono p-2 rounded-lg overflow-x-auto"
                            style={{ background: '#1f2937', color: '#10b981' }}>
                            {`{ "rsId": "rs1065852", "diplotype": "*1/*1xN", ... }`}
                        </p>
                    )}
                </motion.div>
            )}
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const AdvancedInsights: React.FC = () => {
    const result = MOCK_ANALYSIS_RESULT;

    return (
        <div className="space-y-8">
            {/* Confidence Decomposition */}
            <div>
                <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Award size={13} style={{ color: 'var(--primary)' }} />
                    Confidence Decomposition System
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {result.drugs.map(drug => (
                        <ConfidenceDecompositionCard key={drug.drug} drugName={drug.drug} overallConfidence={drug.confidence} />
                    ))}
                </div>
            </div>

            {/* FDA Badges + Privacy + Population in 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <FDABadgeCard />
                    <PrivacyShieldCard />
                </div>
                <div>
                    <PopulationContextCard />
                </div>
            </div>
        </div>
    );
};

export default AdvancedInsights;
