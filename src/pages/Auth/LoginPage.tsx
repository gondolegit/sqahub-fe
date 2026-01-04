// src/pages/Auth/LoginPage.tsx
import React, { useState, useEffect } from 'react'; // <-- PENTING: Import useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Gunakan isAuthenticated atau token (keduanya harusnya sinkron)
    const { login, isAuthenticated } = useAuth(); // Saya ganti token ke isAuthenticated
    const navigate = useNavigate();

    // --- SOLUSI: Menggunakan useEffect untuk semua Redirect ---
    useEffect(() => {
        if (isAuthenticated) {
            // Jika sudah terotentikasi (baik saat load awal atau setelah login sukses)
            // Lakukan redirect hanya di sini, di dalam useEffect.
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]); 
    // Dependency array: navigate stabil, jadi hanya menunggu isAuthenticated berubah.
    // ---------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(username, password);

        // Catatan: Setelah login berhasil (success=true), fungsi login akan 
        // memperbarui state Context menjadi isAuthenticated=true.
        // PERHATIKAN: Kita tidak lagi memanggil navigate di sini! 
        // Perubahan isAuthenticated akan memicu useEffect di atas.
        
        if (!success) {
            // Login gagal (error ditampilkan oleh fungsi login di AuthContext)
            setError('Login gagal. Periksa username dan password Anda.');
        } 
        
        setIsLoading(false);
    };

    // Opsional: Jika isAuthenticated sudah true, tampilkan loading/null sementara
    // sebelum redirect oleh useEffect dijalankan.
    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/40">
                <p className="text-xl text-primary">Logging in... Redirecting...</p>
            </div>
        );
    }


    return (
        <div className="flex h-screen items-center justify-center bg-muted/40">
            <Card className="w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">SQAHUB</CardTitle>
                    <CardDescription>Aplikasi Manajemen Proyek dan Kualitas</CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && <p className="text-sm text-destructive text-center">{error}</p>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;