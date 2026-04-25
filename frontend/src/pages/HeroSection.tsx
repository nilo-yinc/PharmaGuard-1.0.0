import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronDown, Dna, Shield, Zap, Brain } from 'lucide-react';
import { BackgroundGrid, GeneHelixArt, MedicalCrossPattern } from '../components/HealthcareVisuals';
import { CardSpotlight } from '../components/ui/card-spotlight';
import { BackgroundLines } from '../components/ui/background-lines';

interface HeroSectionProps {
    onAnalyze: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAnalyze }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    // Typing animation for "Precision Medicine"
    const fullText = 'Precision Medicine';
    const [typed, setTyped] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const startDelay = setTimeout(() => {
            let i = 0;
            const timer = setInterval(() => {
                i++;
                setTyped(fullText.slice(0, i));
                if (i >= fullText.length) clearInterval(timer);
            }, 150);
            return () => clearInterval(timer);
        }, 1000);
        return () => clearTimeout(startDelay);
    }, []);

    useEffect(() => {
        const blink = setInterval(() => setShowCursor(prev => !prev), 530);
        return () => clearInterval(blink);
    }, []);

    const stats = [
        { label: 'Genes Analyzed', value: '450+', icon: <Dna size={18} /> },
        { label: 'Drug Interactions', value: '12,000+', icon: <Zap size={18} /> },
        { label: 'CPIC Guidelines', value: 'v24.2', icon: <Shield size={18} /> },
        { label: 'AI Accuracy', value: '97.3%', icon: <Brain size={18} /> },
    ];

    return (
        <BackgroundLines className="relative" svgOptions={{ duration: 8 }}>
            <section
                id="hero"
                ref={containerRef}
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Background visuals (subtle, healthcare-themed) */}
                <BackgroundGrid className="absolute inset-0" />
                <MedicalCrossPattern className="absolute inset-0" />

                {/* Animated Background Blobs */}
                <motion.div
                    className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, var(--primary-light), transparent 70%)',
                        y: y1,
                        rotate,
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-72 h-72 rounded-full opacity-10 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, var(--accent-light), transparent 70%)',
                        y: y2,
                    }}
                />

                {/* Gene helix art (right side) */}
                <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none animate-float">
                    <GeneHelixArt className="w-[360px] h-[700px]" />
                </div>

                {/* Main content */}
                <motion.div
                    style={{ scale, opacity }}
                    className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6"
                >
                    {/* Status badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 cursor-default"
                        style={{
                            background: 'var(--success-light)',
                            border: '1px solid #D1FAE5',
                            color: 'var(--success)',
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--success)' }}
                        />
                        Genomic Analysis Engine Active
                    </motion.div>

                    {/* Main title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4"
                    >
                        <motion.span
                            style={{ color: 'var(--text-primary)', display: 'inline-block' }}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Personalized
                        </motion.span>
                        <br />
                        <span style={{ color: 'var(--primary)', display: 'inline-block' }}>
                            {typed}
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '3px',
                                    height: '0.85em',
                                    background: 'var(--primary)',
                                    marginLeft: '2px',
                                    verticalAlign: 'baseline',
                                    opacity: showCursor ? 1 : 0,
                                    transition: 'opacity 0.1s',
                                }}
                            />
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="mb-6"
                    >
                        <p className="text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Upload your genomic VCF file and receive real-time pharmacogenomic drug safety insights
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {['VCF File', '→', 'Genotype Call', '→', 'Risk Prediction', '→', 'Clinical Insight'].map((item, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className={`text-sm font-medium px-2 py-0.5 rounded ${item === '→' ? '' : ''}`}
                                    style={{
                                        color: item === '→' ? 'var(--text-muted)' : 'var(--primary)',
                                        background: item === '→' ? 'transparent' : 'var(--primary-light)',
                                        border: item === '→' ? 'none' : '1px solid var(--primary)',
                                    }}
                                >
                                    {item}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAnalyze}
                            className="btn-primary text-base shadow-[0_10px_30px_rgba(232,100,90,0.22)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Dna size={20} />
                                </motion.div>
                                Analyze Genetic Profile
                            </span>
                        </motion.button>

                        <motion.a
                            href="#about"
                            whileHover={{ scale: 1.03 }}
                            className="btn-secondary px-6 py-4 text-sm"
                        >
                            Learn About CPIC Guidelines →
                        </motion.a>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {stats.map((stat, i) => (
                            <CardSpotlight
                                key={stat.label}
                                className="rounded-xl"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-sm)',
                                    backdropFilter: 'var(--backdrop)',
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="p-4 text-center rounded-xl transition-all duration-200 h-full"
                                >
                                    <motion.div
                                        className="flex justify-center mb-2"
                                        style={{ color: 'var(--primary)' }}
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                    <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                                </motion.div>
                            </CardSpotlight>
                        ))}
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </section>
        </BackgroundLines>
    );
};

export default HeroSection;
