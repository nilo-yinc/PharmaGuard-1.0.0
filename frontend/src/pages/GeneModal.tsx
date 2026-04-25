import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dna, FlaskConical, Activity, MapPin, AlertCircle, BookOpen } from 'lucide-react';
import { Gene } from '../utils/mockData';

interface GeneModalProps {
    gene: Gene | null;
    onClose: () => void;
}

const GENE_CLINICAL_IMPORTANCE: Record<string, string> = {
    CYP2D6: 'One of the most clinically important pharmacogenes. Affects ~25% of all commonly prescribed drugs. FDA requires CYP2D6 testing for several medications.',
    CYP2C9: 'Critical for warfarin dosing. CPIC Grade A recommendations for CYP2C9 genotype-guided warfarin therapy reduce bleeding events.',
    VKORC1: 'Primary genetic determinant of warfarin sensitivity. VKORC1 −1639G>A accounts for ~25% of warfarin dose variability across patients.',
    CYP2C19: 'Loss-of-function variants lead to inadequate clopidogrel activation, increasing MACE risk by 30% in ACS/PCI patients.',
    TPMT: 'FDA Black Box Warning for azathioprine/6-MP. TPMT testing before thiopurine therapy is mandatory at many cancer centers.',
    DPYD: 'DPYD deficiency causes life-threatening fluoropyrimidine toxicity. European Medicines Agency mandates pre-treatment DPYD testing.',
    SLCO1B1: 'rs4149056 variant is the most predictive pharmacogenomic marker for statin-induced myopathy. Affects multiple hepatically transported drugs.',
};

const GENE_PATHWAY_DETAIL: Record<string, string> = {
    CYP2D6: 'Microsomal cytochrome P450 enzyme located in liver, intestine, and brain. Oxidates via hydroxylation and O-demethylation.',
    CYP2C9: 'Major hepatic P450 enzyme responsible for S-warfarin, phenytoin, and NSAID metabolism. Induced by rifampin.',
    VKORC1: 'Located on chromosome 16p11.2. Encodes the catalytic subunit of vitamin K epoxide reductase in the coagulation cascade.',
    CYP2C19: 'Hepatic enzyme responsible for prodrug bioactivation. Highly polymorphic — IM/PM phenotypes affect ~30% of East Asians.',
    TPMT: 'Cytosolic methyltransferase catalyzing S-methylation of thiopurine drugs. TPMT activity shows trimodal distribution in populations.',
    DPYD: 'Rate-limiting enzyme in fluoropyrimidine catabolism. ~80% of 5-FU is inactivated by DPYD in the liver.',
    SLCO1B1: 'OATP1B1 transporter encoded by SLCO1B1. Mediates Na+-independent hepatic uptake of statins, bile acids, and bilirubin.',
};

const GeneModal: React.FC<GeneModalProps> = ({ gene, onClose }) => {
    if (!gene) return null;

    const clinicalImportance = GENE_CLINICAL_IMPORTANCE[gene.name] || 'Critical pharmacogene with established CPIC guidelines.';
    const pathwayDetail = GENE_PATHWAY_DETAIL[gene.name] || gene.pathway;

    return (
        <AnimatePresence>
            {gene && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
                    >
                        {/* Modal */}
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl overflow-hidden"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Header */}
                            <div
                                className="px-6 py-5 flex items-start justify-between"
                                style={{ borderBottom: '1px solid var(--border)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}
                                    >
                                        <Dna style={{ color: '#0D7377' }} size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono mb-0.5 uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Pharmacogene Detail</p>
                                        <h2 className="text-2xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>{gene.name}</h2>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{gene.function}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--text-muted)', background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                                >
                                    <X size={16} />
                                </motion.button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                                {/* Key stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { icon: <MapPin size={13} />, label: 'Chromosome', value: gene.chromosome, color: '#0D7377' },
                                        { icon: <Activity size={13} />, label: 'Known Variants', value: `${gene.variants.length} alleles`, color: '#7C3AED' },
                                        { icon: <FlaskConical size={13} />, label: 'Affected Drugs', value: `${gene.affectedDrugs.length} drugs`, color: '#D97706' },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="p-3 rounded-xl text-center"
                                            style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}18` }}
                                        >
                                            <div className="flex justify-center mb-1.5" style={{ color: stat.color }}>{stat.icon}</div>
                                            <p className="text-[9px] mb-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                            <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Metabolic pathway */}
                                <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={13} style={{ color: '#7C3AED' }} />
                                        <p className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Metabolic Pathway</p>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{pathwayDetail}</p>
                                </div>

                                {/* Clinical importance */}
                                <div className="rounded-xl p-4" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle size={13} style={{ color: '#DC2626' }} />
                                        <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>Clinical Importance</p>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{clinicalImportance}</p>
                                </div>

                                {/* Affected drugs */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FlaskConical size={13} style={{ color: '#D97706' }} />
                                        <p className="text-xs font-semibold" style={{ color: '#D97706' }}>Associated Drugs</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {gene.affectedDrugs.map((drug, i) => (
                                            <motion.span
                                                key={drug}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', color: '#D97706' }}
                                            >
                                                {drug}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Star allele variants */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <BookOpen size={13} style={{ color: 'var(--primary)' }} />
                                        <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Known Allele Variants</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {gene.variants.map((v, i) => (
                                            <motion.span
                                                key={v}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="px-2.5 py-1 rounded-lg text-xs font-mono"
                                                style={{ background: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--primary)' }}
                                            >
                                                {gene.name} {v}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* CPIC note */}
                                <div className="rounded-xl p-3 flex items-start gap-3"
                                    style={{ background: 'var(--success-light)', border: '1px solid var(--border)' }}>
                                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ background: 'rgba(5,150,105,0.15)' }}>
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--success)' }}>C</span>
                                    </div>
                                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        CPIC guidelines available for <span className="font-semibold" style={{ color: 'var(--success)' }}>{gene.name}</span>. Clinical dosing recommendations are based on PharmGKB Level A evidence.
                                        Visit <span style={{ color: 'var(--success)' }}>cpicpgx.org</span> for full guideline documentation.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div
                                className="px-6 py-4 flex justify-end"
                                style={{ borderTop: '1px solid var(--border)' }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-sm font-medium"
                                    style={{ background: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--primary)' }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GeneModal;
