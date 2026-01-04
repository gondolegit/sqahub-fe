// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios'; // Import AxiosInstance dan AxiosError
import type { AxiosInstance } from 'axios'; // Import AxiosInstance dan AxiosError
import type { User, AuthContextType, UserRole, LoginApiResponse } from '@/types';
// Asumsi '@/utils/api' adalah instance axios dasar, tetapi kita akan membuat instance lokal yang selalu terautorisasi.

// Membuat Context dengan tipe yang jelas
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// BASE URL API Anda (Pastikan ini sesuai)
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Membuat instance Axios lokal yang bisa dimodifikasi headernya
const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState<boolean>(true);

    const isAuthenticated = !!token && !!user;

    // --- FUNGSI LOGOUT YANG STABIL ---
    const logout = React.useCallback(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        // Refresh page untuk reset state
        window.location.href = '/login';
    }, []); // <-- Dependency kosong agar fungsi stabil

    // --- LOGIKA SET-UP AXIOS DAN INTERCEPTOR ---
    useEffect(() => {
        // 1. Atur Header Token
        if (token) {
            authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete authApi.defaults.headers.common['Authorization'];
        }
        setLoading(false);

        // 2. Tambahkan Response Interceptor
        const interceptorId = authApi.interceptors.response.use(
            response => response, // Jika respons sukses, kembalikan saja
            async (error) => {
                // Jika error adalah 401 atau 403 (Unauthorized atau Forbidden)
                if (error.response && [401, 403].includes(error.response.status)) {
                    console.warn("Axios Interceptor: Unauthorized request detected. Forcing logout.");
                    logout(); // Panggil fungsi logout
                }
                // Kembalikan error agar hook yang memanggil tetap tahu bahwa request gagal
                return Promise.reject(error);
            }
        );

        // 3. Cleanup: Hapus Interceptor saat komponen di-unmount
        return () => {
            authApi.interceptors.response.eject(interceptorId);
        };

    }, [token, logout]); // Dependensi pada token dan logout

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // Gunakan interface respons yang baru
            const response = await authApi.post<LoginApiResponse>('/auth/authenticate', { username, password });

            const { token: newToken, username: respUsername, role: respRole, userId } = response.data;

            // --- PERAKITAN OBJEK USER YANG BENAR ---
            const userData: User = {
                id: userId, // Pastikan interface User punya field 'id'
                //email: '', // Kosongkan atau sesuaikan jika ada di respons
                username: respUsername,
                roles: [respRole], // <-- KONVERSI STRING SINGLE KE ARRAY
            };
            // ----------------------------------------

            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setUser(userData); // <-- setUser sekarang mendapat objek User yang valid

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            // Handle error response spesifik di sini jika perlu
            return false;
        }
    };

    const hasRole = (roles: UserRole[]): boolean => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
    };

    const contextValue = useMemo<AuthContextType>(() => ({
        token,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        api: authApi as AxiosInstance,
    }), [token, user, loading, isAuthenticated, logout]); // Tambahkan logout di dep. array

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

