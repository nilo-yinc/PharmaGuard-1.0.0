import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Search, X, ChevronDown, FlaskConical, Check, Zap } from 'lucide-react';
import { SUPPORTED_DRUGS, SupportedDrug } from '../utils/mockData';

interface DrugInputProps {
    onDrugsSelected: (drugs: SupportedDrug[]) => void;
    onAnalyze: (drugs: SupportedDrug[]) => void;
    hasFile: boolean;
}

const DRUG_INFO: Record<SupportedDrug, { description: string; color: string }> = {
    CODEINE: { description: 'Opioid analgesic – CYP2D6 substrate', color: '#DC2626' },
    WARFARIN: { description: 'Anticoagulant – CYP2C9/VKORC1 substrate', color: '#D97706' },
    CLOPIDOGREL: { description: 'Antiplatelet – CYP2C19 prodrug', color: '#2563EB' },
    SIMVASTATIN: { description: 'Statin – SLCO1B1 transported', color: '#7C3AED' },
    AZATHIOPRINE: { description: 'Immunosuppressant – TPMT substrate', color: '#DC2626' },
    FLUOROURACIL: { description: 'Chemotherapy – DPYD substrate', color: '#059669' },
};

const DrugInput: React.FC<DrugInputProps> = ({ onDrugsSelected, onAnalyze, hasFile }) => {
    const [selectedDrugs, setSelectedDrugs] = useState<SupportedDrug[]>([]);
    const [search, setSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredDrugs = SUPPORTED_DRUGS.filter(
        drug => drug.toLowerCase().includes(search.toLowerCase()) && !selectedDrugs.includes(drug)
    );

    const toggleDrug = (drug: SupportedDrug) => {
        const updated = selectedDrugs.includes(drug)
            ? selectedDrugs.filter(d => d !== drug)
            : [...selectedDrugs, drug];
        setSelectedDrugs(updated);
        onDrugsSelected(updated);
        setSearch('');
    };

    const removeDrug = (drug: SupportedDrug) => {
        const updated = selectedDrugs.filter(d => d !== drug);
        setSelectedDrugs(updated);
        onDrugsSelected(updated);
    };

    const handleAnalyze = async () => {
        if (selectedDrugs.length === 0 || !hasFile) return;
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsAnalyzing(false);
        onAnalyze(selectedDrugs);
    };

    return (
        <section id="drugs" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                    style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                >
                    <FlaskConical size={12} />
                    Step 2 of 2
                </div>
                <h2 className="text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Select Medications</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-xl mx-auto">
                    Choose the drugs you want to analyze for pharmacogenomic interactions and risk assessment.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                {/* Drug selector */}
                <div className="relative mb-4" ref={dropdownRef}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Select Drugs for Analysis
                    </label>

                    {/* Selected drugs tags */}
                    {selectedDrugs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            <AnimatePresence>
                                {selectedDrugs.map(drug => (
                                    <motion.span
                                        key={drug}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                                        style={{
                                            background: `${DRUG_INFO[drug].color}10`,
                                            border: `1px solid ${DRUG_INFO[drug].color}30`,
                                            color: DRUG_INFO[drug].color,
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: DRUG_INFO[drug].color }} />
                                        {drug}
                                        <button
                                            onClick={() => removeDrug(drug)}
                                            className="hover:opacity-70 transition-opacity ml-0.5"
                                        >
                                            <X size={11} />
                                        </button>
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Search input */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            placeholder="Search drugs (e.g., Warfarin, Codeine...)"
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all duration-300"
                            style={{
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            onFocusCapture={(e) => {
                                (e.target as HTMLInputElement).style.borderColor = '#0D7377';
                                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(13,115,119,0.1)';
                            }}
                            onBlurCapture={(e) => {
                                (e.target as HTMLInputElement).style.borderColor = '#E5E7EB';
                                (e.target as HTMLInputElement).style.boxShadow = 'none';
                            }}
                        />
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    </div>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-20 left-0 right-0 mt-2 rounded-xl overflow-hidden"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-lg)',
                                    transformOrigin: 'top',
                                }}
                            >
                                {filteredDrugs.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
                                        {selectedDrugs.length === SUPPORTED_DRUGS.length
                                            ? 'All drugs selected'
                                            : 'No matching drugs found'}
                                    </div>
                                ) : (
                                    filteredDrugs.map((drug, i) => (
                                        <motion.button
                                            key={drug}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            onMouseDown={() => toggleDrug(drug)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ background: DRUG_INFO[drug].color }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{drug}</p>
                                                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{DRUG_INFO[drug].description}</p>
                                                </div>
                                            </div>
                                            {selectedDrugs.includes(drug) && (
                                                <Check size={14} style={{ color: '#0D7377' }} />
                                            )}
                                        </motion.button>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* All drugs quick-select */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>Or select predefined drugs:</span>
                        <button
                            onClick={() => {
                                setSelectedDrugs([...SUPPORTED_DRUGS]);
                                onDrugsSelected([...SUPPORTED_DRUGS]);
                            }}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#0D7377' }}
                        >
                            Select All
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SUPPORTED_DRUGS.map(drug => (
                            <motion.button
                                key={drug}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleDrug(drug)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{
                                    background: selectedDrugs.includes(drug)
                                        ? `${DRUG_INFO[drug].color}08`
                                        : 'var(--bg-muted)',
                                    border: `1px solid ${selectedDrugs.includes(drug) ? `${DRUG_INFO[drug].color}30` : 'var(--border)'}`,
                                    color: selectedDrugs.includes(drug) ? DRUG_INFO[drug].color : 'var(--text-secondary)',
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: selectedDrugs.includes(drug) ? DRUG_INFO[drug].color : 'currentColor', opacity: 0.6 }}
                                />
                                {drug}
                                {selectedDrugs.includes(drug) && (
                                    <Check size={10} className="ml-auto" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Validation message */}
                <AnimatePresence>
                    {(!hasFile || selectedDrugs.length === 0) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs"
                            style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', color: 'var(--warning)' }}
                        >
                            {!hasFile && '⚠ Upload a VCF file first. '}
                            {selectedDrugs.length === 0 && '⚠ Select at least one drug.'}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Analyze button */}
                <motion.button
                    whileHover={hasFile && selectedDrugs.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={hasFile && selectedDrugs.length > 0 ? { scale: 0.98 } : {}}
                    onClick={handleAnalyze}
                    disabled={!hasFile || selectedDrugs.length === 0 || isAnalyzing}
                    className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden"
                    style={{
                        background: hasFile && selectedDrugs.length > 0
                            ? 'var(--accent)'
                            : 'var(--bg-muted)',
                        color: hasFile && selectedDrugs.length > 0 ? '#fff' : 'var(--text-muted)',
                        boxShadow: hasFile && selectedDrugs.length > 0 ? '0 4px 14px rgba(232,100,90,0.25)' : 'none',
                        cursor: hasFile && selectedDrugs.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isAnalyzing ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Analyzing Genomic Profile...
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                Run Pharmacogenomic Analysis
                                {selectedDrugs.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-white/20">
                                        {selectedDrugs.length} drug{selectedDrugs.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </>
                        )}
                    </span>
                </motion.button>
            </motion.div>
        </section>
    );
};

export default DrugInput;
