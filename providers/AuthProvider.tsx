import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import api from '@/services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithOtp: (phone: string, code: string) => Promise<void>;
    requestOtp: (phone: string) => Promise<{ message: string }>;
    register: (data: { email: string; password: string; name: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const hasToken = await api.isAuthenticated();
            if (hasToken) {
                const userData = await api.getMe();
                setUser(userData);
            }
        } catch (error) {
            // Token expired or invalid — clear it
            await api.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.login(email, password);
        await api.setToken(response.token);
        setUser(response.user);
    }, []);

    const loginWithOtp = useCallback(async (phone: string, code: string) => {
        const response = await api.verifyOtp(phone, code);
        await api.setToken(response.token);
        setUser(response.user);
    }, []);

    const requestOtp = useCallback(async (phone: string) => {
        return await api.requestOtp(phone);
    }, []);

    const register = useCallback(async (data: { email: string; password: string; name: string }) => {
        await api.register(data);
        // Auto-login after register
        const response = await api.login(data.email, data.password);
        await api.setToken(response.token);
        setUser(response.user);
    }, []);

    const logout = useCallback(async () => {
        await api.logout();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const userData = await api.getMe();
            setUser(userData);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                loginWithOtp,
                requestOtp,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
