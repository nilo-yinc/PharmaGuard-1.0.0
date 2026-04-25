import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, BarChart3, Brain, Clock, Shield,
    Stethoscope, Users, Eye, Lock
} from 'lucide-react';
import DrugCard from './DrugCard';
import RiskVisualizations from './RiskVisualizations';
import JSONPanel from './JSONPanel';
import {
    GenomicTimeline, GeneExplorer,
    ComplianceBadges, AIExplainabilityPanel,
    DataPrivacyBanner, MultiPatientSimulation
} from './InnovativeFeatures';
import AIReasoningPanel from './AIReasoningPanel';
import ClinicalDecisionPanel from './ClinicalDecisionPanel';
import ExportCenter from './ExportCenter';
import { MOCK_ANALYSIS_RESULT, DrugRisk, AnalysisResult } from '../utils/mockData';

type TabId = 'overview' | 'visualizations' | 'reasoning' | 'decision' | 'timeline' | 'simulation' | 'compliance';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Drug Cards', icon: <LayoutGrid size={14} /> },
    { id: 'visualizations', label: 'Risk Charts', icon: <BarChart3 size={14} /> },
    { id: 'reasoning', label: 'AI Reasoning', icon: <Brain size={14} /> },
    { id: 'decision', label: 'Clinical Guide', icon: <Stethoscope size={14} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { id: 'simulation', label: 'Multi-Patient', icon: <Users size={14} /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield size={14} /> },
];

interface DashboardProps {
    selectedDrugs: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ selectedDrugs }) => {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [jsonPanelOpen, setJsonPanelOpen] = useState(false);
    const [jsonData, setJsonData] = useState<DrugRisk | AnalysisResult | null>(null);
    const [jsonTitle, setJsonTitle] = useState('');
    const [privacyMode, setPrivacyMode] = useState(false);
    const [simulationMode, setSimulationMode] = useState(false);

    const result = MOCK_ANALYSIS_RESULT;
    const filteredDrugs = selectedDrugs.length > 0
        ? result.drugs.filter(d => selectedDrugs.map(s => s.toUpperCase()).includes(d.drug.toUpperCase()))
        : result.drugs;

    const handleViewJSON = (drug: DrugRisk) => {
        const data = privacyMode
            ? { ...drug, variants: drug.variants.map(v => ({ ...v, rsId: '██████████' })) }
            : drug;
        setJsonData(data);
        setJsonTitle(`${drug.drug} Report`);
        setJsonPanelOpen(true);
    };

    const tabVariants = {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    };

    return (
        <section id="dashboard" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Privacy mode banner */}
            <DataPrivacyBanner enabled={privacyMode} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-start justify-between gap-4 mb-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest"
                            style={{ color: '#0D7377' }}
                        >
                            Analysis Complete
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
                    </div>
                    <h2 className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>Pharmacogenomic Report</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sample: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{result.sampleId}</span>
                        {' · '}{filteredDrugs.length} drug{filteredDrugs.length !== 1 ? 's' : ''} analysed
                    </p>
                </div>

                {/* Control row */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Privacy toggle */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrivacyMode(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                        style={{
                            background: privacyMode ? 'var(--warning-light)' : 'var(--bg-muted)',
                            border: `1px solid ${privacyMode ? 'var(--warning)' : 'var(--border)'}`,
                            color: privacyMode ? 'var(--warning)' : 'var(--text-muted)',
                        }}
                    >
                        {privacyMode ? <Lock size={12} /> : <Eye size={12} />}
                        {privacyMode ? 'Privacy ON' : 'Privacy'}
                    </motion.button>

                    {/* Export center */}
                    <ExportCenter />
                </div>
            </motion.div>

            {/* Tab bar */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {TABS.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === 'simulation') setSimulationMode(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-150"
                        style={{
                            background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--bg-muted)',
                            border: `1px solid ${activeTab === tab.id ? 'var(--border-hover)' : 'var(--border)'}`,
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        {privacyMode && (
                            <div className="mb-4 px-3 py-2 rounded-xl text-[10px] flex items-center gap-2"
                                style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', color: 'var(--warning)' }}>
                                <Lock size={10} />
                                Privacy mode: Variant rsIDs are masked in JSON view
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredDrugs.map((drug, i) => (
                                <DrugCard key={drug.drug} drug={drug} index={i} onViewJSON={handleViewJSON} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'visualizations' && (
                    <motion.div key="visualizations"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        <RiskVisualizations result={result} />
                    </motion.div>
                )}

                {activeTab === 'reasoning' && (
                    <motion.div key="reasoning"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                    >
                        <AIReasoningPanel />
                        <AIExplainabilityPanel />
                        <GeneExplorer />
                    </motion.div>
                )}

                {activeTab === 'decision' && (
                    <motion.div key="decision"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        <ClinicalDecisionPanel />
                    </motion.div>
                )}

                {activeTab === 'timeline' && (
                    <motion.div key="timeline"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        <GenomicTimeline />
                    </motion.div>
                )}

                {activeTab === 'simulation' && (
                    <motion.div key="simulation"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        <MultiPatientSimulation />
                    </motion.div>
                )}

                {activeTab === 'compliance' && (
                    <motion.div key="compliance"
                        variants={tabVariants} initial="initial" animate="animate" exit="exit"
                        transition={{ duration: 0.25 }}
                    >
                        <ComplianceBadges />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* JSON Panel */}
            <JSONPanel
                isOpen={jsonPanelOpen}
                onClose={() => setJsonPanelOpen(false)}
                data={jsonData}
                title={jsonTitle}
            />
        </section>
    );
};

export default Dashboard;
