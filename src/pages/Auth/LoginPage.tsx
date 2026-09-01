import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
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
            setRegistrationSuccessMessage(t('auth.login.registrationSuccess', { username: location.state.registeredUsername }));

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, t]);

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
                <p className="text-xl text-primary">{t('auth.login.loggingIn')}</p>
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
            setError(t('auth.login.errorGeneric'));
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold text-primary">{t('auth.login.brand')}</CardTitle>
                    <CardDescription>{t('auth.login.subtitle')}</CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>
                
                <CardContent>
                    {/* Pesan Sukses Registrasi */}
                    {registrationSuccessMessage && (
                        <div className="p-3 mb-4 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" /> {registrationSuccessMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t('auth.login.usernameLabel')}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('auth.login.usernamePlaceholder')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">{t('auth.login.passwordLabel')}</Label>
                                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                    {t('auth.login.forgotPassword')}
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.login.passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                t('auth.login.submit')
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute inset-0 -top-2.5 flex justify-center">
                            <span className="bg-card px-3 text-xs uppercase text-muted-foreground">{t('common.or')}</span>
                        </span>
                    </div>

                    <GoogleAuthButton label={t('auth.login.googleButton')} disabled={isLoading} />

                    <Separator className="my-6" />

                    {/* Tombol Register dan Kembali ke Landing Page */}
                    <div className="space-y-3">
                        <Link to="/register" className="block">
                            <Button variant="outline" className="w-full text-foreground border-border hover:bg-muted">
                                <UserPlus className="mr-2 h-4 w-4" /> {t('auth.login.noAccount')}
                            </Button>
                        </Link>
                        <Link to="/" className="block">
                            <Button variant="link" className="w-full text-muted-foreground hover:text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" /> {t('auth.login.backToLanding')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;