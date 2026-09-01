import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FolderKanban, X, ListChecks, KeyRound, ScrollText, Gauge } from 'lucide-react';
import { cn } from "@/lib/utils"; // Gunakan utilitas classname shadcn
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

interface NavItem {
    labelKey: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Jika diisi, item hanya tampil untuk user dengan salah satu role ini. */
    requiredRoles?: UserRole[];
}

const navItems: NavItem[] = [
    { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
    { labelKey: 'nav.projects', href: '/projects', icon: FolderKanban },
    { labelKey: 'nav.testSuites', href: '/test-suites', icon: ListChecks },
    { labelKey: 'nav.qualityDashboard', href: '/reports', icon: Gauge },
    { labelKey: 'nav.apiKeys', href: '/settings/api-keys', icon: KeyRound },
    { labelKey: 'nav.activityLog', href: '/admin/activity-log', icon: ScrollText, requiredRoles: ['ADMIN'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
    const location = useLocation();
    const { hasRole } = useAuth();
    const { t } = useTranslation();

    const visibleNavItems = navItems.filter((item) => !item.requiredRoles || hasRole(item.requiredRoles));

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b">
                <h2 className="text-xl font-bold text-primary">SQAHUB.org</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-muted-foreground hover:bg-muted"
                    onClick={toggle}
                    aria-label={t('header.closeMenu')}
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            <nav className="p-4 space-y-1">
                {visibleNavItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
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
                            {t(item.labelKey)}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
