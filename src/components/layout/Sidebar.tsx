import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderKanban, X, ListChecks } from 'lucide-react'; 
import { cn } from "@/lib/utils"; // Gunakan utilitas classname shadcn

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

const navItems = [
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Test Suites', href: '/test-suites', icon: ListChecks },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
    const location = useLocation();

    return (
        <aside 
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b">
                <h2 className="text-xl font-bold text-primary">SQAHUB.org</h2>
                <button 
                    className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md" 
                    onClick={toggle}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
            
            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024) toggle(); // Tutup hanya di mobile
                            }}
                            className={cn(
                                "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;