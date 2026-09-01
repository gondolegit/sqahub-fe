// src/components/layout/ThemeToggle.tsx
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const THEME_OPTIONS = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Ikuti Sistem', icon: Monitor },
] as const;

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    // next-themes butuh render setelah mount untuk menghindari mismatch hydration
    // (server/first-paint tidak tahu preferensi tema browser).
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // Satu-satunya cara sah mendeteksi "sudah di-hydrate di client": next-themes sendiri
        // merekomendasikan pola ini agar ikon tema tidak flash/mismatch saat SSR/first paint.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button variant="ghost" size="icon" className="h-9 w-9" disabled aria-label="Memuat pengaturan tema" />;
    }

    const CurrentIcon = THEME_OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Ganti tema tampilan">
                    <CurrentIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {THEME_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={theme === opt.value ? 'bg-accent text-accent-foreground' : ''}
                    >
                        <opt.icon className="mr-2 h-4 w-4" /> {opt.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ThemeToggle;
