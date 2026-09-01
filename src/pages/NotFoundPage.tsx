// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-muted/40 text-center p-4">
            <div className="text-8xl font-extrabold text-primary mb-4">
                404
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
                Halaman Tidak Ditemukan
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
                Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin Anda salah mengetik alamatnya?
            </p>
            <Link to="/dashboard">
                <Button size="lg" className="flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Kembali ke Dashboard
                </Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;