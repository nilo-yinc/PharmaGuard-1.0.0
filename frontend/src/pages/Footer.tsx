import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Shield, FileText, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = 2026;

    const footerSections = [
        {
            title: 'PharmaGuard',
            links: [
                { label: 'About', to: '/?section=about' },
                { label: 'How It Works', to: '/?section=about' },
                { label: 'Start Analysis', to: '/analyze?step=1' },
            ],
        },
        {
            title: 'Compliance',
            links: [
                { label: 'CPIC Guidelines', to: '#' },
                { label: 'PharmGKB Evidence', to: '#' },
                { label: 'FDA Biomarkers', to: '#' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', to: '#' },
                { label: 'Terms of Use', to: '#' },
                { label: 'Data Protection', to: '#' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'Documentation', to: '/?section=docs' },
                { label: 'API Reference', to: '/?section=docs' },
                { label: 'Contact Support', to: '/?section=docs' },
            ],
        },
    ];

    const badges = [
        { label: 'CPIC v24.2', color: '#059669' },
        { label: 'VCF v4.2', color: '#0D7377' },
        { label: 'AI Explainable', color: '#7C3AED' },
        { label: 'v2.4.0', color: '#6B7280' },
    ];

    return (
        <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
            {/* DNA animation strip */}
            <div className="h-1 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, #0D7377, #E8645A, #059669, #0D7377)',
                        backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                {section.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-xs transition-colors duration-200 hover:underline"
                                            style={{ color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border)' }} className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex items-center gap-2">
                            <Heart size={14} style={{ color: 'var(--accent)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                © {currentYear} PharmaGuard — Pharmacogenomics AI Platform
                            </p>
                        </div>

                        {/* Right — Badges */}
                        <div className="flex flex-wrap gap-2">
                            {badges.map((badge) => (
                                <span
                                    key={badge.label}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium"
                                    style={{
                                        background: `${badge.color}08`,
                                        border: `1px solid ${badge.color}20`,
                                        color: badge.color,
                                    }}
                                >
                                    {badge.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-[10px] mt-4" style={{ color: 'var(--text-muted)' }}>
                        For educational and research use only. Not for clinical diagnosis.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
