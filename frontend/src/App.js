import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './pages/LoadingScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AnalyzePage from './pages/AnalyzePage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
function App() {
    const [showLoading, setShowLoading] = useState(() => {
        // Only show loading once per session
        const hasLoaded = sessionStorage.getItem('pg_loaded');
        return !hasLoaded;
    });
    const handleLoadingComplete = () => {
        sessionStorage.setItem('pg_loaded', 'true');
        setShowLoading(false);
    };
    return (_jsx(ThemeProvider, { children: _jsxs(AuthProvider, { children: [_jsx(AnimatePresence, { children: showLoading && (_jsx(LoadingScreen, { onComplete: handleLoadingComplete })) }), !showLoading && (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(MainLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(UserDashboard, {}) }), _jsx(Route, { path: "/analyze", element: _jsx(AnalyzePage, {}) }), _jsx(Route, { path: "/report/:id", element: _jsx(ReportPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) })] }) }))] }) }));
}
export default App;
