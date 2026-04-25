import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const ProtectedRoute = ({ children }) => {
    // AUTH BYPASSED FOR DEVELOPMENT — set to false to re-enable
    const AUTH_ENABLED = false;
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    if (AUTH_ENABLED) {
        if (isLoading) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: '#FAFBFC' }, children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3", style: { borderColor: '#E5E7EB', borderTopColor: '#0D7377' } }), _jsx("p", { className: "text-sm", style: { color: '#6B7280' }, children: "Loading..." })] }) }));
        }
        if (!isAuthenticated) {
            return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
        }
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
