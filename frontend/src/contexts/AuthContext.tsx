import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    ApiUser,
    apiLogin,
    apiRegister,
    apiLogout,
    apiGetProfile,
    apiUpdateProfile,
} from '../services/authApi';

interface AuthContextType {
    user: ApiUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (updates: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
    setUserFromOAuth: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: async () => { },
    updateProfile: async () => ({ success: false }),
    setUserFromOAuth: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: check if JWT cookie is still valid by fetching profile
    useEffect(() => {
        apiGetProfile().then((result) => {
            if (result.ok && result.data?.user) {
                setUser(result.data.user);
            }
            setIsLoading(false);
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await apiLogin(email, password);
        if (result.ok && result.data?.user) {
            setUser(result.data.user);
            return { success: true };
        }
        return { success: false, error: result.error || 'Login failed.' };
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const result = await apiRegister(name, email, password);
        if (result.ok) {
            return { success: true };
        }
        return { success: false, error: result.error || 'Registration failed.' };
    }, []);

    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (updates: { name?: string; phone?: string }) => {
        const result = await apiUpdateProfile(updates);
        if (result.ok && result.data?.user) {
            setUser(result.data.user);
            return { success: true };
        }
        return { success: false, error: result.error || 'Update failed.' };
    }, []);

    // Used by the Google OAuth callback page to set user directly
    const setUserFromOAuth = useCallback((oauthUser: ApiUser) => {
        setUser(oauthUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile, setUserFromOAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
