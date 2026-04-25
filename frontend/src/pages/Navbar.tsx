import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, X, LogIn, LogOut, User,
    Upload, Pill, LayoutDashboard, Info, FileText,
    ChevronDown, Settings, History, Shield, Dna
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navLinks = [
        { to: '/analyze?step=1', label: 'Upload VCF', icon: <Upload size={14} />, key: 'upload' },
        { to: '/analyze?step=2', label: 'Drug Input', icon: <Pill size={14} />, key: 'drugs' },
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} />, key: 'dashboard' },
        { to: '/?section=about', label: 'About', icon: <Info size={14} />, key: 'about' },
        { to: '/?section=docs', label: 'Docs', icon: <FileText size={14} />, key: 'docs' },
    ];

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const currentSection = new URLSearchParams(location.search).get('section') || location.hash.replace('#', '');
    const currentStep = new URLSearchParams(location.search).get('step');

    const isCustomActive = (linkKey: string, isPathActive: boolean) => {
        if (linkKey === 'upload') return location.pathname === '/analyze' && (currentStep === null || currentStep === '1');
        if (linkKey === 'drugs') return location.pathname === '/analyze' && currentStep === '2';
        if (linkKey === 'about') return location.pathname === '/' && currentSection === 'about';
        if (linkKey === 'docs') return location.pathname === '/' && currentSection === 'docs';
        return isPathActive;
    };

    const navLinkStyle = (isActive: boolean) => ({
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 500,
    });

    return (
        <nav
            className="sticky top-0 z-50 transition-all duration-300"
            style={{
                background: isDark
                    ? scrolled ? 'rgba(0, 4, 8, 0.92)' : 'rgba(0, 4, 8, 0.82)'
                    : scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(240, 248, 255, 0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                boxShadow: scrolled
                    ? isDark ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(13,115,119,0.1)'
                    : 'none',
                height: scrolled ? '60px' : '72px'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Left -- Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <motion.div
                            className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                            style={{
                                background: 'linear-gradient(135deg, #0D7377, #0A5C5F)',
                                boxShadow: '0 4px 12px rgba(13,115,119,0.3)',
                            }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Pulse ring */}
                            <motion.div
                                className="absolute inset-0 rounded-xl"
                                style={{ border: '2px solid rgba(13,115,119,0.6)' }}
                                animate={{ scale: [1, 1.35, 1.35], opacity: [0.6, 0, 0] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                            />
                            {/* DNA icon */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                style={{ color: '#fff' }}
                            >
                                <Dna size={20} />
                            </motion.div>
                        </motion.div>
                        <div className="transition-transform duration-300 group-hover:translate-x-1">
                            <p className="font-black text-sm leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>PharmaGuard</p>
                            <p className="text-[9px] leading-tight font-medium" style={{ color: 'var(--text-secondary)' }}>Pharmacogenomics AI</p>
                        </div>
                    </Link>

                    {/* Center — Nav Links (desktop) */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-95"
                                style={({ isActive }) => ({
                                    color: isCustomActive(link.key, isActive) ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isCustomActive(link.key, isActive) ? 600 : 500,
                                    background: isCustomActive(link.key, isActive) ? 'var(--bg-muted)' : 'transparent'
                                })}
                            >
                                {link.icon}
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right — Actions */}
                    <div className="flex items-center gap-2">
                        {/* CPIC Badge */}
                        <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                            style={{ background: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                            <Shield size={10} />
                            CPIC Aligned
                        </div>



                        {/* Auth section */}
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                                >
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: '#0D7377' }}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {user?.name?.split(' ')[0] || 'User'}
                                    </span>
                                    <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} />
                                </motion.button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden"
                                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                                        >
                                            {/* User info */}
                                            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                {[
                                                    { label: 'Profile', icon: <User size={13} />, to: '/profile' },
                                                    { label: 'Analysis History', icon: <History size={13} />, to: '/dashboard' },
                                                    { label: 'Settings', icon: <Settings size={13} />, to: '/profile' },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.label}
                                                        to={item.to}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors hover:opacity-80"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        {item.icon}
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Logout */}
                                            <div style={{ borderTop: '1px solid #F3F4F6' }}>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors hover:bg-red-50"
                                                    style={{ color: '#DC2626' }}
                                                >
                                                    <LogOut size={13} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                    style={{ background: '#0D7377' }}
                                >
                                    <LogIn size={14} />
                                    Sign In
                                </motion.button>
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ color: '#6B7280' }}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden overflow-hidden"
                        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.label}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors"
                                    style={({ isActive }) => navLinkStyle(isCustomActive(link.key, isActive))}
                                >
                                    {link.icon}
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Navbar;
