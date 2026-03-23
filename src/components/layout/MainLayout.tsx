import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import Header from './Header'; 
import { Card, CardContent } from "@/components/ui/card";

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar (z-50) */}
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            {/* Overlay (z-40) - Di bawah sidebar, di atas konten */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Konten Utama */}
            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <Card className="min-h-[calc(100vh-180px)] shadow-sm border-muted-foreground/10">
                            <CardContent className="p-4 md:p-8">
                                <Outlet />
                            </CardContent>
                        </Card>
                    </div>

                    <footer className="mt-8 py-6 border-t border-muted-foreground/10">
                        <p className="text-sm text-center text-muted-foreground">
                            © {new Date().getFullYear()} SQAHUB.ORG — Quality Assurance Hub
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;