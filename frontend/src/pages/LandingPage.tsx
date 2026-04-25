import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import HeroSection from './HeroSection';
import VCFUpload from './VCFUpload';
import DrugInput from './DrugInput';
import { useLocation, useNavigate } from 'react-router-dom';
import { SupportedDrug } from '../utils/mockData';
import { Dna, FlaskConical, FileText } from 'lucide-react';
import { CardSpotlight } from '../components/ui/card-spotlight';

import { analysisApi } from '../services/analysisApi';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedRecordId, setUploadedRecordId] = useState<string | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<SupportedDrug[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const handleAnalyze = async (drugs: SupportedDrug[]) => {
        if (!uploadedRecordId) {
            alert('Please upload a VCF file first');
            return;
        }
        setSelectedDrugs(drugs);
        setIsAnalyzing(true);

        try {
            const { success, data, error } = await analysisApi.analyze(uploadedRecordId, drugs);
            if (success) {
                // The backend might return the record again or just success.
                // We navigate to /analyze/:recordId
                // Wait, route is /analyze usually.
                // But ReportPage looks for 'id' param? 
                // "const { id } = useParams<{ id: string }>();"
                // So we should navigate to `/report/${uploadedRecordId}`.
                navigate(`/report/${uploadedRecordId}`);
            } else {
                alert(`Analysis failed: ${error}`);
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        const sectionParam = new URLSearchParams(location.search).get('section');
        const hashSection = location.hash.replace('#', '');
        const targetId = sectionParam || hashSection;

        if (!targetId) return;

        const scrollToTarget = (attempt = 0) => {
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            if (attempt < 6) {
                window.setTimeout(() => scrollToTarget(attempt + 1), 100);
            }
        };

        scrollToTarget();
    }, [location.pathname, location.search, location.hash]);

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-50 origin-left"
                style={{ scaleX, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
            />

            <HeroSection
                onAnalyze={() => {
                    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />

            {/* VCF Upload section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative"
                style={{ background: 'var(--bg-muted)', backdropFilter: 'var(--backdrop)', WebkitBackdropFilter: 'var(--backdrop)' }}
            >
                <VCFUpload
                    onFileAccepted={(file) => setUploadedFile(file)}
                    onRecordCreated={(id) => setUploadedRecordId(id)}
                />
            </motion.div>

            {/* Drug Input section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative"
                style={{ background: 'var(--bg-surface)', backdropFilter: 'var(--backdrop)', WebkitBackdropFilter: 'var(--backdrop)' }}
            >
                <DrugInput
                    onDrugsSelected={setSelectedDrugs}
                    onAnalyze={handleAnalyze}
                    hasFile={!!uploadedFile}
                />
            </motion.div>

            {/* About / How it Works */}
            <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>How PharmaGuard Works</h2>
                    <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
                    <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto text-lg">
                        Leveraging CPIC guidelines and AI to deliver personalized drug safety insights based on your unique genetic profile.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: 'Upload VCF', desc: 'Upload your Variant Call Format file from whole-genome or targeted pharmacogene sequencing.', icon: <Dna size={28} />, color: '#0D7377', bg: 'rgba(13,115,119,0.08)' },
                        { step: '02', title: 'Genotype Analysis', desc: 'Our AI engine calls diplotypes for 450+ pharmacogenes using CPIC star allele nomenclature.', icon: <FlaskConical size={28} />, color: '#E8645A', bg: 'rgba(232,100,90,0.08)' },
                        { step: '03', title: 'Clinical Report', desc: 'Receive CPIC-aligned drug risk predictions with clinical recommendations for each medication.', icon: <FileText size={28} />, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
                    ].map((item, i) => (
                        <CardSpotlight
                            key={item.step}
                            className="rounded-3xl"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                                backdropFilter: 'var(--backdrop)',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="p-8 rounded-3xl text-center h-full flex flex-col items-center group"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: item.bg, border: `1px solid ${item.color}25`, color: item.color }}
                                >
                                    {item.icon}
                                </div>
                                <div className="text-xs font-mono mb-2 font-bold" style={{ color: item.color }}>STEP {item.step}</div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </motion.div>
                        </CardSpotlight>
                    ))}
                </div>

                {/* Error handling */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-20"
                >
                    <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Resilient Analysis Engine</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { type: 'Invalid VCF Format', desc: 'File doesn\'t conform to VCF 4.1/4.2 standard.', solution: 'System validates ##fileformat header and CHROM structure.', bgVar: 'var(--danger-light)', borderVar: 'var(--danger)', colorVar: 'var(--danger)' },
                            { type: 'Missing Gene Annotations', desc: 'VCF lacks pharmacogene annotations.', solution: 'Provides partial analysis with confidence degradation.', bgVar: 'var(--warning-light)', borderVar: 'var(--warning)', colorVar: 'var(--warning)' },
                            { type: 'Unsupported Drug', desc: 'Drug not in CPIC database.', solution: 'Returns "Unknown" label with PharmGKB link.', bgVar: 'var(--info-light)', borderVar: 'var(--info)', colorVar: 'var(--info)' },
                            { type: 'Network/API Error', desc: 'Analysis service unavailable.', solution: 'Fallback to cached CPIC guidelines with offline indicator.', bgVar: 'var(--bg-muted)', borderVar: 'var(--border)', colorVar: 'var(--text-secondary)' },
                        ].map((err, i) => (
                            <CardSpotlight
                                key={err.type}
                                className="rounded-2xl"
                                style={{ background: err.bgVar, border: `1px solid ${err.borderVar}` }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl text-xs relative overflow-hidden group"
                                >
                                    <p className="font-bold text-sm mb-2" style={{ color: err.colorVar }}>{err.type}</p>
                                    <p className="mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{err.desc}</p>
                                    <p className="leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>{err.solution}</p>
                                    <motion.div
                                        className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-150 transition-transform duration-500"
                                        style={{ color: err.colorVar }}
                                    >
                                        <div className="text-4xl">⚠</div>
                                    </motion.div>
                                </motion.div>
                            </CardSpotlight>
                        ))}
                    </div>
                </motion.div>
            </section>

            <section id="docs" className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Documentation</h2>
                    <div className="w-16 h-1 bg-accent mx-auto mb-6 rounded-full" />
                    <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
                        Implementation references, input formats, and interpretation guides for the PharmaGuard workflow.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'VCF Requirements',
                            desc: 'Accepted schema versions, required headers, supported pharmacogene fields, and common validation failures.',
                            tag: 'Input Spec',
                            color: 'var(--primary)',
                        },
                        {
                            title: 'Drug Evidence Mapping',
                            desc: 'How CPIC/PharmGKB evidence is mapped to risk categories, confidence scoring, and recommendation generation.',
                            tag: 'Clinical Logic',
                            color: 'var(--accent)',
                        },
                        {
                            title: 'Report Interpretation',
                            desc: 'How to read phenotype summaries, gene-drug interactions, and confidence indicators in generated reports.',
                            tag: 'User Guide',
                            color: 'var(--success)',
                        },
                    ].map((doc, i) => (
                        <CardSpotlight
                            key={doc.title}
                            className="rounded-3xl"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                                backdropFilter: 'var(--backdrop)',
                            }}
                        >
                            <motion.article
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="p-8 rounded-3xl h-full flex flex-col group cursor-pointer"
                            >
                                <p className="text-[11px] font-black uppercase tracking-widest mb-4 inline-block px-3 py-1 rounded-full w-fit"
                                    style={{ color: doc.color, background: `${doc.color}15` }}>{doc.tag}</p>
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{doc.title}</h3>
                                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{doc.desc}</p>
                                <div className="mt-auto flex items-center gap-2 font-bold text-xs" style={{ color: doc.color }}>
                                    READ MORE <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </motion.article>
                        </CardSpotlight>
                    ))}
                </div>
            </section>
        </>
    );
};

export default LandingPage;
