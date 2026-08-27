import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- Efek untuk Menampilkan Pesan Sukses Registrasi ---
    useEffect(() => {
        if (location.state?.registeredUsername) {
            setUsername(location.state.registeredUsername); 
            setRegistrationSuccessMessage(`Registrasi berhasil untuk ${location.state.registeredUsername}. Silakan login.`);
            
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // --- Efek untuk Redirect ke Dashboard ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]); 

    // --- Loading/Redirect View ---
    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/40">
                <p className="text-xl text-primary">Logging in... Redirecting...</p>
            </div>
        );
    }

    // --- Handler Login ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setRegistrationSuccessMessage(null); 
        setIsLoading(true);

        const success = await login(username, password);
        
        if (!success) {
            setError('Login gagal. Periksa username dan password Anda.');
        } 
        
        setIsLoading(false);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold text-primary">SQAHUB</CardTitle>
                    <CardDescription>Masuk untuk mengakses Dashboard Kualitas</CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>
                
                <CardContent>
                    {/* Pesan Sukses Registrasi */}
                    {registrationSuccessMessage && (
                        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" /> {registrationSuccessMessage}
                        </div>
                    )}

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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                    Lupa password?
                                </Link>
                            </div>
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

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Login ke SQAHub'
                            )}
                        </Button>
                    </form>
                    
                    <Separator className="my-6" />

                    {/* Tombol Register dan Kembali ke Landing Page */}
                    <div className="space-y-3">
                        <Link to="/register" className="block">
                            <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-100">
                                <UserPlus className="mr-2 h-4 w-4" /> Belum punya akun? Daftar
                            </Button>
                        </Link>
                        <Link to="/" className="block">
                            <Button variant="link" className="w-full text-gray-500 hover:text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Landing Page
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;