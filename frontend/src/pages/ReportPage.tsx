import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Pill, Download, Share2,
    Trash2, FileText, AlertTriangle, ShieldCheck,
    BarChart3, Brain, Stethoscope, Code, Copy, Check, MessageSquare
} from 'lucide-react';
import { analysisApi, AnalysisResponse } from '../services/analysisApi';
import { deleteAnalysis, StoredAnalysis } from '../services/storageService';
import { RISK_COLORS } from '../utils/mockData';
import Dashboard from './Dashboard';
import ChatPanel from '../components/ai-chat/ChatPanel';

type TabId = 'summary' | 'clinical' | 'variants' | 'heatmap' | 'json';

const ReportPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<TabId>('summary');
    const [copied, setCopied] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!id) return;
            try {
                const { success, data, error } = await analysisApi.getResults(id);
                if (success && data) {
                    setAnalysis(data);
                } else {
                    setError(error || 'Failed to load report');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: '#E5E7EB', borderTopColor: '#0D7377' }} />
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)' }}>
                        <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
                    </div>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Report Not Found</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error || "This analysis report doesn't exist."}</p>
                    <Link to="/dashboard">
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}>
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleDelete = () => {
        if (id) {
            deleteAnalysis(id);
            navigate('/dashboard', { replace: true });
        }
    };

    const handleCopyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
    };

    const handleDownloadJSON = () => {
        const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${analysis.sampleId}-report.json`; a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadCSV = () => {
        const headers = ['Drug', 'Risk Level', 'Confidence', 'Severity', 'Gene', 'rsID', 'Diplotype', 'Phenotype', 'Recommendation'];
        const rows = analysis.results.flatMap(r =>
            r.variants.map(v => [r.drug, r.riskLevel, r.confidence, r.severity, v.gene, v.rsId, v.diplotype, v.phenotype, `"${r.recommendation}"`])
        );
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${analysis.sampleId}-report.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'summary' as TabId, label: 'Risk Summary', icon: <ShieldCheck size={13} /> },
        { id: 'clinical' as TabId, label: 'Clinical Decision', icon: <Stethoscope size={13} /> },
        { id: 'variants' as TabId, label: 'Variants Table', icon: <BarChart3 size={13} /> },
        { id: 'json' as TabId, label: 'Raw JSON', icon: <Code size={13} /> },
    ];

    const getRiskColor = (level: string) => RISK_COLORS[level] || 'var(--text-secondary)';
    const getRiskBg = (level: string) => {
        const map: Record<string, string> = { toxic: 'var(--danger-light)', adjust: 'var(--warning-light)', safe: 'var(--success-light)', ineffective: 'var(--info-light)', unknown: 'var(--bg-muted)' };
        return map[level] || 'var(--bg-muted)';
    };

    return (
        <div className="min-h-[calc(100vh-64px)] pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back button + actions */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>

                    <div className="flex items-center gap-2">
                        <button onClick={handleShareLink} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            <Share2 size={12} /> {showShareToast ? 'Link Copied!' : 'Share'}
                        </button>
                        <button onClick={handleDownloadJSON} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                            <Download size={12} /> JSON
                        </button>
                        <button onClick={handleDownloadCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                            <Download size={12} /> CSV
                        </button>
                        <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-50"
                            style={{ color: '#DC2626', border: '1px solid #FECACA' }}>
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                </div>

                {/* Report Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6 mb-6"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Sample ID</p>
                            <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{analysis.sampleId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Analysis Date</p>
                            <p className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                <Calendar size={12} style={{ color: 'var(--primary)' }} />
                                {new Date(analysis.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Drugs Analyzed</p>
                            <p className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                <Pill size={12} style={{ color: 'var(--accent)' }} />
                                {analysis.drugsAnalyzed.length} medications
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Risk Score</p>
                            <p className="text-sm font-bold" style={{ color: analysis.overallRiskScore > 60 ? '#DC2626' : analysis.overallRiskScore > 40 ? '#D97706' : '#059669' }}>
                                {analysis.overallRiskScore}/100
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap"
                            style={{
                                background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                                border: `1px solid ${activeTab === tab.id ? 'var(--primary-light)' : 'transparent'}`,
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Risk Summary */}
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysis.results.map((drug) => (
                                <div key={drug.drug} className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{drug.drug}</h4>
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                                            style={{ background: getRiskBg(drug.riskLevel), color: getRiskColor(drug.riskLevel) }}>
                                            {drug.riskLevel.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Confidence bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{drug.confidence}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                                            <div className="h-full rounded-full" style={{ width: `${drug.confidence}%`, background: 'var(--primary)' }} />
                                        </div>
                                    </div>

                                    {/* Variants */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {drug.variants.map(v => (
                                            <span key={v.rsId} className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                                                {v.gene} {v.diplotype}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{drug.clinicalSummary}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Clinical Decision */}
                    {activeTab === 'clinical' && (
                        <div className="space-y-4">
                            {analysis.results.map((drug) => (
                                <div key={drug.drug} className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: getRiskBg(drug.riskLevel) }}>
                                            <Stethoscope size={18} style={{ color: getRiskColor(drug.riskLevel) }} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{drug.drug}</h4>
                                            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Severity: {drug.severity}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                            <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--primary)' }}>CPIC GUIDELINE</p>
                                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{drug.cpicGuideline}</p>
                                        </div>
                                        <div className="p-4 rounded-xl" style={{ background: getRiskBg(drug.riskLevel), border: `1px solid ${getRiskColor(drug.riskLevel)}20` }}>
                                            <p className="text-[10px] font-bold mb-1" style={{ color: getRiskColor(drug.riskLevel) }}>RECOMMENDATION</p>
                                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{drug.recommendation}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                        <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>MECHANISM</p>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{drug.mechanism}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Variants Table */}
                    {activeTab === 'variants' && (
                        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Drug</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Gene</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>rsID</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Diplotype</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Phenotype</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Risk</th>
                                            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Conf.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.results.flatMap(drug =>
                                            drug.variants.map((v, vi) => (
                                                <tr key={`${drug.drug}-${vi}`} className="transition-colors hover:bg-opacity-50 hover:bg-gray-50" style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{drug.drug}</td>
                                                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--primary)' }}>{v.gene}</td>
                                                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{v.rsId}</td>
                                                    <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{v.diplotype}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{v.phenotype}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                            style={{ background: getRiskBg(drug.riskLevel), color: getRiskColor(drug.riskLevel) }}>
                                                            {drug.riskLevel}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{drug.confidence}%</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* JSON Output */}
                    {activeTab === 'json' && (
                        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Raw Analysis Data</p>
                                <button onClick={handleCopyJSON} className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors hover:opacity-80"
                                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                    {copied ? <Check size={11} /> : <Copy size={11} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="p-4 text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto" style={{ color: 'var(--text-primary)' }}>
                                {JSON.stringify(analysis, null, 2)}
                            </pre>
                        </div>
                    )}
                </motion.div>

                {/* Audit Trail */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center justify-center gap-4 flex-wrap"
                >
                    {[
                        { label: 'CPIC v24.2', color: '#059669' },
                        { label: `Model v2.4.0`, color: '#0D7377' },
                        { label: new Date(analysis.date).toISOString().split('.')[0] + 'Z', color: '#6B7280' },
                        { label: `${analysis.totalVariants} variants`, color: '#7C3AED' },
                    ].map(badge => (
                        <span key={badge.label} className="px-2.5 py-1 rounded-full text-[9px] font-mono font-medium"
                            style={{ background: `${badge.color}08`, border: `1px solid ${badge.color}20`, color: badge.color }}>
                            {badge.label}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Full Feature Dashboard */}
            <div className="mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <Dashboard selectedDrugs={analysis.drugsAnalyzed} />
            </div>

            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                    background: 'var(--primary)',
                    boxShadow: '0 4px 20px rgba(13,115,119,0.35)',
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <MessageSquare size={22} color="#fff" />
            </motion.button>

            {/* Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                analysis={analysis}
            />
        </div>
    );
};

export default ReportPage;
