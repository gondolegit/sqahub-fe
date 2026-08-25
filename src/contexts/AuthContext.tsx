// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/utils/api';
import type { User, AuthContextType, UserRole, LoginApiResponse } from '@/types';

// Membuat Context dengan tipe yang jelas
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState<boolean>(true);

    const isAuthenticated = !!token && !!user;

    // --- FUNGSI LOGOUT YANG STABIL ---
    const logout = React.useCallback(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        // Navigasi client-side (bukan full page reload) agar bundle aplikasi tidak diunduh ulang
        navigate('/login', { replace: true });
    }, [navigate]);

    useEffect(() => {
        setLoading(false);

        // Response interceptor: paksa logout saat token expired/invalid (401/403).
        // API (dari @/utils/api) sudah menyisipkan header Authorization lewat request interceptor-nya sendiri.
        const interceptorId = API.interceptors.response.use(
            response => response,
            async (error) => {
                if (error.response && [401, 403].includes(error.response.status)) {
                    console.warn("Axios Interceptor: Unauthorized request detected. Forcing logout.");
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            API.interceptors.response.eject(interceptorId);
        };
    }, [logout]);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await API.post<LoginApiResponse>('/auth/authenticate', { username, password });

            const { token: newToken, username: respUsername, role: respRole, userId } = response.data;

            const userData: User = {
                id: userId,
                username: respUsername,
                roles: [respRole],
            };

            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setUser(userData);

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const hasRole = React.useCallback((roles: UserRole[]): boolean => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
    }, [user]);

    const contextValue = useMemo<AuthContextType>(() => ({
        token,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        api: API,
    }), [token, user, loading, isAuthenticated, logout, hasRole]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
