import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, ArrowRight, Dna, Info, Lock, Eye, EyeOff, Users } from 'lucide-react';
import { GENOMIC_TIMELINE_STEPS, MOCK_GENES, Gene, MOCK_ANALYSIS_RESULT, RISK_COLORS } from '../utils/mockData';
import GeneModal from './GeneModal';
import TiltCard from '../components/TiltCard';

gsap.registerPlugin(ScrollTrigger);

// ─── Floating Trust Badges (fixed position) ───────────────────────────────────
export const FloatingBadges: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const badges = [
        { label: 'CPIC', color: '#059669', tooltip: 'CPIC Guideline Aligned' },
        { label: 'XAI', color: '#7C3AED', tooltip: 'Explainable AI Enabled' },
        { label: 'VCF', color: '#0D7377', tooltip: 'VCF v4.2 Compatible' },
        { label: 'FDA', color: '#D97706', tooltip: 'FDA Biomarker Aligned' },
    ];

    return (
        <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-1.5">
            <AnimatePresence>
                {expanded && badges.map((b, i) => (
                    <motion.div
                        key={b.label}
                        initial={{ opacity: 0, x: 30, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.8 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
                        className="px-3 py-1.5 rounded-full text-[10px] font-bold cursor-default whitespace-nowrap"
                        style={{
                            background: `${b.color}10`,
                            border: `1px solid ${b.color}30`,
                            color: b.color,
                        }}
                        title={b.tooltip}
                    >
                        {b.tooltip}
                    </motion.div>
                ))}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setExpanded(v => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{
                    background: 'var(--success-light)',
                    border: '1.5px solid var(--success)',
                    color: 'var(--success)',
                }}
                title="Compliance Badges"
            >
                ✓
            </motion.button>
        </div>
    );
};

// ─── Enhanced Genomic Timeline ─────────────────────────────────────────────────
export const GenomicTimeline: React.FC = () => {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const hasHighRisk = MOCK_ANALYSIS_RESULT.drugs.some(d => d.riskLevel === 'toxic');

    useEffect(() => {
        if (!lineRef.current) return;
        gsap.fromTo(lineRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: lineRef.current, start: 'top 80%' } }
        );
    }, []);

    const MINI_EXPLAINERS = [
        'Single nucleotide polymorphism (SNP) detected via next-generation sequencing with Phred quality ≥30.',
        'CYP2D6 gene expression amplified due to copy number variation (CNV). Duplicated gene → excess enzyme protein.',
        'Amplified CYP2D6 catalyzes O-demethylation of codeine 3-5× faster than normal. Activity Score >2.0.',
        'Excessive morphine generation from rapid codeine conversion exceeds renal clearance capacity.',
        'CPIC Grade A: Life-threatening respiratory depression risk. FDA Black Box Warning — contraindicated in UMs.',
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
            <div className="p-6 relative" ref={containerRef}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Genomic Impact Timeline</h3>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Variant detection to clinical consequence</p>
                    </div>
                    {hasHighRisk && (
                        <div
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                        >
                            ⚠ High Risk Detected
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="overflow-x-auto pb-3">
                    <div className="flex items-stretch gap-0 min-w-max relative">
                        {/* Connection line */}
                        <div className="absolute top-10 left-8 right-8 h-px" style={{ background: '#E5E7EB' }}>
                            <div ref={lineRef} className="h-full origin-left"
                                style={{ background: 'linear-gradient(90deg, #0D737740, #DC262640)', transformOrigin: 'left' }} />
                        </div>

                        {GENOMIC_TIMELINE_STEPS.map((step, i) => (
                            <div
                                key={step.step}
                                className="flex flex-col items-center w-40 relative"
                                onMouseEnter={() => setHoveredStep(step.step)}
                                onMouseLeave={() => setHoveredStep(null)}
                            >
                                <TiltCard tiltMax={12}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        {/* Icon */}
                                        <motion.div
                                            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl relative z-10"
                                            style={{
                                                background: `${step.color}08`,
                                                border: `2px solid ${hoveredStep === step.step ? step.color + '60' : step.color + '25'}`,
                                            }}
                                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                        >
                                            {step.icon}
                                        </motion.div>

                                        {/* Info card */}
                                        <div
                                            className="w-full px-2.5 py-2.5 rounded-xl text-center transition-all duration-200"
                                            style={{
                                                background: hoveredStep === step.step ? `${step.color}08` : 'var(--bg-muted)',
                                                border: `1px solid ${hoveredStep === step.step ? step.color + '30' : 'var(--border)'}`,
                                            }}
                                        >
                                            <p className="text-[9px] font-bold mb-0.5 uppercase tracking-wide" style={{ color: step.color }}>
                                                Step {step.step}
                                            </p>
                                            <p className="text-xs font-semibold mb-0.5 leading-tight" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                                            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
                                        </div>
                                    </motion.div>
                                </TiltCard>

                                    {/* Hover mini-explainer */}
                                    <AnimatePresence>
                                        {hoveredStep === step.step && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-56 p-3 rounded-xl text-[10px]"
                                                style={{
                                                    background: 'var(--bg-surface)',
                                                    border: `1px solid ${step.color}25`,
                                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                                }}
                                            >
                                                <div className="flex items-center gap-1 mb-1.5">
                                                    <Info size={9} style={{ color: step.color }} />
                                                    <p className="font-bold" style={{ color: step.color }}>{step.label}</p>
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">{MINI_EXPLAINERS[i]}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Enhanced Gene Explorer (with modal trigger) ───────────────────────────────
export const GeneExplorer: React.FC = () => {
    const [selectedGene, setSelectedGene] = useState<Gene | null>(null);
    const genes = Object.values(MOCK_GENES);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}>
                        <Dna size={15} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Interactive Gene Explorer</h3>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click any gene for full details</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {genes.map((gene, i) => (
                        <motion.button
                            key={gene.name}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedGene(gene)}
                            className="relative group px-4 py-2.5 rounded-xl font-mono font-bold text-sm"
                            style={{
                                background: 'var(--primary-light)',
                                border: '1px solid var(--border)',
                                color: 'var(--primary)',
                            }}
                        >
                            <span className="relative z-10">{gene.name}</span>
                            <span className="relative z-10 ml-2 text-[9px] opacity-50 font-normal">{gene.chromosome}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Info size={11} />
                    <span>7 pharmacogenes detected · Click to explore gene details, pathway, and variants</span>
                </div>
            </motion.div>

            {/* Gene modal */}
            <GeneModal gene={selectedGene} onClose={() => setSelectedGene(null)} />
        </>
    );
};

// ─── Compliance Badges Panel ───────────────────────────────────────────────────
export const ComplianceBadges: React.FC = () => {
    const badges = [
        { label: 'CPIC Guideline Aligned', desc: 'Clinical Pharmacogenomics Impl. Consortium', color: '#059669', icon: '✓' },
        { label: 'Explainable AI Enabled', desc: 'XAI transparency for all risk predictions', color: '#7C3AED', icon: '⚡' },
        { label: 'VCF v4.2 Compatible', desc: 'Supports VCF 4.1 and 4.2 standards', color: '#0D7377', icon: '🧬' },
        { label: 'HIPAA Compliant', desc: 'Patient data privacy protected', color: '#D97706', icon: '🔐' },
        { label: 'FDA Pharmacogenomics', desc: 'Aligned with FDA biomarker guidelines', color: '#2563EB', icon: '🏥' },
        { label: 'FHIR R4 Ready', desc: 'HL7 FHIR integration compatible', color: '#E8645A', icon: '⚕️' },
        { label: 'Evidence-Based Engine', desc: 'PharmGKB Level A evidence grading', color: '#D97706', icon: '📊' },
        { label: 'ISO 15189 Principles', desc: 'Clinical laboratory quality standards', color: '#4F46E5', icon: '🔬' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Audit & Compliance Certificates</h3>
            <p className="text-[10px] mb-5" style={{ color: 'var(--text-muted)' }}>All standards verified for clinical research use</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {badges.map((badge, i) => (
                    <TiltCard key={badge.label} tiltMax={10}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-2xl text-xs cursor-default h-full transition-all duration-300"
                            style={{
                                background: `${badge.color}06`,
                                border: `1px solid ${badge.color}18`,
                                backdropFilter: 'var(--backdrop)'
                            }}
                        >
                            <motion.div 
                                className="text-2xl mb-2"
                                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                            >
                                {badge.icon}
                            </motion.div>
                            <p className="font-bold mb-1 leading-tight" style={{ color: badge.color }}>{badge.label}</p>
                            <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{badge.desc}</p>
                        </motion.div>
                    </TiltCard>
                ))}
            </div>
        </motion.div>
    );
};

// ─── Data Privacy Mode ─────────────────────────────────────────────────────────
export const DataPrivacyBanner: React.FC<{ enabled: boolean }> = ({ enabled }) => (
    <AnimatePresence>
        {enabled && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div
                    className="px-5 py-2.5 flex items-center gap-3"
                    style={{ background: 'var(--warning-light)', borderBottom: '1px solid var(--warning)' }}
                >
                    <Lock size={13} style={{ color: 'var(--warning)' }} className="flex-shrink-0" />
                    <p className="text-[10px] flex-1" style={{ color: 'var(--warning)' }}>
                        <strong>Genomic Data Privacy Mode Active</strong> — Variant IDs masked · Session data auto-deleted on close · No server storage
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Multi-Patient Simulation ──────────────────────────────────────────────────
const PATIENT_PROFILES = [
    {
        id: 'PG-2024-001847',
        name: 'Patient A (Current)',
        genotype: 'CYP2D6 UM / CYP2C19 IM',
        risks: [
            { drug: 'Codeine', level: 'toxic', color: '#DC2626' },
            { drug: 'Warfarin', level: 'adjust', color: '#D97706' },
            { drug: 'Clopidogrel', level: 'ineffective', color: '#2563EB' },
            { drug: 'Simvastatin', level: 'adjust', color: '#D97706' },
            { drug: 'Azathioprine', level: 'toxic', color: '#DC2626' },
            { drug: 'Fluorouracil', level: 'safe', color: '#059669' },
        ],
    },
    {
        id: 'PG-2024-002301',
        name: 'Patient B (Simulated)',
        genotype: 'CYP2D6 PM / CYP2C19 NM',
        risks: [
            { drug: 'Codeine', level: 'ineffective', color: '#2563EB' },
            { drug: 'Warfarin', level: 'safe', color: '#059669' },
            { drug: 'Clopidogrel', level: 'safe', color: '#059669' },
            { drug: 'Simvastatin', level: 'safe', color: '#059669' },
            { drug: 'Azathioprine', level: 'safe', color: '#059669' },
            { drug: 'Fluorouracil', level: 'toxic', color: '#DC2626' },
        ],
    },
];

export const MultiPatientSimulation: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Users size={15} style={{ color: '#7C3AED' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Side-by-Side Risk Comparison</p>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold ml-auto"
                    style={{ background: '#F5F3FF', border: '1px solid #EDE9FE', color: '#7C3AED' }}>
                    DEMO · Anonymized
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PATIENT_PROFILES.map((patient, pi) => (
                    <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pi * 0.12 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                    >
                        {/* Patient header */}
                        <div className="px-4 py-3"
                            style={{
                                background: pi === 0 ? 'var(--primary-light)' : '#F5F3FF',
                                borderBottom: '1px solid var(--border)'
                            }}>
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{patient.name}</p>
                            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{patient.id} · {patient.genotype}</p>
                        </div>

                        {/* Risk grid */}
                        <div className="p-3 space-y-1.5">
                            {patient.risks.map((risk, i) => (
                                <motion.div
                                    key={risk.drug}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: pi * 0.12 + i * 0.04 }}
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                                    style={{ background: `${risk.color}06`, border: `1px solid ${risk.color}15` }}
                                >
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{risk.drug}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                                        style={{ background: `${risk.color}10`, color: risk.color }}>
                                        {risk.level.toUpperCase()}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Risk summary */}
                        <div className="px-4 py-2.5 flex gap-2 flex-wrap"
                            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
                            {['toxic', 'adjust', 'ineffective', 'safe'].map(lvl => {
                                const cnt = patient.risks.filter(r => r.level === lvl).length;
                                if (!cnt) return null;
                                const c = RISK_COLORS[lvl];
                                return (
                                    <span key={lvl} className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ background: `${c}10`, color: c }}>
                                        {cnt} {lvl}
                                    </span>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Difference highlight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl text-xs"
                style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}
            >
                <p className="font-semibold mb-1.5" style={{ color: '#7C3AED' }}>Key Risk Differences Detected</p>
                <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p>• <strong style={{ color: 'var(--text-primary)' }}>Codeine</strong>: Patient A → Toxic (CYP2D6 UM) vs Patient B → Ineffective (CYP2D6 PM)</p>
                    <p>• <strong style={{ color: 'var(--text-primary)' }}>Fluorouracil</strong>: Patient A → Safe (Normal DPYD) vs Patient B → Toxic (DPYD deficient)</p>
                    <p>• <strong style={{ color: 'var(--text-primary)' }}>Clopidogrel</strong>: Patient A → Ineffective (CYP2C19 IM) vs Patient B → Safe (NM)</p>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Legacy AI Explainability Panel (kept for backward compat) ─────────────────
export const AIExplainabilityPanel: React.FC = () => {
    const steps = [
        { from: 'VCF Variant', label: 'CYP2D6 *1/*1xN', color: '#0D7377', icon: <Dna size={14} /> },
        { from: 'Phenotype', label: 'Ultra-rapid Metabolizer', color: '#7C3AED', icon: <Brain size={14} /> },
        { from: 'Drug Interaction', label: 'Codeine → Morphine ↑↑', color: '#D97706', icon: <ArrowRight size={14} /> },
        { from: 'Clinical Risk', label: '🔴 Toxic — CONTRAINDICATED', color: '#DC2626', icon: <Info size={14} /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Brain size={15} style={{ color: 'var(--primary)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Pathway Summary</h3>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border)' }}>XAI</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {steps.map((step, i) => (
                    <React.Fragment key={i}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.12 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                            style={{ background: `${step.color}08`, border: `1px solid ${step.color}20`, color: step.color }}
                        >
                            {step.icon}
                            <div>
                                <div className="text-[9px] opacity-60 mb-0.5">{step.from}</div>
                                <div className="font-semibold">{step.label}</div>
                            </div>
                        </motion.div>
                        {i < steps.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: i * 0.12 + 0.1 }}
                                className="flex items-center"
                                style={{ color: 'var(--border)' }}
                            >
                                <div className="h-px w-4" style={{ background: 'var(--border)' }} />
                                <ArrowRight size={10} />
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
};
