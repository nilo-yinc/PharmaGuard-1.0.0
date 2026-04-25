import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, X, AlertTriangle, CheckCircle, ChevronRight,
    Pill, Activity, TrendingDown, Zap, Shield, Target
} from 'lucide-react';
import { MOCK_ANALYSIS_RESULT, RISK_COLORS, SEVERITY_COLORS, DrugRisk } from '../utils/mockData';

type CoPilotTab = 'copilot' | 'ranking' | 'pathway';

// ─── Drug Safety Ranking ────────────────────────────────────────────────────

const SAFETY_RANK_ORDER = ['safe', 'adjust', 'ineffective', 'toxic'];
const RANK_LABELS: Record<string, string> = {
    safe: '✅ Safest', adjust: '⚠️ Moderate', ineffective: '🔵 High Risk', toxic: '🔴 Critical',
};
const RANK_BG: Record<string, string> = {
    safe: '#ECFDF5', adjust: '#FFFBEB', ineffective: '#EFF6FF', toxic: '#FEF2F2',
};

// ─── AI Reasoning Pathway (SVG-based) ──────────────────────────────────────

const PATHWAY_NODES = [
    { id: 'variant', label: 'Variant', sub: 'CYP2D6 *1/*1xN', x: 50, y: 30, color: '#8b5cf6' },
    { id: 'gene', label: 'Gene Activity', sub: 'Ultra-rapid (>2× norm)', x: 200, y: 30, color: '#3b82f6' },
    { id: 'enzyme', label: 'Enzyme Level', sub: 'CYP2D6 overexpressed', x: 350, y: 30, color: '#f59e0b' },
    { id: 'plasma', label: 'Plasma Level', sub: '↑↑ Morphine conc.', x: 500, y: 30, color: '#ef4444' },
    { id: 'outcome', label: 'Clinical Outcome', sub: 'Opioid toxicity risk', x: 350, y: 120, color: '#ef4444' },
    { id: 'risk', label: 'Risk Decision', sub: 'CONTRAINDICATED', x: 180, y: 120, color: '#dc2626' },
];

const PathwayArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; delay?: number }> = ({ x1, y1, x2, y2, delay = 0 }) => {
    const ref = useRef<SVGLineElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const len = el.getTotalLength?.() ?? 100;
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        setTimeout(() => {
            el.style.transition = 'stroke-dashoffset 0.7s ease';
            el.style.strokeDashoffset = '0';
        }, delay * 1000);
    }, [delay]);
    return (
        <line ref={ref} x1={x1 + 45} y1={y1 + 16} x2={x2 + 5} y2={y2 + 16}
            stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)" />
    );
};

const ReasoningGraph: React.FC = () => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const paths: [number, number, number, number, number][] = [
        [50, 30, 200, 30, 0.2],
        [200, 30, 350, 30, 0.5],
        [350, 30, 500, 30, 0.8],
        [500, 30, 350, 120, 1.1],
        [350, 120, 180, 120, 1.4],
    ];
    return (
        <div className="relative">
            <svg viewBox="0 0 600 170" className="w-full" style={{ height: 170 }}>
                <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#6366f1" />
                    </marker>
                </defs>
                {paths.map(([x1, y1, x2, y2, d], i) => (
                    <PathwayArrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} delay={d} />
                ))}
                {PATHWAY_NODES.map(node => (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ cursor: 'pointer' }}>
                        <rect width="100" height="32" rx="8"
                            fill={hoveredNode === node.id ? node.color : `${node.color}20`}
                            stroke={node.color} strokeWidth="1.5" />
                        <text x="50" y="11" textAnchor="middle" fill={hoveredNode === node.id ? '#fff' : node.color}
                            fontSize="9" fontWeight="700">{node.label}</text>
                        <text x="50" y="24" textAnchor="middle" fill={hoveredNode === node.id ? '#fff' : '#6b7280'}
                            fontSize="7.5">{node.sub}</text>
                    </g>
                ))}
            </svg>
            <p className="text-[9px] text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                Hover nodes to highlight · Active risk path: CYP2D6 → CODEINE toxicity
            </p>
        </div>
    );
};

// ─── Main Co-Pilot Panel ────────────────────────────────────────────────────

interface AICoPilotPanelProps {
    isOpen: boolean;
    onClose: () => void;
    drugs?: DrugRisk[];
}

const AICoPilotPanel: React.FC<AICoPilotPanelProps> = ({ isOpen, onClose, drugs }) => {
    const [activeTab, setActiveTab] = useState<CoPilotTab>('copilot');
    const result = MOCK_ANALYSIS_RESULT;
    const allDrugs = drugs && drugs.length > 0 ? drugs : result.drugs;
    const hasCritical = allDrugs.some(d => d.severity === 'critical');

    const rankedDrugs = [...allDrugs].sort((a, b) => {
        const ra = SAFETY_RANK_ORDER.indexOf(a.riskLevel);
        const rb = SAFETY_RANK_ORDER.indexOf(b.riskLevel);
        return ra - rb;
    });

    const COPILOT_SUGGESTIONS = [
        {
            title: 'Safest Analgesic Substitution',
            icon: <Shield size={12} />,
            color: '#10b981',
            content: 'Replace Codeine with Oxycodone 5mg. Not CYP2D6-dependent; eliminates ultra-rapid conversion risk.',
        },
        {
            title: 'Dose Adjustment Priority',
            icon: <TrendingDown size={12} />,
            color: '#f59e0b',
            content: 'Reduce Azathioprine to 50mg and Warfarin to 2.5mg (25–40% reduction). Monitor CBC and INR weekly.',
        },
        {
            title: 'Monitoring Recommendations',
            icon: <Activity size={12} />,
            color: '#3b82f6',
            content: 'INR weekly ×4, CBC bi-weekly ×12 weeks, platelet function testing at day 7.',
        },
        {
            title: 'Red-Flag Contraindication',
            icon: <AlertTriangle size={12} />,
            color: '#ef4444',
            content: 'CODEINE and AZATHIOPRINE are CONTRAINDICATED at standard doses. Immediate review required.',
        },
    ];

    const tabs: { id: CoPilotTab; label: string; icon: React.ReactNode }[] = [
        { id: 'copilot', label: 'Co-Pilot', icon: <Brain size={12} /> },
        { id: 'ranking', label: 'Safety Rank', icon: <Target size={12} /> },
        { id: 'pathway', label: 'Risk Path', icon: <Zap size={12} /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.2)' }}
                        onClick={onClose}
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
                        style={{
                            width: 380,
                            background: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border)',
                            boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
                            animation: hasCritical ? 'criticalGlow 2s ease-in-out infinite alternate' : 'none',
                        }}
                    >
                        {/* Critical ring */}
                        {hasCritical && (
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 pointer-events-none rounded-none"
                                style={{ border: '2px solid #ef444440', boxShadow: 'inset 0 0 20px #ef444415' }}
                            />
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                            style={{ borderBottom: '1px solid var(--border)', background: hasCritical ? '#FEF2F280' : 'var(--bg-muted)' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: hasCritical ? '#FEF2F2' : 'var(--primary-light)' }}>
                                    <Brain size={15} style={{ color: hasCritical ? '#DC2626' : 'var(--primary)' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Clinical Co-Pilot</p>
                                    {hasCritical && (
                                        <p className="text-[9px] font-semibold" style={{ color: '#DC2626' }}>
                                            ⚠ CRITICAL RISK DETECTED
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                <X size={14} style={{ color: 'var(--text-secondary)' }} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-4 pt-3 pb-2 flex-shrink-0">
                            {tabs.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                                    style={{
                                        background: activeTab === t.id ? 'var(--primary-light)' : 'var(--bg-muted)',
                                        color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                                        border: `1px solid ${activeTab === t.id ? 'var(--border-hover)' : 'var(--border)'}`,
                                    }}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'copilot' && (
                                    <motion.div key="copilot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="space-y-3 pt-2">
                                        <div className="p-3 rounded-xl text-[10px]"
                                            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Reasoning:</span>{' '}
                                                Analysis of 4,287 variants across 7 pharmacogenes. CYP2D6 ultra-rapid phenotype drives immediate contraindication for opioids.
                                                TPMT intermediate status requires conservative thiopurine dosing. Multi-gene warfarin algorithm indicates 25–40% dose reduction.
                                            </p>
                                        </div>
                                        {COPILOT_SUGGESTIONS.map((s, i) => (
                                            <motion.div key={s.title}
                                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                className="p-3 rounded-xl"
                                                style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span style={{ color: s.color }}>{s.icon}</span>
                                                    <p className="text-[11px] font-bold" style={{ color: s.color }}>{s.title}</p>
                                                </div>
                                                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'ranking' && (
                                    <motion.div key="ranking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="pt-2 space-y-2">
                                        <p className="text-[9px] uppercase font-semibold tracking-wider mb-3"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            Drug Safety Ranking — 1 (Safest) → Highest Risk
                                        </p>
                                        {rankedDrugs.map((drug, idx) => {
                                            const rc = RISK_COLORS[drug.riskLevel];
                                            return (
                                                <motion.div key={drug.drug}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.07, layout: { duration: 0.3 } }}
                                                    className="flex items-center gap-3 p-3 rounded-xl"
                                                    style={{ background: RANK_BG[drug.riskLevel], border: `1px solid ${rc}20` }}>
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: `${rc}15`, color: rc }}>
                                                        <span className="text-xs font-black">{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{drug.drug}</p>
                                                        <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                                                            {drug.variants[0]?.phenotype}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
                                                        style={{ background: `${rc}15`, color: rc, border: `1px solid ${rc}25` }}>
                                                        {RANK_LABELS[drug.riskLevel]}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {activeTab === 'pathway' && (
                                    <motion.div key="pathway" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="pt-3">
                                        <p className="text-[9px] uppercase font-semibold tracking-wider mb-3"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            AI Reasoning Visual Graph — CODEINE Risk Path
                                        </p>
                                        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                            <ReasoningGraph />
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {[
                                                { step: 'Variant', desc: 'CYP2D6 *1/*1xN gene duplication detected in VCF', color: '#8b5cf6' },
                                                { step: 'Gene Activity', desc: 'Ultra-rapid metabolizer phenotype — >2× enzyme copies', color: '#3b82f6' },
                                                { step: 'Enzyme', desc: 'Excess CYP2D6 converts codeine → morphine at toxic rate', color: '#f59e0b' },
                                                { step: 'Plasma Level', desc: 'Morphine plasma concentration exceeds safe threshold', color: '#ef4444' },
                                                { step: 'Outcome', desc: 'Respiratory depression / opioid toxicity — life-threatening', color: '#dc2626' },
                                            ].map((s, i) => (
                                                <div key={s.step} className="flex items-start gap-2 text-[10px]">
                                                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
                                                    <span className="font-semibold flex-shrink-0" style={{ color: s.color }}>{s.step}:</span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AICoPilotPanel;
