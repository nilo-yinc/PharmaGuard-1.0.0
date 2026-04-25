import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFBFC' }}>
                <div className="text-center">
                    <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
                        style={{ borderColor: '#E5E7EB', borderTopColor: '#0D7377' }} />
                    <p className="text-sm" style={{ color: '#6B7280' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
