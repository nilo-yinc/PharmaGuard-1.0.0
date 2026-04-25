import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiForgotPassword, apiVerifyResetOtp, apiResetPassword } from '../services/authApi';

type ForgotStep = 'email' | 'otp' | 'password';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const params = new URLSearchParams(window.location.search);
    const [error, setError] = useState(() => {
        if (params.get('error') === 'google_auth_failed') return 'Google sign-in failed. Please try again.';
        return '';
    });
    const [infoMessage, setInfoMessage] = useState(() => (
        params.get('registered') === '1'
            ? 'Registration successful. You can sign in now.'
            : ''
    ));
    const [isLoading, setIsLoading] = useState(false);

    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleGoogleLogin = () => {
        let apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
        if (!apiBase && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
            apiBase = 'https://pharmaguard-node.vercel.app';
        }
        window.location.href = apiBase
            ? `${apiBase}/api/v1/users/google/login`
            : '/api/v1/users/google/login';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            const loginError = result.error || 'Login failed.';
            const accountNotFound = loginError.toLowerCase().includes('account not found');
            if (accountNotFound) {
                setError('No account found with this email. Redirecting to sign up...');
                const targetEmail = encodeURIComponent(email.trim());
                setTimeout(() => {
                    navigate(`/register?email=${targetEmail}&from=login`, { replace: true });
                }, 1200);
                return;
            }
            setError(loginError);
        }
    };

    const handleSendOtp = async () => {
        const targetEmail = (forgotEmail || email).trim();
        if (!targetEmail) {
            setError('Enter your email to receive OTP.');
            return;
        }

        setForgotLoading(true);
        setError('');
        const result = await apiForgotPassword(targetEmail);
        setForgotLoading(false);

        if (result.ok) {
            setForgotEmail(targetEmail);
            setForgotStep('otp');
            if (result.data?.devOtp) {
                setInfoMessage(`OTP sent. Dev OTP: ${result.data.devOtp}`);
            } else {
                setInfoMessage('OTP sent to your email. Please verify OTP.');
            }
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (!forgotEmail || !otp) {
            setError('Enter email and OTP.');
            return;
        }

        setForgotLoading(true);
        setError('');
        const result = await apiVerifyResetOtp(forgotEmail.trim(), otp.trim());
        setForgotLoading(false);

        if (result.ok && result.data?.resetToken) {
            setResetToken(result.data.resetToken);
            setForgotStep('password');
            setInfoMessage('OTP verified. Set your new password.');
        } else {
            setError(result.error || 'Invalid OTP');
        }
    };

    const handleSetNewPassword = async () => {
        if (!resetToken) {
            setError('OTP verification is required first.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.');
            return;
        }

        setForgotLoading(true);
        setError('');
        const resetResult = await apiResetPassword(resetToken, newPassword);
        if (!resetResult.ok) {
            setForgotLoading(false);
            setError(resetResult.error || 'Failed to update password');
            return;
        }

        const loginResult = await login(forgotEmail.trim(), newPassword);
        setForgotLoading(false);
        if (loginResult.success) {
            navigate('/dashboard', { replace: true });
            return;
        }

        setShowForgot(false);
        setForgotStep('email');
        setInfoMessage('Password updated successfully. Please login.');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                    >
                        <Shield size={24} style={{ color: 'var(--primary)' }} />
                    </motion.div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your PharmaGuard account</p>
                </div>

                <div className="rounded-2xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-xl text-sm"
                                style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {infoMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-xl text-sm"
                                style={{ background: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)' }}
                            >
                                {infoMessage}
                            </motion.div>
                        )}

                        {showForgot && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-xl text-sm space-y-2"
                                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                {forgotStep === 'email' && (
                                    <>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Enter your email to receive OTP.
                                        </p>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={forgotLoading}
                                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                            style={{ background: 'var(--primary)', opacity: forgotLoading ? 0.7 : 1 }}
                                        >
                                            {forgotLoading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </>
                                )}

                                {forgotStep === 'otp' && (
                                    <>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Enter OTP sent to {forgotEmail}
                                        </p>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="6-digit OTP"
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={forgotLoading}
                                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                            style={{ background: 'var(--primary)', opacity: forgotLoading ? 0.7 : 1 }}
                                        >
                                            {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                    </>
                                )}

                                {forgotStep === 'password' && (
                                    <>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            OTP verified. Set your new password.
                                        </p>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password"
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSetNewPassword}
                                            disabled={forgotLoading}
                                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                            style={{ background: 'var(--primary)', opacity: forgotLoading ? 0.7 : 1 }}
                                        >
                                            {forgotLoading ? 'Updating...' : 'Save Password & Login'}
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded"
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgot(true);
                                    setForgotStep('email');
                                    setForgotEmail(email);
                                }}
                                className="text-xs font-medium transition-colors"
                                style={{ color: 'var(--primary)' }}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200"
                            style={{
                                background: isLoading ? 'var(--text-muted)' : 'var(--primary)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-4">
                        <div className="relative flex items-center my-4">
                            <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }} />
                            <span className="mx-3 text-xs" style={{ color: 'var(--text-secondary)' }}>or</span>
                            <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }} />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200"
                            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </motion.button>
                    </div>

                    <div className="text-center mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
