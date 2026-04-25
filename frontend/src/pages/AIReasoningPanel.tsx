import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
    Brain, Dna, FlaskConical, AlertTriangle, Activity,
    ChevronDown, Zap, Info
} from 'lucide-react';

interface PipelineNode {
    id: string;
    label: string;
    sublabel: string;
    value: string;
    color: string;
    icon: React.ReactNode;
    tooltip: string;
}

const PIPELINE_NODES: PipelineNode[] = [
    {
        id: 'variant',
        label: 'VCF Variant',
        sublabel: 'rs1065852',
        value: 'Detected',
        color: '#0D7377',
        icon: <Dna size={16} />,
        tooltip: 'rs1065852 is a single nucleotide polymorphism in exon 6 of CYP2D6 causing a splicing defect. Present in ~15% of Europeans.',
    },
    {
        id: 'gene',
        label: 'Gene Locus',
        sublabel: 'CYP2D6',
        value: 'Chr 22q13.2',
        color: '#2563EB',
        icon: <Dna size={16} />,
        tooltip: 'CYP2D6 (Cytochrome P450 2D6) is the most clinically significant pharmacogene, metabolizing ~25% of commonly prescribed drugs via hepatic oxidation.',
    },
    {
        id: 'diplotype',
        label: 'Diplotype',
        sublabel: '*1/*1xN',
        value: 'Gene Duplication',
        color: '#7C3AED',
        icon: <Activity size={16} />,
        tooltip: '*1/*1xN indicates a gene copy number >2 in a normal-function allele background, resulting in amplified CYP2D6 enzyme expression.',
    },
    {
        id: 'phenotype',
        label: 'Phenotype',
        sublabel: 'Ultra-rapid',
        value: 'Metabolizer',
        color: '#D97706',
        icon: <Brain size={16} />,
        tooltip: 'Ultra-rapid Metabolizer (UM) phenotype: CYP2D6 enzyme activity >2× normal. Observed in 1-5% of Europeans and up to 29% of Ethiopians.',
    },
    {
        id: 'enzyme',
        label: 'Enzyme Activity',
        sublabel: '>2.0× Normal',
        value: 'Score: 3.0',
        color: '#E8645A',
        icon: <Zap size={16} />,
        tooltip: 'Activity Score (AS) of 3.0 corresponds to ultra-rapid phenotype. Normal AS is 1.0-2.0. AS >2.0 predicts ultra-rapid metabolism across all CYP2D6 substrates.',
    },
    {
        id: 'drug_effect',
        label: 'Drug Effect',
        sublabel: 'Codeine → Morphine',
        value: '↑↑↑ Conversion',
        color: '#DC2626',
        icon: <FlaskConical size={16} />,
        tooltip: 'CYP2D6 O-demethylates codeine to morphine. In UMs, conversion rate is 3-5× normal, producing systemic morphine concentrations exceeding safe therapeutic thresholds.',
    },
    {
        id: 'clinical_risk',
        label: 'Clinical Risk',
        sublabel: 'CONTRAINDICATED',
        value: '🔴 Toxic',
        color: '#DC2626',
        icon: <AlertTriangle size={16} />,
        tooltip: 'CPIC Grade A: Codeine is absolutely contraindicated in UMs. Risk of life-threatening respiratory depression, apnea, and death. FDA Black Box Warning applies.',
    },
];

const FEATURE_IMPORTANCE = [
    { feature: 'CYP2D6 Activity Score', weight: 96, color: '#DC2626', desc: 'Primary driver' },
    { feature: 'CPIC Evidence Level A', weight: 99, color: '#0D7377', desc: 'Highest confidence' },
    { feature: 'Ultra-rapid Phenotype', weight: 91, color: '#7C3AED', desc: 'Confirmed UM' },
    { feature: 'Population Frequency', weight: 74, color: '#D97706', desc: 'Moderate match' },
    { feature: 'Variant Quality Score', weight: 88, color: '#059669', desc: 'High phred' },
];

const AIReasoningPanel: React.FC = () => {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const arrowsRef = useRef<SVGPathElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isExpanded) return;
        const paths = arrowsRef.current.filter(Boolean);
        paths.forEach((path, i) => {
            const length = path.getTotalLength?.() ?? 40;
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(path, {
                strokeDashoffset: 0,
                duration: 0.5,
                delay: i * 0.18 + 0.3,
                ease: 'power2.out',
            });
        });
    }, [isExpanded]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            {/* Header */}
            <button
                onClick={() => setIsExpanded(v => !v)}
                className="w-full px-6 py-4 flex items-center gap-3 transition-colors"
                style={{ borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}
                >
                    <Brain size={17} style={{ color: '#0D7377' }} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Reasoning Transparency</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Why this risk was predicted · 7-stage pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--primary)' }}
                    >
                        XAI v2.0
                    </span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={16} style={{ color: '#9CA3AF' }} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                        <div className="p-6 space-y-6" ref={containerRef}>
                            {/* Pipeline nodes */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Medical Neural Pipeline
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative">
                                    {PIPELINE_NODES.map((node, i) => (
                                        <React.Fragment key={node.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                                                className="relative cursor-pointer"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.04, y: -2 }}
                                                    className="p-2.5 rounded-xl text-center select-none transition-all duration-200"
                                                    style={{
                                                        background: activeNode === node.id ? `${node.color}10` : 'var(--bg-muted)',
                                                        border: `1px solid ${activeNode === node.id ? node.color + '40' : 'var(--border)'}`,
                                                    }}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-lg mx-auto mb-2 flex items-center justify-center"
                                                        style={{ background: `${node.color}12`, color: node.color }}
                                                    >
                                                        {node.icon}
                                                    </div>
                                                    <p className="text-[9px] mb-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>{node.label}</p>
                                                    <p className="text-[10px] font-bold leading-tight font-mono" style={{ color: node.color }}>
                                                        {node.sublabel}
                                                    </p>
                                                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{node.value}</p>
                                                </motion.div>

                                                <div
                                                    className="absolute -top-2 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                                    style={{ background: node.color }}
                                                >
                                                    {i + 1}
                                                </div>
                                            </motion.div>

                                            {i < PIPELINE_NODES.length - 1 && (
                                                <div className="hidden lg:flex items-center justify-center absolute"
                                                    style={{
                                                        left: `calc(${(i + 1) * (100 / PIPELINE_NODES.length)}% - 12px)`,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                    }}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="hidden lg:block mt-2">
                                    <svg width="100%" height="16" className="overflow-visible">
                                        {PIPELINE_NODES.slice(0, -1).map((node, i) => {
                                            return (
                                                <g key={i}>
                                                    <path
                                                        ref={el => { if (el) arrowsRef.current[i] = el; }}
                                                        d={`M 0 8 L 30 8`}
                                                        stroke={node.color}
                                                        strokeWidth="1.5"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        className="opacity-40"
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>

                                <div className="flex justify-between px-4 mt-1 lg:hidden">
                                    {PIPELINE_NODES.slice(0, -1).map((node, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scaleX: 0 }}
                                            animate={{ opacity: 1, scaleX: 1 }}
                                            transition={{ delay: i * 0.1 + 0.3 }}
                                            className="flex items-center flex-1"
                                        >
                                            <div className="h-px flex-1" style={{ background: `${node.color}30` }} />
                                            <div className="text-[8px]" style={{ color: PIPELINE_NODES[i + 1].color }}>▶</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Active node tooltip */}
                            <AnimatePresence>
                                {activeNode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="rounded-xl overflow-hidden"
                                        style={{
                                            background: `${PIPELINE_NODES.find(n => n.id === activeNode)?.color}06`,
                                            border: `1px solid ${PIPELINE_NODES.find(n => n.id === activeNode)?.color}20`,
                                        }}
                                    >
                                        <div className="p-4 flex gap-3">
                                            <Info size={14} className="flex-shrink-0 mt-0.5"
                                                style={{ color: PIPELINE_NODES.find(n => n.id === activeNode)?.color }} />
                                            <div>
                                                <p className="text-xs font-bold mb-1"
                                                    style={{ color: PIPELINE_NODES.find(n => n.id === activeNode)?.color }}>
                                                    {PIPELINE_NODES.find(n => n.id === activeNode)?.label}: {PIPELINE_NODES.find(n => n.id === activeNode)?.sublabel}
                                                </p>
                                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                    {PIPELINE_NODES.find(n => n.id === activeNode)?.tooltip}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Feature Importance */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Prediction Feature Importance
                                </p>
                                <div className="space-y-2.5">
                                    {FEATURE_IMPORTANCE.map((item, i) => (
                                        <motion.div
                                            key={item.feature}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 + 0.2 }}
                                        >
                                            <div className="flex justify-between text-xs mb-1">
                                                <span style={{ color: 'var(--text-secondary)' }}>{item.feature}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded"
                                                        style={{ background: `${item.color}10`, color: item.color }}>
                                                        {item.desc}
                                                    </span>
                                                    <span className="font-mono font-bold" style={{ color: item.color }}>
                                                        {item.weight}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.weight}%` }}
                                                    transition={{ duration: 1.2, delay: i * 0.1 + 0.4, ease: 'easeOut' }}
                                                    style={{ background: item.color }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Overall confidence */}
                            <div className="flex items-center justify-between p-4 rounded-xl"
                                style={{ background: 'var(--success-light)', border: '1px solid var(--border)' }}>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>Overall AI Confidence</p>
                                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Based on CPIC Grade A evidence + variant quality</p>
                                </div>
                                <div className="text-3xl font-black font-mono" style={{ color: 'var(--success)' }}>94%</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIReasoningPanel;
