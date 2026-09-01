import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, KeyRound, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import GlobalSearchDialog from './GlobalSearchDialog';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const username = user?.username || "User";
    const [searchOpen, setSearchOpen] = useState(false);

    // Shortcut global Ctrl/Cmd+K untuk membuka Global Search dari mana saja di dalam MainLayout.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-card border-b lg:px-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="lg:hidden mr-2"
                    aria-label={t('header.openMenu')}
                >
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="text-lg font-bold tracking-tight lg:hidden">
                    SQAHUB
                </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchOpen(true)}
                    className="hidden sm:flex items-center gap-2 text-muted-foreground font-normal w-56 justify-between px-3"
                >
                    <span className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5" /> {t('search.trigger')}
                    </span>
                    <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                        Ctrl K
                    </kbd>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                    className="sm:hidden"
                    aria-label={t('search.trigger')}
                >
                    <Search className="h-5 w-5" />
                </Button>
                <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
                <LanguageSwitcher />
                <ThemeToggle />
                <NotificationBell />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                {username.slice(0, 1).toUpperCase()}
                            </div>
                            {username}
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-sm font-semibold">{username}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {user?.roles.map((role) => (
                                    <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0 font-medium">{role}</Badge>
                                ))}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/settings/api-keys" className="cursor-pointer">
                                <KeyRound className="mr-2 h-4 w-4" /> {t('common.apiKeys')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" /> {t('header.logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Tombol logout langsung tetap tampil di mobile (tanpa dropdown, agar tetap 1 tap) */}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={logout}
                    className="h-8 sm:hidden"
                    aria-label={t('header.logout')}
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
};

export default Header;
