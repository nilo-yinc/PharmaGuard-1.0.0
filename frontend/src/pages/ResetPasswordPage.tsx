import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { apiResetPassword } from '../services/authApi';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError('Reset token is missing.');
            return;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await apiResetPassword(token, password);
        setLoading(false);

        if (result.ok) {
            setSuccess('Password reset successful. Redirecting to login...');
            setTimeout(() => navigate('/login', { replace: true }), 1200);
        } else {
            setError(result.error || 'Failed to reset password.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="rounded-2xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Reset Password</h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Set a new password for your account.</p>

                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2" style={{ background: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'var(--primary)', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <div className="text-center mt-5">
                        <Link to="/login" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
