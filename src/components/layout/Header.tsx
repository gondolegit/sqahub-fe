// src/components/layout/Header.tsx
import React from 'react';
import { Menu, LogOut, User } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // PENTING: Import useAuth

// Asumsi Anda memiliki implementasi Dropdown Menu/Popover untuk Profile

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    // 1. Ambil data dan fungsi dari AuthContext
    const { user, logout } = useAuth(); 

    // Asumsi: 'user' memiliki properti seperti 'username'
    const username = user?.username || "Pengguna";

    // Fungsi placeholder untuk Profile (jika belum ada rute/modal spesifik)
    const handleViewProfile = () => {
        // Pilihan: Arahkan ke /profile atau buka modal/dialog
        console.log(`Membuka profil untuk ${username}`);
        // Jika menggunakan react-router-dom: navigate('/profile')
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white shadow-md lg:px-6">
            
            {/* Tombol Hamburger - Hanya terlihat di Mobile/Tablet */}
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="lg:hidden mr-4" // Sembunyikan di layar besar
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Logo/Judul Aplikasi (Opsional) */}
            <div className="text-lg font-semibold lg:ml-0">
                SQAHUB
            </div>

            {/* Aksi Kanan (Profile/Logout) */}
            <div className="flex items-center space-x-4">
                
                {/* Tombol Profile */}
                <Button variant="ghost" size="sm" onClick={handleViewProfile}>
                    <User className="h-5 w-5 mr-2" /> 
                    {username}
                </Button>
                
                {/* Tombol Logout */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout} // 2. Hubungkan ke fungsi logout dari useAuth
                >
                    <LogOut className="h-4 w-4 mr-2" /> 
                    Logout
                </Button>
            </div>
        </header>
    );
};

export default Header;