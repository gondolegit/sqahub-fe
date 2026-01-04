// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// 🚨 IMPORT BARU: ListChecks untuk Test Suites
import { LayoutDashboard, Users, FolderKanban, FileText, X, ListChecks } from 'lucide-react'; 
// Asumsi Anda punya data user untuk role-based access

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TESTER', 'DEV'] },
    { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['ADMIN', 'TESTER', 'DEV'] },
    
    // 🚨 PENAMBAHAN BARU: Rute untuk Daftar Test Suites/Runs
    { name: 'Test Suites', href: '/test-suites', icon: ListChecks, roles: ['ADMIN', 'TESTER', 'DEV'] },
    
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['ADMIN', 'TESTER'] },
    { name: 'User Management', href: '/users', icon: Users, roles: ['ADMIN'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
    const location = useLocation();
    // Asumsi hook untuk mendapatkan peran pengguna:
    // const { user } = useAuth();
    // const userRole = user?.role || 'GUEST';

    return (
        // Styling Sidebar:
        // z-30 (di atas overlay) | fixed inset-y-0 (fixed di mobile) | transform translate-x-0/-full (toggle)
        // lg:static lg:translate-x-0 (kembali normal di desktop)
        <div 
            className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:shadow-none
            `}
        >
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-primary">SQAHUB</h2>
                {/* Tombol Tutup Sidebar (Hanya di Mobile) */}
                <button className="lg:hidden text-gray-600 hover:text-gray-800" onClick={toggle}>
                    <X className="h-6 w-6" />
                </button>
            </div>
            
            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    // Di sini tambahkan logika filter roles jika diperlukan
                    // item.roles.includes(userRole) && 
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={toggle} // Tutup sidebar setelah navigasi (UX Mobile)
                        className={`
                            flex items-center px-4 py-2 rounded-lg transition-colors duration-200
                            ${location.pathname === item.href 
                                ? 'bg-primary text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;