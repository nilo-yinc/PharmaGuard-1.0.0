import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const dnaRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.inOut',
                    onComplete,
                });
            },
        });

        // Animate DNA strands
        if (dnaRef.current) {
            const circles = dnaRef.current.querySelectorAll('circle');
            const lines = dnaRef.current.querySelectorAll('line');

            gsap.set(circles, { opacity: 0, scale: 0 });
            gsap.set(lines, { opacity: 0 });

            tl.to(circles, {
                opacity: 1,
                scale: 1,
                duration: 0.05,
                stagger: 0.05,
                ease: 'back.out(2)',
            })
                .to(
                    lines,
                    {
                        opacity: 0.6,
                        duration: 0.3,
                        stagger: 0.04,
                        ease: 'power2.out',
                    },
                    '-=0.5'
                )
                .to({}, { duration: 1.5 });
        }

        return () => {
            tl.kill();
        };
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'var(--bg-main)' }}
        >
            {/* DNA Helix Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
            >
                <svg
                    ref={dnaRef}
                    width="100"
                    height="160"
                    viewBox="0 0 100 160"
                    className="mx-auto"
                >
                    {Array.from({ length: 20 }, (_, i) => {
                        const y = (i / 19) * 140 + 10;
                        const x1 = 20 + Math.sin((i / 19) * Math.PI * 4) * 25;
                        const x2 = 80 - Math.sin((i / 19) * Math.PI * 4) * 25;
                        return (
                            <g key={i}>
                                <line
                                    x1={x1} y1={y} x2={x2} y2={y}
                                    stroke="rgba(13,115,119,0.2)"
                                    strokeWidth="1.5"
                                />
                                <circle cx={x1} cy={y} r="3" fill="#0D7377" />
                                <circle cx={x2} cy={y} r="3" fill="#E8645A" />
                            </g>
                        );
                    })}

                    <path
                        d={`M ${20 + Math.sin(0) * 25} 10 ${Array.from({ length: 20 }, (_, i) => {
                            const y = (i / 19) * 140 + 10;
                            const x = 20 + Math.sin((i / 19) * Math.PI * 4) * 25;
                            return `L ${x} ${y}`;
                        }).join(' ')}`}
                        fill="none" stroke="rgba(13,115,119,0.25)" strokeWidth="1"
                    />
                    <path
                        d={`M ${80 - Math.sin(0) * 25} 10 ${Array.from({ length: 20 }, (_, i) => {
                            const y = (i / 19) * 140 + 10;
                            const x = 80 - Math.sin((i / 19) * Math.PI * 4) * 25;
                            return `L ${x} ${y}`;
                        }).join(' ')}`}
                        fill="none" stroke="rgba(232,100,90,0.25)" strokeWidth="1"
                    />
                </svg>
            </motion.div>

            {/* Logo and text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center"
            >
                <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--primary)' }}>
                    PharmaGuard
                </h1>
                <p className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                    Pharmacogenomic Risk Prediction
                </p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 w-64"
            >
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, ease: 'easeInOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'var(--primary)' }}
                    />
                </div>
                <p className="text-xs text-center mt-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Initializing Analysis Engine...
                </p>
            </motion.div>

            {/* Compliance badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex gap-3 mt-6"
            >
                {['CPIC v4.2', 'FDA Aligned', 'VCF v4.2'].map((badge) => (
                    <span
                        key={badge}
                        className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{
                            background: 'var(--bg-muted)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        {badge}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
