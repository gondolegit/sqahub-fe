// src/components/layout/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Asumsi nama komponen Sidebar Anda
import Header from './Header';   // Asumsi nama komponen Header/Navbar Anda

const MainLayout: React.FC = () => {
    // State untuk mengontrol visibilitas sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle sidebar (digunakan oleh tombol hamburger)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 1. Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggle={toggleSidebar} 
            />

            {/* 2. Overlay (Hanya muncul di Mobile saat sidebar terbuka) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
                    onClick={toggleSidebar} // Tutup saat overlay diklik
                ></div>
            )}

            {/* 3. Konten Utama */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                <Header toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {/* Render content dari rute nested (e.g., DashboardPage, ProjectsPage) */}
                    <Outlet />
                </main>
                
                {/* Opsional: Footer */}
                {/* <footer className="p-4 text-center text-xs text-gray-500 border-t">...</footer> */}
            </div>
        </div>
    );
};

export default MainLayout;