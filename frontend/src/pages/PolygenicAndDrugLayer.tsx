import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Atom, Info, Zap } from 'lucide-react';
import {
    MOCK_ANALYSIS_RESULT, POLYGENIC_WEIGHTS, CYP_DRUG_ENZYME,
    ENZYME_ACTIVITY_MAP, ActivityLevel
} from '../utils/mockData';

// ─── Enzyme Competition Detection ───────────────────────────────────────────

function detectCYPCompetition(drugs: string[]): { enzyme: string; drugs: string[]; burden: number }[] {
    const enzymeMap: Record<string, string[]> = {};
    for (const drug of drugs) {
        const enzymes = CYP_DRUG_ENZYME[drug.toUpperCase()] || [];
        for (const enzyme of enzymes) {
            if (!enzymeMap[enzyme]) enzymeMap[enzyme] = [];
            enzymeMap[enzyme].push(drug);
        }
    }
    return Object.entries(enzymeMap)
        .filter(([, d]) => d.length > 1)
        .map(([enzyme, drugs]) => ({ enzyme, drugs, burden: Math.min(drugs.length * 28, 85) }));
}

// ─── Polygenic Risk Bar Chart ────────────────────────────────────────────────

const PolygenicRiskCard: React.FC<{ drugName: string }> = ({ drugName }) => {
    const weights = POLYGENIC_WEIGHTS[drugName.toUpperCase()];
    if (!weights || weights.length === 0) return null;
    const compositeScore = Math.round(weights.reduce((sum, w) => sum + w.weight, 0));
    const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{drugName}</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>Polygenic Risk Composition</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black" style={{ color: compositeScore > 80 ? '#ef4444' : compositeScore > 50 ? '#f59e0b' : '#10b981' }}>
                        {compositeScore}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>Composite Score</p>
                </div>
            </div>

            {/* Weighted stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                {weights.map((w, i) => (
                    <motion.div key={w.gene}
                        initial={{ width: 0 }} animate={{ width: `${w.weight}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }}
                        title={`${w.gene}: ${w.weight}%`}
                    />
                ))}
            </div>

            {/* Gene breakdown */}
            <div className="space-y-1.5">
                {weights.map((w, i) => (
                    <div key={w.gene} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{w.gene}</span>
                                <span className="text-[10px] font-semibold" style={{ color: COLORS[i % COLORS.length] }}>{w.weight}%</span>
                            </div>
                            <p className="text-[9px] truncate" style={{ color: 'var(--text-secondary)' }}>{w.impact}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Enzyme Activity Meter ───────────────────────────────────────────────────

const ACTIVITY_LEVELS: ActivityLevel[] = ['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid'];
const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
    poor: 'Poor', intermediate: 'Intermediate', normal: 'Normal', rapid: 'Rapid', ultrarapid: 'Ultra-Rapid',
};

const EnzymeActivityCard: React.FC<{ gene: string }> = ({ gene }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const activity = ENZYME_ACTIVITY_MAP[gene];
    if (!activity) return null;

    const levelIndex = ACTIVITY_LEVELS.indexOf(activity.level);

    return (
        <div className="p-3 rounded-xl relative"
            style={{ background: 'var(--bg-surface)', border: `1px solid ${activity.color}20` }}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <Atom size={11} style={{ color: activity.color }} />
                    <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{gene}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: `${activity.color}15`, color: activity.color }}>
                        {ACTIVITY_LABELS[activity.level]}
                    </span>
                    <button onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                        <Info size={10} style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>
            </div>

            {/* Activity scale */}
            <div className="flex items-center gap-0.5 mb-1">
                {ACTIVITY_LEVELS.map((lvl, i) => (
                    <motion.div key={lvl}
                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="flex-1 rounded-sm origin-bottom"
                        style={{
                            height: 6 + i * 3,
                            background: i <= levelIndex ? activity.color : 'var(--border)',
                            opacity: i === levelIndex ? 1 : i < levelIndex ? 0.7 : 0.3,
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-[8px]" style={{ color: 'var(--text-muted)' }}>
                <span>Poor</span><span>Normal</span><span>Ultra-Rapid</span>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute left-0 right-0 bottom-full mb-2 p-2 rounded-xl z-10 text-[10px] leading-relaxed"
                        style={{ background: '#1f2937', color: '#f9fafb', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                        {activity.explanation}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Metabolic Burden / CYP Competition Card ─────────────────────────────────

const MetabolicBurdenCard: React.FC<{ competitions: { enzyme: string; drugs: string[]; burden: number }[] }> = ({ competitions }) => {
    if (competitions.length === 0) return null;
    return (
        <div className="p-4 rounded-2xl" style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Zap size={14} style={{ color: '#D97706' }} />
                </div>
                <div>
                    <p className="text-sm font-bold" style={{ color: '#92400E' }}>Enzyme Competition Detected</p>
                    <p className="text-[9px]" style={{ color: '#B45309' }}>Multiple drugs share metabolic enzymes</p>
                </div>
            </div>
            <div className="space-y-3">
                {competitions.map((comp, i) => (
                    <motion.div key={comp.enzyme}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold font-mono" style={{ color: '#92400E' }}>{comp.enzyme}</span>
                            <span className="text-[9px] font-semibold" style={{ color: '#D97706' }}>
                                Metabolic Burden: {comp.burden}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#FDE68A' }}>
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: `${comp.burden}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {comp.drugs.map(d => (
                                <span key={d} className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                                    style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                                    {d}
                                </span>
                            ))}
                        </div>
                        <p className="text-[9px] mt-1" style={{ color: '#B45309' }}>
                            ⚠ These drugs compete for {comp.enzyme} — may alter plasma levels and increase toxicity risk.
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ─── Uncertainty Indicator ───────────────────────────────────────────────────

const UncertaintyCard: React.FC = () => {
    const uncertain = MOCK_ANALYSIS_RESULT.drugs.filter(d => d.confidence < 85);
    if (uncertain.length === 0) return null;
    return (
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} style={{ color: '#D97706' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Uncertainty Indicators</p>
            </div>
            <div className="space-y-2">
                {uncertain.map(drug => (
                    <div key={drug.drug} className="p-2.5 rounded-xl"
                        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold" style={{ color: '#92400E' }}>{drug.drug}</span>
                            <span className="text-[10px] font-semibold" style={{ color: '#D97706' }}>{drug.confidence}% confidence</span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: '#B45309' }}>
                            ⚠ Incomplete variant annotation for {drug.variants[0]?.gene}. Consult updated CPIC guidelines.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PolygenicAndDrugLayer: React.FC = () => {
    const result = MOCK_ANALYSIS_RESULT;
    const drugNames = result.drugs.map(d => d.drug);
    const competitions = detectCYPCompetition(drugNames);
    const drugsWithPolygenic = drugNames.filter(d => POLYGENIC_WEIGHTS[d]);
    const allGenes = result.analyzedGenes;

    return (
        <div className="space-y-6">
            {/* Metabolic Burden */}
            <MetabolicBurdenCard competitions={competitions} />

            {/* Polygenic Risk Aggregation */}
            <div>
                <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Atom size={13} style={{ color: 'var(--primary)' }} />
                    Polygenic Risk Aggregation Engine
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        Weighted Influence
                    </span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {drugsWithPolygenic.map(drug => (
                        <PolygenicRiskCard key={drug} drugName={drug} />
                    ))}
                </div>
            </div>

            {/* Enzyme Activity Meters */}
            <div>
                <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Zap size={13} style={{ color: '#f59e0b' }} />
                    Enzyme Activity Meters
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {allGenes.map(gene => (
                        <EnzymeActivityCard key={gene} gene={gene} />
                    ))}
                </div>
            </div>

            {/* Uncertainty Indicators */}
            <UncertaintyCard />
        </div>
    );
};

export default PolygenicAndDrugLayer;
