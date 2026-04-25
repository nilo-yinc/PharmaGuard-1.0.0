import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BarChart3, AlertTriangle, Gauge, Clock, Search,
    Filter, Download, Eye, Trash2, FileText, TrendingUp,
    Pill, ShieldCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi } from '../services/analysisApi';
import { StoredAnalysis } from '../services/storageService';

const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const stats = useMemo(() => {
        const totalAnalyses = analyses.length;
        let highRiskDrugs = 0;
        let totalConfidence = 0;
        let confidenceCount = 0;

        analyses.forEach((a) => {
            a.results.forEach((r) => {
                if (r.riskLevel === 'toxic') highRiskDrugs++;
                totalConfidence += r.confidence;
                confidenceCount++;
            });
        });

        return {
            totalAnalyses,
            highRiskDrugs,
            avgConfidence: confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0
        };
    }, [analyses]);

    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<string>('all');

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { success, data } = await analysisApi.getRecentRecords(40);
            if (success && Array.isArray(data)) {
                setAnalyses(data);
            } else {
                setAnalyses([]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const filteredAnalyses = useMemo(() => {
        let result = analyses;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.drugsAnalyzed.some(d => d.toLowerCase().includes(q)) ||
                a.sampleId.toLowerCase().includes(q)
            );
        }
        if (riskFilter !== 'all') {
            result = result.filter(a => a.results.some(r => r.riskLevel === riskFilter));
        }
        return result;
    }, [analyses, searchQuery, riskFilter]);

    const handleDelete = (id: string) => {
        setAnalyses(prev => prev.filter(a => a.id !== id));
    };

    // Build risk trend chart data from analyses
    const trendData = useMemo(() => {
        return analyses.slice(0, 10).reverse().map((a, i) => ({
            name: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            riskScore: a.overallRiskScore,
            confidence: a.confidenceScore,
        }));
    }, [analyses]);

    const getRiskBadge = (level: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            toxic: { bg: 'var(--danger-light)', text: 'var(--danger)', label: 'Toxic' },
            adjust: { bg: 'var(--warning-light)', text: 'var(--warning)', label: 'Adjust' },
            safe: { bg: 'var(--success-light)', text: 'var(--success)', label: 'Safe' },
            ineffective: { bg: 'var(--info-light)', text: 'var(--info)', label: 'Ineffective' },
            unknown: { bg: 'var(--bg-muted)', text: 'var(--text-secondary)', label: 'Unknown' },
        };
        const m = map[level] || map.unknown;
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: m.bg, color: m.text }}>
                {m.label}
            </span>
        );
    };

    const statCards = [
        { label: 'Total Analyses', value: stats.totalAnalyses, icon: <BarChart3 size={18} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
        { label: 'High Risk Drugs', value: stats.highRiskDrugs, icon: <AlertTriangle size={18} />, color: 'var(--danger)', bg: 'var(--danger-light)' },
        { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: <Gauge size={18} />, color: 'var(--warning)', bg: 'var(--warning-light)' },
    ];

    const lastLogin = user?.lastLogin
        ? new Date(user.lastLogin).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown';

    return (
        <div className="min-h-[calc(100vh-64px)] pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6 mb-6"
                    style={{ background: 'linear-gradient(135deg, #0D7377 0%, #0A5C5F 100%)', color: 'white' }}
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                            <p className="text-sm opacity-80 flex items-center gap-1.5">
                                <Clock size={13} />
                                Last login: {lastLogin}
                            </p>
                        </div>
                        <Link to="/analyze">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                            >
                                + New Analysis
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {statCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl p-5 flex items-center gap-4"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Risk Trend Chart */}
                {trendData.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl p-6 mb-6"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Risk Score Trend</h3>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D7377" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E5E7EB' }} />
                                    <Area type="monotone" dataKey="riskScore" stroke="#0D7377" strokeWidth={2} fill="url(#riskGradient)" />
                                    <Line type="monotone" dataKey="confidence" stroke="#E8645A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Search & Filter + Reports */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-6"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <FileText size={16} style={{ color: 'var(--primary)' }} />
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Reports</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by drug or sample ID..."
                                    className="pl-9 pr-3 py-2 rounded-lg text-xs outline-none w-56"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                                <select
                                    onChange={(e) => setRiskFilter(e.target.value)}
                                    className="pl-8 pr-3 py-2 rounded-lg text-xs outline-none appearance-none"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                >
                                    <option value="all">All Risks</option>
                                    <option value="toxic">Toxic</option>
                                    <option value="adjust">Adjust</option>
                                    <option value="safe">Safe</option>
                                    <option value="ineffective">Ineffective</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Report Cards */}
                    {loading ? (
                        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Loading reports...
                        </div>
                    ) : filteredAnalyses.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                <Pill size={24} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {analyses.length === 0 ? 'No analyses yet' : 'No results match your filter'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {analyses.length === 0 ? 'Run your first analysis to see results here.' : 'Try adjusting your search or filter.'}
                            </p>
                            {analyses.length === 0 && (
                                <Link to="/analyze">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold text-white"
                                        style={{ background: '#0D7377' }}
                                    >
                                        Start First Analysis
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAnalyses.map((analysis) => {
                                const highestRisk = analysis.results.reduce((prev, curr) => {
                                    const order = { toxic: 4, adjust: 3, ineffective: 2, safe: 1, unknown: 0 };
                                    return (order[curr.riskLevel] || 0) > (order[prev.riskLevel] || 0) ? curr : prev;
                                }, analysis.results[0]);

                                return (
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="rounded-xl p-4 transition-all duration-200"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} style={{ color: '#0D7377' }} />
                                                <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {analysis.sampleId}
                                                </span>
                                            </div>
                                            {highestRisk && getRiskBadge(highestRisk.riskLevel)}
                                        </div>

                                        {/* Date */}
                                        <p className="text-[10px] mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                                            <Clock size={10} />
                                            {new Date(analysis.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        {/* Drugs */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {analysis.drugsAnalyzed.slice(0, 4).map(d => (
                                                <span key={d} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                    {d}
                                                </span>
                                            ))}
                                            {analysis.drugsAnalyzed.length > 4 && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                                    +{analysis.drugsAnalyzed.length - 4}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                            <Link to={`/report/${analysis.id}`} className="flex-1">
                                                <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
                                                    style={{ color: 'var(--primary)', background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                                                    <Eye size={11} /> View
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url; a.download = `${analysis.sampleId}.json`; a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors hover:opacity-80"
                                                style={{ color: 'var(--text-secondary)', background: 'var(--bg-muted)' }}
                                            >
                                                <Download size={11} /> JSON
                                            </button>
                                            <button
                                                onClick={() => handleDelete(analysis.id)}
                                                className="flex items-center justify-center py-1.5 px-2 rounded-lg text-[10px] transition-colors hover:bg-red-50"
                                                style={{ color: '#DC2626' }}
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default UserDashboard;
