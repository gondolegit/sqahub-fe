// src/App.tsx (VERSI PERBAIKAN LENGKAP - DENGAN RUTE TEST SUITE BARU)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
// *** PENTING: Import Toaster dari sonner ***
import { Toaster } from 'sonner';

// Import Contexts dan Types
import { useAuth } from '@/contexts/AuthContext'; 
import type { UserRole } from '@/types';

// Import Komponen Auth dan Layout
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import Halaman NYATA
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import FeaturesPage from './pages/FeaturesPage';
import TestCasesPage from './pages/TestCasesPage'; // Sudah ada

import NotFoundPage from './pages/NotFoundPage';
import UserManagementPage from './pages/UserManagementPage';

// 🚨 IMPORT BARU/REVISI: Halaman Test Suites
import TestSuitesPage from './pages/TestSuitePage'; 
import TestSuiteDetailPage from './pages/TestSuiteDetailPage'; 
// 🚨 IMPORT BARU: Halaman Detail Test Suite Statis
import TestSuiteDetailView from './pages/TestSuiteDetailView'; 


// Asumsi ReportsPage sudah diimpor/didefinisikan
const ReportsPage = () => <div className="p-4"><h1>Quality Reports (QAM/TESTER Only)</h1></div>;


const App: React.FC = () => {
    const { isAuthenticated, loading } = useAuth(); 

    if (loading) {
        // Tampilkan layar loading sementara saat status auth belum pasti
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-2xl font-semibold text-primary">Loading Application...</h1>
            </div>
        );
    }
    
    // Logika utama untuk rute default (path="/")
    const HomeRedirect = isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;

    return (
        <>
            <Routes>
                {/* 1. Rute Default (/) & Rute Publik */}
                <Route path="/" element={HomeRedirect} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* 2. Rute Terlindungi (Protected Routes) */}
                <Route element={<ProtectedRoute />}>
                    
                    <Route element={<MainLayout />}>
                        
                        {/* Rute Standar */}
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        
                        {/* Rute Project Detail: Feature Management */}
                        <Route path="/projects/:projectId/features" element={<FeaturesPage />} />

                        {/* Rute Feature Detail: TEST CASE MANAGEMENT */}
                        <Route 
                            path="/projects/:projectId/features/:featureId/testcases" 
                            element={<TestCasesPage />} 
                        />
                        
                        {/* --------------------------------------------------- */}
                        {/* 🚨 PENAMBAHAN RUTE BARU: TEST SUITES & TEST RUNS 🚨 */}
                        {/* --------------------------------------------------- */}
                        
                        {/* 1. Halaman Daftar Riwayat Test Run (Level Proyek) */}
                        <Route path="/test-suites" element={<TestSuitesPage />} />

                        {/* 2. Halaman Detail Test SUITE (STATIS) */}
                        {/* Ini akan menampilkan detail statis Test Suite dan daftar Test Case-nya */}
                        <Route 
                            path="/test-suites/detail/:suiteId" 
                            element={<TestSuiteDetailView />} 
                        />
                        
                        {/* 3. Halaman Detail Test RUN (DINAMIS - Hasil Eksekusi) */}
                        {/* Menggunakan :runId untuk detail eksekusi tunggal */}
                        <Route 
                            path="/test-runs/:runId" 
                            element={<TestSuiteDetailPage />} 
                        />

                        {/* Rute Khusus Peran: User Management (ADMIN) */}
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN' as UserRole]}>
                                    <UserManagementPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Rute Khusus Peran: Reports (ADMIN, TESTER) */}
                        <Route
                            path="/reports"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN' as UserRole, 'TESTER' as UserRole]}>
                                    <ReportsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Route>

                {/* 3. Catch-all / Not Found */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            {/* Sonner Toaster ditempatkan di luar Routes agar persisten */}
            <Toaster position="bottom-right" richColors />
        </>
    );
};

export default App;