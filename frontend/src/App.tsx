import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './pages/LoadingScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AnalyzePage from './pages/AnalyzePage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Handles the redirect back from Google OAuth
const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store JWT token — AuthContext will pick it up via apiGetProfile on next mount
      localStorage.setItem('pg_jwt', token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=google_auth_failed', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: '#E5E7EB', borderTopColor: '#0D7377' }} />
    </div>
  );
};

function App() {
  const [showLoading, setShowLoading] = useState(() => {
    const hasLoaded = sessionStorage.getItem('pg_loaded');
    return !hasLoaded;
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem('pg_loaded', 'true');
    setShowLoading(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatePresence>
          {showLoading && (
            <LoadingScreen onComplete={handleLoadingComplete} />
          )}
        </AnimatePresence>

        {!showLoading && (
          <Routes>
            {/* Google OAuth callback (outside MainLayout) */}
            <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />

            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/analyze" element={<ProtectedRoute><AnalyzePage /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>
          </Routes>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
