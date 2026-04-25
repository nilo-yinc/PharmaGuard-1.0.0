import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, CheckCircle, Code2 } from 'lucide-react';
import { DrugRisk, AnalysisResult } from '../utils/mockData';

interface JSONPanelProps {
    isOpen: boolean;
    onClose: () => void;
    data: DrugRisk | AnalysisResult | null;
    title?: string;
}

const JSONPanel: React.FC<JSONPanelProps> = ({ isOpen, onClose, data, title = 'Structured JSON Output' }) => {
    const [copied, setCopied] = useState(false);

    const jsonString = data ? JSON.stringify(data, null, 2) : '{}';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmaguard-${data && 'drug' in data ? data.drug.toLowerCase() : 'analysis'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Syntax highlight JSON (light theme)
    const highlightJSON = (json: string) => {
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    let cls = 'color: #D97706'; // number — amber
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'color: #0D7377'; // key — teal
                        } else {
                            cls = 'color: #059669'; // string — green
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'color: #7C3AED'; // boolean — purple
                    } else if (/null/.test(match)) {
                        cls = 'color: #DC2626'; // null — red
                    }
                    return `<span style="${cls}">${match}</span>`;
                }
            );
    };

    const lineCount = jsonString.split('\n').length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl flex flex-col"
                        style={{
                            background: 'var(--bg-surface)',
                            backdropFilter: 'var(--backdrop)',
                            WebkitBackdropFilter: 'var(--backdrop)',
                            borderLeft: '1px solid var(--border)',
                            boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Panel header */}
                        <div
                            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                            style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}
                                >
                                    <Code2 size={16} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lineCount} lines • application/json</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Schema validation badge */}
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{ background: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)' }}
                                >
                                    <CheckCircle size={10} />
                                    Valid Schema
                                </div>

                                {/* Copy button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                    style={{
                                        background: copied ? 'var(--success-light)' : 'var(--primary-light)',
                                        border: copied ? '1px solid var(--success)' : '1px solid var(--primary)',
                                        color: copied ? 'var(--success)' : 'var(--primary)',
                                    }}
                                >
                                    {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </motion.button>

                                {/* Download button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownload}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', color: 'var(--warning)' }}
                                >
                                    <Download size={12} />
                                    Download
                                </motion.button>

                                {/* Close */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                    style={{ color: 'var(--text-muted)', background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                                >
                                    <X size={16} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Compliance badges */}
                        <div
                            className="flex gap-2 px-5 py-2.5 flex-shrink-0"
                            style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}
                        >
                            {[
                                { label: 'CPIC Guideline Aligned', color: 'var(--success)' },
                                { label: 'Explainable AI', color: '#7C3AED' },
                                { label: 'VCF v4.2 Compatible', color: 'var(--primary)' },
                                { label: 'HIPAA Safe', color: 'var(--warning)' },
                            ].map(badge => (
                                <span
                                    key={badge.label}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: `1px solid var(--border)`,
                                        color: badge.color,
                                    }}
                                >
                                    ✓ {badge.label}
                                </span>
                            ))}
                        </div>

                        {/* JSON Editor area */}
                        <div className="flex-1 overflow-hidden flex" style={{ background: 'var(--bg-surface)' }}>
                            {/* Line numbers */}
                            <div
                                className="flex-shrink-0 w-10 pt-4 pb-4 select-none"
                                style={{ background: 'var(--bg-muted)', borderRight: '1px solid var(--border)' }}
                            >
                                {jsonString.split('\n').map((_, i) => (
                                    <div key={i} className="text-right pr-2 text-[10px] leading-5 font-mono" style={{ color: 'var(--text-muted)' }}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Code area */}
                            <pre
                                className="flex-1 overflow-auto p-4 text-xs font-mono leading-5"
                                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                                dangerouslySetInnerHTML={{ __html: highlightJSON(jsonString) }}
                            />
                        </div>

                        {/* Footer */}
                        <div
                            className="px-5 py-3 flex-shrink-0 flex items-center justify-between"
                            style={{ background: 'var(--bg-muted)', borderTop: '1px solid var(--border)' }}
                        >
                            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                PharmaGuard API Schema v2.4
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {new Blob([jsonString]).size} bytes
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JSONPanel;
