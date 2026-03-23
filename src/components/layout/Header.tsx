import React from 'react';
import { Menu, LogOut, User } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { user, logout } = useAuth(); 
    const username = user?.username || "User";

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-card border-b lg:px-6">
            <div className="flex items-center">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleSidebar}
                    className="lg:hidden mr-2"
                >
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="text-lg font-bold tracking-tight lg:hidden">
                    SQAHUB
                </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <User className="h-4 w-4 mr-2" /> 
                    {username}
                </Button>
                
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={logout}
                    className="h-8"
                >
                    <LogOut className="h-4 w-4 mr-2" /> 
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;