// src/components/auth/ProtectedRoute.tsx
import React from 'react'; // <-- PENTING: Import ReactNode
import type { ReactNode } from 'react'; // <-- PENTING: Import ReactNode
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types'; 

// --- PERBAIKAN: Tambahkan children ke Props ---
interface ProtectedRouteProps {
  children?: ReactNode; // Memungkinkan komponen di-wrap
  allowedRoles?: UserRole[]; 
}
// ----------------------------------------------

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth(); // isAuthenticated TIDAK BOLEH UNDEFINED
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Logic Otorisasi
  if (allowedRoles && user && !user.roles.some(role => allowedRoles.includes(role))) {
    // Jika tidak memiliki peran yang diizinkan, kembalikan ke dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Jika digunakan sebagai wrapper (ada children), render children
  if (children) {
    return <>{children}</>;
  }
  
  // Jika tidak ada children, render Outlet (Digunakan untuk rute parent)
  return <Outlet />; 
};

export default ProtectedRoute;