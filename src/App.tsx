import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { Toaster } from 'sonner';

// Import Contexts dan Types
import { useAuth } from '@/contexts/AuthContext'; 
import type { UserRole } from '@/types';

// Import Komponen Auth dan Layout
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import Halaman NYATA
import LoginPage from './pages/Auth/LoginPage';
// 🚨 IMPORT HALAMAN BARU
import LandingPage from './pages/LandingPage'; 
import RegisterPage from './pages/Auth/RegisterPage'; 

import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import FeaturesPage from './pages/FeaturesPage';
import TestCasesPage from './pages/TestCasesPage'; 
import NotFoundPage from './pages/NotFoundPage';
import UserManagementPage from './pages/UserManagementPage';

// Halaman Test Suites
import TestSuitesPage from './pages/TestSuitePage'; 
import TestSuiteDetailPage from './pages/TestSuiteDetailPage'; 
import TestRunDetailPage from './pages/TestRunDetailPage'; 


const ReportsPage = () => <div className="p-4"><h1>Quality Reports (QAM/TESTER Only)</h1></div>;


const App: React.FC = () => {
    const { isAuthenticated, loading } = useAuth(); 

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-2xl font-semibold text-primary">Loading Application...</h1>
            </div>
        );
    }
    
    // 🚨 LOGIKA BARU: Jika sudah login, rute default (/) mengarah ke Dashboard. 
    // Jika belum login, rute default (/) mengarah ke Landing Page.
    // const HomeRedirect = isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
    const HomeRedirect = isAuthenticated ? <Navigate to="/projects" replace /> : <LandingPage />;

    return (
        <>
            <Routes>
                {/* 1. Rute Default (/) & Rute Publik */}
                
                {/* 🚨 Rute ROOT: Jika sudah login -> Dashboard, jika belum -> Landing Page */}
                <Route path="/" element={HomeRedirect} /> 
                
                {/* Rute Auth Publik (Bukan MainLayout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> {/* 🚨 RUTE REGISTER BARU */}
                
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
                        
                        {/* 🛠️ RUTE TEST SUITES & TEST RUNS */}
                        <Route path="/test-suites" element={<TestSuitesPage />} />

                        {/* 2. Halaman Detail Test SUITE (STATIS/Template) */}
                        <Route 
                            path="/test-suites/detail/:suiteId" 
                            element={<TestRunDetailPage />} 
                        />
                        
                        {/* 3. Halaman Detail Test RUN (DINAMIS - Hasil Eksekusi, untuk Export PDF) */}
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
            
            <Toaster position="bottom-right" richColors />
        </>
    );
};

export default App;