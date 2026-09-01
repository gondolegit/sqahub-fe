import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import Contexts dan Types
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

// Import Komponen Auth dan Layout
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Halaman di-lazy-load per rute agar bundle awal tetap kecil (penting untuk koneksi lambat) —
// library berat seperti @react-pdf/renderer/recharts (dipakai TestRunDetailPage)
// baru diunduh saat rute tersebut benar-benar dibuka.
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const OAuth2RedirectPage = lazy(() => import('./pages/Auth/OAuth2RedirectPage'));

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const BugsPage = lazy(() => import('./pages/BugsPage'));
const TestCasesPage = lazy(() => import('./pages/TestCasesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const ApiKeysPage = lazy(() => import('./pages/ApiKeysPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));

// Halaman Test Suites
const TestSuitesPage = lazy(() => import('./pages/TestSuitePage'));
const TestRunDetailPage = lazy(() => import('./pages/TestRunDetailPage'));
const QualityDashboardPage = lazy(() => import('./pages/QualityDashboardPage'));
const RequirementsTraceabilityPage = lazy(() => import('./pages/RequirementsTraceabilityPage'));

const RouteFallback = () => (
    <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold text-primary">Loading Application...</h1>
    </div>
);

const App: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <RouteFallback />;
    }

    // Jika sudah login, rute default (/) mengarah ke Dashboard.
    // Jika belum login, rute default (/) mengarah ke Landing Page.
    const HomeRedirect = isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;

    return (
        <>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    {/* 1. Rute Default (/) & Rute Publik */}

                    {/* 🚨 Rute ROOT: Jika sudah login -> Dashboard, jika belum -> Landing Page */}
                    <Route path="/" element={HomeRedirect} />

                    {/* Rute Auth Publik (Bukan MainLayout) */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} /> {/* 🚨 RUTE REGISTER BARU */}
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

                    {/* 2. Rute Terlindungi (Protected Routes) */}
                    <Route element={<ProtectedRoute />}>

                        <Route element={<MainLayout />}>

                            {/* Rute Standar */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />

                            {/* Rute Project Detail: Feature Management */}
                            <Route path="/projects/:projectId/features" element={<FeaturesPage />} />

                            {/* Rute Bug/Issue Tracking per Project. */}
                            <Route path="/projects/:projectId/bugs" element={<BugsPage />} />

                            {/* Rute Feature Detail: TEST CASE MANAGEMENT */}
                            <Route
                                path="/projects/:projectId/features/:featureId/testcases"
                                element={<TestCasesPage />}
                            />

                            {/* 🛠️ RUTE TEST SUITES & TEST RUNS */}
                            <Route path="/test-suites" element={<TestSuitesPage />} />

                            {/* Halaman Detail/Live Test Suite Run — dipakai baik untuk run yang masih
                                IN PROGRESS (endDate null, bisa ditambah hasil/difinalisasi) maupun run
                                yang sudah selesai (laporan lengkap + export PDF/Excel). */}
                            <Route
                                path="/test-suites/detail/:suiteId"
                                element={<TestRunDetailPage />}
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

                            {/* Quality Dashboard — tanpa batasan role di rute; akses per-proyek sudah
                                diverifikasi backend (ProjectMemberService.isViewAccessAllowed), sama
                                seperti halaman Projects/Test Suites lainnya. */}
                            <Route path="/reports" element={<QualityDashboardPage />} />

                            {/* Requirements Traceability Matrix — sama seperti Quality Dashboard, tanpa
                                batasan role di rute; akses per-proyek diverifikasi backend. */}
                            <Route path="/traceability" element={<RequirementsTraceabilityPage />} />

                            {/* API Keys — semua user login boleh melihat kuncinya sendiri */}
                            <Route path="/settings/api-keys" element={<ApiKeysPage />} />

                            {/* Rute Khusus Peran: Activity Log (ADMIN) */}
                            <Route
                                path="/admin/activity-log"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN' as UserRole]}>
                                        <ActivityLogPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Route>

                    {/* 3. Catch-all / Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>

            <Toaster position="bottom-right" richColors />
        </>
    );
};

export default App;
