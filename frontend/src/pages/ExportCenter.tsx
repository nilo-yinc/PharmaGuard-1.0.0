import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileText, FileJson, Table2, Share2,
    ChevronDown, Check, Copy, ExternalLink
} from 'lucide-react';
import { MOCK_ANALYSIS_RESULT } from '../utils/mockData';

interface ExportOption {
    id: string;
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
}

const ExportCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleDownloadJSON = () => {
        const blob = new Blob([JSON.stringify(MOCK_ANALYSIS_RESULT, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmaguard-report-${MOCK_ANALYSIS_RESULT.sampleId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadCSV = () => {
        const rows = [
            ['Drug', 'Risk Level', 'Severity', 'Confidence', 'Gene', 'Diplotype', 'Phenotype', 'Recommendation'],
            ...MOCK_ANALYSIS_RESULT.drugs.map(d => [
                d.drug, d.riskLevel, d.severity, d.confidence,
                d.variants[0]?.gene || '', d.variants[0]?.diplotype || '',
                d.variants[0]?.phenotype || '', `"${d.recommendation}"`,
            ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmaguard-${MOCK_ANALYSIS_RESULT.sampleId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyJSON = async () => {
        await navigator.clipboard.writeText(JSON.stringify(MOCK_ANALYSIS_RESULT, null, 2));
        setCopiedId('copy');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const OPTIONS: ExportOption[] = [
        {
            id: 'json',
            label: 'Download JSON',
            desc: 'Full structured pharmacogenomic report',
            icon: <FileJson size={15} />,
            color: '#0D7377',
            action: handleDownloadJSON,
        },
        {
            id: 'csv',
            label: 'Export CSV',
            desc: 'Drug risk table for spreadsheet use',
            icon: <Table2 size={15} />,
            color: '#059669',
            action: handleDownloadCSV,
        },
        {
            id: 'copy',
            label: copiedId === 'copy' ? 'Copied!' : 'Copy JSON',
            desc: 'Copy report JSON to clipboard',
            icon: copiedId === 'copy' ? <Check size={15} /> : <Copy size={15} />,
            color: '#7C3AED',
            action: handleCopyJSON,
        },
        {
            id: 'pdf',
            label: 'Clinical PDF Report',
            desc: 'Formatted report for clinicians (mock)',
            icon: <FileText size={15} />,
            color: '#D97706',
            action: () => alert('[DEMO] PDF export would generate a formatted clinical report with CPIC guidelines, risk tables, and dosage recommendations.'),
        },
        {
            id: 'share',
            label: 'Share Report Link',
            desc: 'Generate shareable secure link (mock)',
            icon: <Share2 size={15} />,
            color: '#E8645A',
            action: () => alert('[DEMO] A secure, time-limited link would be generated: https://pharmaguard.ai/r/PG-2024-001847-secure'),
        },
        {
            id: 'fhir',
            label: 'Export FHIR R4',
            desc: 'HL7 FHIR Genomics bundle (mock)',
            icon: <ExternalLink size={15} />,
            color: '#2563EB',
            action: () => alert('[DEMO] FHIR R4 MolecularSequence + Observation bundle would be generated for EHR integration.'),
        },
    ];

    return (
        <div className="relative">
            {/* Trigger button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                    background: 'var(--primary-light)',
                    border: '1px solid var(--border)',
                    color: 'var(--primary)',
                }}
            >
                <Download size={15} />
                Export Report
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={14} />
                </motion.div>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl overflow-hidden"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            }}
                        >
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Export Center</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sample: {MOCK_ANALYSIS_RESULT.sampleId}</p>
                            </div>
                            <div className="p-2">
                                {OPTIONS.map((opt, i) => (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => { opt.action(); if (opt.id !== 'copy') setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group"
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                            style={{ background: `${opt.color}10`, border: `1px solid ${opt.color}20`, color: opt.color }}
                                        >
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {opt.label}
                                            </p>
                                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                                        </div>
                                        {opt.id === 'copy' && copiedId === 'copy' && (
                                            <Check size={12} style={{ color: '#059669' }} className="flex-shrink-0" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                            <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                                <p className="text-[9px] text-center" style={{ color: 'var(--text-muted)' }}>
                                    🔐 Data processed locally · No cloud storage
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExportCenter;
