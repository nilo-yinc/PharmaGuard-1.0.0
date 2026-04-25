import React, { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import { FloatingBadges } from '../pages/InnovativeFeatures';
import { useTheme } from '../contexts/ThemeContext';
import dnaDarkBg from '../assets/image copy.png';  // Black bg + blue glowing DNA — dark mode
import dnaLightBg from '../assets/image.png';      // Vivid blue DNA — light mode

const MainLayout: React.FC = () => {
    const location = useLocation();
    const { isDark } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const moveX = useTransform(springX, [-0.5, 0.5], ["-2%", "2%"]);
    const moveY = useTransform(springY, [-0.5, 0.5], ["-2%", "2%"]);
    const rotateX = useTransform(springY, [-0.5, 0.5], [2, -2]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-2, 2]);

    // Scroll parallax
    const { scrollYProgress } = useScroll();
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.4, 0.6]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            mouseX.set(clientX / innerWidth - 0.5);
            mouseY.set(clientY / innerHeight - 0.5);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col relative overflow-hidden">

            {/* ── Layer 1: Solid base color ─────────────────────────────────── */}
            <div className="fixed inset-0 z-[-3]" style={{ background: 'var(--bg-main)' }} />

            {/* ── Layer 2: DNA image with 3D Parallax ────────────────────────── */}
            <motion.div
                className="dna-bg-img fixed inset-0 z-[-2] pointer-events-none"
                style={{
                    backgroundImage: `url(${isDark ? dnaDarkBg : dnaLightBg})`,
                    backgroundSize: '110% 110%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    opacity: isDark ? 0.64 : 0.60,
                    filter: isDark ? 'blur(1px)' : 'none',
                    x: moveX,
                    y: moveY,
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: bgScale,
                    transition: 'opacity 0.6s ease, filter 0.6s ease',
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                }}
            />

            {/* ── Layer 3: Readability overlay (dark tint / light wash) ─────── */}
            <div
                className="fixed inset-0 z-[-1] pointer-events-none"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,4,10,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                        : 'linear-gradient(135deg, rgba(245,250,255,0.4) 0%, rgba(230,244,255,0.3) 50%, rgba(245,250,255,0.4) 100%)',
                    transition: 'background 0.6s ease',
                }}
            />

            {/* ── Layer 4: Radial vignette for depth ───────────────────────── */}
            <motion.div
                className="fixed inset-0 z-[-1] pointer-events-none"
                style={{
                    background: isDark
                        ? 'radial-gradient(ellipse at 50% 0%, rgba(13,115,119,0.1) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse at 50% 0%, rgba(13,115,119,0.08) 0%, transparent 70%)',
                    opacity: bgOpacity
                }}
            />

            <Navbar />
            <FloatingBadges />

            <main className="flex-1 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
