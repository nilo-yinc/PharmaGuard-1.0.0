import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Upload, Pill, Play, CheckCircle, ArrowRight,
    ArrowLeft, Dna
} from 'lucide-react';
import VCFUpload from './VCFUpload';
import DrugInput from './DrugInput';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi } from '../services/analysisApi';
import { SupportedDrug } from '../utils/mockData';

type Step = 1 | 2 | 3;

const AnalyzePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedRecordId, setUploadedRecordId] = useState<string | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<SupportedDrug[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    useEffect(() => {
        const step = searchParams.get('step');
        if (step === '2') setCurrentStep(2);
        if (step === '1') setCurrentStep(1);
    }, [searchParams]);

    const steps = [
        { num: 1, label: 'Upload VCF', icon: <Upload size={16} />, desc: 'Upload your genomic variant file' },
        { num: 2, label: 'Select Drugs', icon: <Pill size={16} />, desc: 'Choose medications to analyze' },
        { num: 3, label: 'Run Analysis', icon: <Play size={16} />, desc: 'Generate pharmacogenomic report' },
    ];

    const handleFileAccepted = useCallback((file: File) => {
        setUploadedFile(file);
        setTimeout(() => setCurrentStep(2), 500);
    }, []);

    const handleDrugsSelected = useCallback((drugs: SupportedDrug[]) => {
        setSelectedDrugs(drugs);
    }, []);

    const handleAnalyze = useCallback(async (drugs: SupportedDrug[]) => {
        if (!uploadedRecordId) return;

        setSelectedDrugs(drugs);
        setCurrentStep(3);
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        // Simulate analysis progress
        const phases = [
            { progress: 15, delay: 400 },
            { progress: 35, delay: 600 },
            { progress: 55, delay: 500 },
            { progress: 75, delay: 700 },
            { progress: 90, delay: 400 },
            { progress: 100, delay: 300 },
        ];

        for (const phase of phases) {
            await new Promise(r => setTimeout(r, phase.delay));
            setAnalysisProgress(phase.progress);
        }

        const { success, error } = await analysisApi.analyze(uploadedRecordId, drugs);
        if (!success) {
            setIsAnalyzing(false);
            setCurrentStep(2);
            alert(`Analysis failed: ${error || 'Unknown error'}`);
            return;
        }

        await new Promise(r => setTimeout(r, 300));
        setIsAnalyzing(false);
        navigate(`/report/${uploadedRecordId}`, { replace: true });
    }, [uploadedRecordId, navigate]);

    return (
        <div className="min-h-[calc(100vh-64px)] pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-0 mb-8">
                    {steps.map((step, i) => (
                        <React.Fragment key={step.num}>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                onClick={() => {
                                    if (step.num < currentStep) setCurrentStep(step.num as Step);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                                style={{
                                    background: currentStep === step.num ? 'var(--primary-light)' : currentStep > step.num ? 'var(--success-light)' : 'var(--bg-muted)',
                                    border: `1px solid ${currentStep === step.num ? 'var(--primary)' : currentStep > step.num ? 'var(--success-light)' : 'var(--border)'}`,
                                }}
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: currentStep > step.num ? 'var(--success)' : currentStep === step.num ? 'var(--primary)' : 'var(--border)',
                                        color: currentStep >= step.num ? 'white' : 'var(--text-secondary)',
                                    }}
                                >
                                    {currentStep > step.num ? <CheckCircle size={14} /> : step.icon}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold" style={{ color: currentStep >= step.num ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {step.label}
                                    </p>
                                    <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                                </div>
                            </motion.div>

                            {i < steps.length - 1 && (
                                <div className="w-8 h-0.5 mx-1" style={{ background: currentStep > step.num ? 'var(--success)' : 'var(--border)' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <VCFUpload
                                onFileAccepted={handleFileAccepted}
                                onRecordCreated={(recordId) => setUploadedRecordId(recordId)}
                            />
                            {uploadedFile && (
                                <div className="flex justify-center mt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setCurrentStep(2)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                                        style={{ background: 'var(--primary)' }}
                                    >
                                        Continue to Drug Selection <ArrowRight size={16} />
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DrugInput
                                onDrugsSelected={handleDrugsSelected}
                                onAnalyze={handleAnalyze}
                                hasFile={!!uploadedFile}
                            />
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <ArrowLeft size={14} /> Back to Upload
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center justify-center py-20"
                        >
                            <div className="text-center max-w-md">
                                {/* DNA spinner */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'var(--primary-light)', border: '2px solid var(--primary-light)' }}
                                >
                                    <Dna size={32} style={{ color: 'var(--primary)' }} />
                                </motion.div>

                                <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {isAnalyzing ? 'Analyzing Genomic Data...' : 'Analysis Complete!'}
                                </h2>

                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    {isAnalyzing
                                        ? 'Processing VCF variants and matching CPIC guidelines...'
                                        : 'Redirecting to your report...'
                                    }
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-muted)' }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysisProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>

                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                    {analysisProgress}% complete
                                </p>

                                {/* Analysis details */}
                                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>VCF File</p>
                                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{uploadedFile?.name || 'N/A'}</p>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Drugs</p>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDrugs.length || 'All'} selected</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnalyzePage;
