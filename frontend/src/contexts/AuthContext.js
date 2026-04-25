import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSession, clearSession, loginUser as loginService, registerUser as registerService, updateUser as updateService, } from '../services/storageService';
const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: () => { },
    updateProfile: () => { },
});
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // RESTORE SESSION OR DEV BYPASS
    useEffect(() => {
        const session = getSession();
        if (session) {
            setUser(session);
        }
        else {
            // DEV: Bypass auth if no session exists
            const AUTH_BYPASS = true;
            if (AUTH_BYPASS) {
                setUser({
                    id: 'dev-user-123',
                    name: 'Dev User',
                    email: 'dev@pharmaguard.ai',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            }
        }
        setIsLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
        // Simulate network latency
        await new Promise(r => setTimeout(r, 600));
        const result = loginService(email, password);
        if (result.success && result.user) {
            const { passwordHash, ...safe } = result.user;
            setUser(safe);
        }
        return { success: result.success, error: result.error };
    }, []);
    const register = useCallback(async (name, email, password) => {
        await new Promise(r => setTimeout(r, 600));
        const result = registerService(name, email, password);
        if (result.success && result.user) {
            const { passwordHash, ...safe } = result.user;
            setUser(safe);
        }
        return { success: result.success, error: result.error };
    }, []);
    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);
    const updateProfile = useCallback((updates) => {
        if (!user)
            return;
        const updated = updateService(user.id, updates);
        if (updated) {
            const { passwordHash, ...safe } = updated;
            setUser(safe);
        }
    }, [user]);
    return (_jsx(AuthContext.Provider, { value: { user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile }, children: children }));
};
export const useAuth = () => useContext(AuthContext);
