import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ChevronDown, ChevronUp, ExternalLink, Copy,
    AlertTriangle, CheckCircle, Info, XCircle, HelpCircle, Dna
} from 'lucide-react';
import { DrugRisk, RISK_COLORS, RISK_LABELS, SEVERITY_COLORS } from '../utils/mockData';
import TiltCard from '../components/TiltCard';

interface DrugCardProps {
    drug: DrugRisk;
    index: number;
    onViewJSON: (drug: DrugRisk) => void;
}

const RISK_ICONS: Record<string, React.ReactNode> = {
    safe: <CheckCircle size={16} />,
    adjust: <AlertTriangle size={16} />,
    toxic: <XCircle size={16} />,
    ineffective: <Info size={16} />,
    unknown: <HelpCircle size={16} />,
};

const DrugCard: React.FC<DrugCardProps> = ({ drug, index, onViewJSON }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const riskColor = RISK_COLORS[drug.riskLevel] || '#6b7280';
    const severityColor = SEVERITY_COLORS[drug.severity] || '#6b7280';

    // Mouse glow effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <TiltCard tiltMax={8}>
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                onMouseMove={handleMouseMove}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="rounded-2xl overflow-hidden relative group"
                style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${isHovered ? riskColor + '60' : 'var(--border)'}`,
                    boxShadow: isHovered
                        ? `0 12px 30px ${riskColor}15, var(--shadow-md)`
                        : 'var(--shadow-sm)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
            >
                {/* Mouse Glow */}
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: useTransform(
                            [mouseX, mouseY],
                            ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, ${riskColor}15, transparent 80%)`
                        ),
                    }}
                />

                {/* Card header - always visible */}
                <div className="p-5 relative z-10">
                    {/* Top row: drug name + risk label */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{drug.drug}</h3>
                            <div className="flex items-center gap-2">
                                <span
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                        background: `${riskColor}12`,
                                        border: `1px solid ${riskColor}30`,
                                        color: riskColor,
                                    }}
                                >
                                    {RISK_ICONS[drug.riskLevel]}
                                    {RISK_LABELS[drug.riskLevel]}
                                </span>
                                <span
                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                    style={{
                                        background: `${severityColor}12`,
                                        color: severityColor,
                                        border: `1px solid ${severityColor}25`,
                                    }}
                                >
                                    {drug.severity.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Confidence score ring */}
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
                                <motion.circle
                                    cx="28" cy="28" r="22" fill="none"
                                    stroke={riskColor}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 22}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - drug.confidence / 100) }}
                                    transition={{ duration: 1.5, delay: index * 0.1, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold" style={{ color: riskColor }}>{drug.confidence}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-muted)' }}>AI Confidence</span>
                            <span style={{ color: riskColor }}>{drug.confidence}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${drug.confidence}%` }}
                                transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                                style={{ background: riskColor }}
                            />
                        </div>
                    </div>

                    {/* Gene pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {drug.variants.map((v) => (
                            <span
                                key={v.gene}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                                style={{
                                    background: 'var(--primary-light)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--primary)',
                                }}
                            >
                                <Dna size={10} />
                                {v.gene}
                            </span>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                            style={{
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? 'Collapse' : 'Clinical Details'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onViewJSON(drug)}
                            className="px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                            style={{
                                background: `${riskColor}08`,
                                border: `1px solid ${riskColor}20`,
                                color: riskColor,
                            }}
                        >
                            <ExternalLink size={12} />
                            JSON
                        </motion.button>
                    </div>
                </div>

                {/* Expandable clinical section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden relative z-10"
                        >
                            <div
                                className="mx-4 mb-4 p-4 rounded-xl space-y-4"
                                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                            >
                                {/* Detected variants table */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"
                                        style={{ color: 'var(--text-muted)' }}>
                                        <Dna size={11} />
                                        Detected Variants
                                    </h4>
                                    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
                                        <table className="w-full text-[10px]">
                                            <thead>
                                                <tr style={{ background: 'var(--primary-light)' }}>
                                                    {['Gene', 'rsID', 'Diplotype', 'Phenotype'].map(h => (
                                                        <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: 'var(--primary)' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {drug.variants.map((v, i) => (
                                                    <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--bg-surface)' }}>
                                                        <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--primary)' }}>{v.gene}</td>
                                                        <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{v.rsId}</td>
                                                        <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--success)' }}>{v.diplotype}</td>
                                                        <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{v.phenotype}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Clinical summary */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Clinical Summary</h4>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{drug.clinicalSummary}</p>
                                </div>

                                {/* Recommendation */}
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        background: `${riskColor}08`,
                                        border: `1px solid ${riskColor}20`,
                                    }}
                                >
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: riskColor }}>
                                        Clinical Action
                                    </h4>
                                    <p className="text-xs leading-relaxed font-bold" style={{ color: 'var(--text-primary)' }}>{drug.recommendation}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </TiltCard>
    );
};

export default DrugCard;
