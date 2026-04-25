import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, RefreshCw, TrendingDown,
    Shield, Clock, Info, Pill, ChevronRight
} from 'lucide-react';
import { MOCK_ANALYSIS_RESULT, RISK_COLORS } from '../utils/mockData';

const ALTERNATIVES: Record<string, { drug: string; reason: string; riskLevel: string }[]> = {
    CODEINE: [
        { drug: 'Oxycodone', reason: 'Not metabolized by CYP2D6; safer for UMs', riskLevel: 'safe' },
        { drug: 'Morphine', reason: 'Direct opioid agonist, no CYP2D6 activation required', riskLevel: 'adjust' },
        { drug: 'Acetaminophen', reason: 'Non-opioid first-line for mild-moderate pain', riskLevel: 'safe' },
    ],
    CLOPIDOGREL: [
        { drug: 'Ticagrelor', reason: 'Not CYP2C19-dependent; superior in IM/PM', riskLevel: 'safe' },
        { drug: 'Prasugrel', reason: 'Less CYP2C19 dependence; for ACS/PCI patients', riskLevel: 'adjust' },
    ],
    AZATHIOPRINE: [
        { drug: 'Mycophenolate', reason: 'Alternative immunosuppressant, no TPMT metabolism', riskLevel: 'safe' },
    ],
    WARFARIN: [
        { drug: 'Rivaroxaban', reason: 'Direct oral anticoagulant; no CYP2C9 variability', riskLevel: 'safe' },
        { drug: 'Apixaban', reason: 'Fixed dosing, no INR monitoring needed', riskLevel: 'safe' },
    ],
    SIMVASTATIN: [
        { drug: 'Rosuvastatin', reason: 'Minimal SLCO1B1 transport dependence', riskLevel: 'safe' },
        { drug: 'Pravastatin', reason: 'Hydrophilic; low myopathy risk', riskLevel: 'safe' },
    ],
    FLUOROURACIL: [],
};

const DOSAGE_GUIDANCE: Record<string, { guidance: string; monitoring: string[] }> = {
    WARFARIN: {
        guidance: 'Initiate at 25-40% reduced dose (2-2.5mg). Use warfarindosing.org algorithm.',
        monitoring: ['Weekly INR × 4 weeks', 'Target INR 2-3', 'Monthly INR after stable'],
    },
    SIMVASTATIN: {
        guidance: 'Maximum simvastatin 20mg/day. Consider rosuvastatin 10-20mg.',
        monitoring: ['CK at baseline', 'Myopathy assessment monthly', 'LFTs at 3 months'],
    },
    AZATHIOPRINE: {
        guidance: 'Reduce to 50% of standard dose. Titrate based on CBC.',
        monitoring: ['CBC every 2 weeks × 3 months', 'Monthly thereafter', 'Hold if WBC <3.0'],
    },
    CODEINE: {
        guidance: 'ABSOLUTE CONTRAINDICATION in ultra-rapid metabolizers. Discontinue immediately.',
        monitoring: ['Switch to alternative now', 'Monitor for withdrawal', 'Non-opioid pain scale'],
    },
    CLOPIDOGREL: {
        guidance: 'Switch to ticagrelor/prasugrel for ACS/PCI. If must use, consider 150mg maintenance with platelet testing.',
        monitoring: ['Platelet function at 1 week', 'MACE risk at 30 days', 'P2Y12 inhibition'],
    },
    FLUOROURACIL: {
        guidance: 'Standard 5-FU dosing appropriate. Proceed per oncology protocol.',
        monitoring: ['Mucositis assessment', 'CBC at nadir (days 10-14)', 'Standard tox monitoring'],
    },
};

const ClinicalDecisionPanel: React.FC = () => {
    const [expandedDrug, setExpandedDrug] = useState<string | null>('CODEINE');
    const result = MOCK_ANALYSIS_RESULT;
    const criticalDrugs = result.drugs.filter(d => d.severity === 'critical');

    return (
        <div className="space-y-5">
            {/* Critical safety banner */}
            {criticalDrugs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--danger)' }}
                >
                    <div
                        className="px-5 py-3 flex items-center gap-3"
                        style={{ background: 'var(--danger-light)' }}
                    >
                        <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                        <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: 'var(--danger)' }}>
                                ⚠ Critical Safety Alert — {criticalDrugs.length} Drug{criticalDrugs.length > 1 ? 's' : ''} Contraindicated
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Immediate action required · CPIC Grade A</p>
                        </div>
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
                    </div>
                    <div className="p-4 space-y-2" style={{ background: 'var(--danger-light)' }}>
                        {criticalDrugs.map(d => (
                            <p key={d.drug} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <span className="font-bold" style={{ color: 'var(--danger)' }}>{d.drug}:</span> {d.recommendation}
                            </p>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Critical', count: criticalDrugs.length, color: '#DC2626', icon: <AlertTriangle size={13} /> },
                    { label: 'High Risk', count: result.drugs.filter(d => d.riskLevel === 'toxic' || d.riskLevel === 'ineffective').length, color: '#D97706', icon: <TrendingDown size={13} /> },
                    { label: 'Adjust', count: result.drugs.filter(d => d.riskLevel === 'adjust').length, color: '#E8645A', icon: <RefreshCw size={13} /> },
                    { label: 'Safe', count: result.drugs.filter(d => d.riskLevel === 'safe').length, color: '#059669', icon: <CheckCircle size={13} /> },
                ].map(item => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.04 }}
                        className="p-3 rounded-xl text-center"
                        style={{ background: `${item.color}08`, border: `1px solid ${item.color}18` }}
                    >
                        <div className="flex justify-center mb-1" style={{ color: item.color }}>{item.icon}</div>
                        <p className="text-xl font-black" style={{ color: item.color }}>{item.count}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Per-drug cards */}
            <div className="space-y-3">
                {result.drugs.map((drug, i) => {
                    const alts = ALTERNATIVES[drug.drug] || [];
                    const dosage = DOSAGE_GUIDANCE[drug.drug];
                    const isOpen = expandedDrug === drug.drug;
                    const rc = RISK_COLORS[drug.riskLevel];

                    return (
                        <motion.div
                            key={drug.drug}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="rounded-xl overflow-hidden"
                            style={{
                                border: `1px solid ${rc}20`,
                                background: 'var(--bg-surface)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <button
                                onClick={() => setExpandedDrug(isOpen ? null : drug.drug)}
                                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
                                style={{ background: `${rc}04` }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${rc}08`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = `${rc}04`; }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${rc}10`, border: `1px solid ${rc}20` }}>
                                    <Pill size={13} style={{ color: rc }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{drug.drug}</p>
                                    <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{drug.variants[0]?.gene} · {drug.variants[0]?.phenotype}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                                    style={{ background: `${rc}10`, color: rc, border: `1px solid ${rc}25` }}>
                                    {drug.riskLevel.toUpperCase()}
                                </span>
                                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ borderTop: `1px solid ${rc}12` }}
                                    >
                                        <div className="p-4 space-y-3" style={{ background: 'var(--bg-muted)' }}>
                                            {dosage && (
                                                <div>
                                                    <p className="text-[9px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                                                        <Info size={9} /> Dosage Guidance
                                                    </p>
                                                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>{dosage.guidance}</p>
                                                    <p className="text-[9px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                                                        <Clock size={9} /> Monitoring
                                                    </p>
                                                    {dosage.monitoring.map(m => (
                                                        <p key={m} className="text-[10px] flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                            <span className="mt-0.5" style={{ color: 'var(--text-muted)' }}>•</span>{m}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            {alts.length > 0 && (
                                                <div>
                                                    <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                                                        <Shield size={9} /> Alternatives
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {alts.map(alt => (
                                                            <div key={alt.drug} className="flex items-start gap-2 p-2 rounded-lg"
                                                                style={{ background: `${RISK_COLORS[alt.riskLevel]}06`, border: `1px solid ${RISK_COLORS[alt.riskLevel]}15` }}>
                                                                <span className="text-[10px] font-bold" style={{ color: RISK_COLORS[alt.riskLevel] }}>✓</span>
                                                                <div>
                                                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{alt.drug}</p>
                                                                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{alt.reason}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {drug.riskLevel === 'safe' && (
                                                <div className="flex items-center gap-2 p-2.5 rounded-lg"
                                                    style={{ background: 'var(--success-light)', border: '1px solid var(--border)' }}>
                                                    <CheckCircle size={12} style={{ color: 'var(--success)' }} className="flex-shrink-0" />
                                                    <p className="text-xs" style={{ color: 'var(--success)' }}>Standard therapy is appropriate for this genotype.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClinicalDecisionPanel;
