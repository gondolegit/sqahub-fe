// src/pages/Auth/OAuth2RedirectPage.tsx
//
// Tujuan redirect setelah alur Google OAuth2 di backend selesai (lihat
// OAuth2AuthenticationSuccessHandler / OAuth2AuthenticationFailureHandler di backend).
// Backend mengarahkan browser ke sini membawa ?token=&userId=&username=&role= saat berhasil,
// atau ?error= saat gagal — bukan panggilan API biasa, jadi halaman ini murni baca query string.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const OAuth2RedirectPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { applySession } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const backendError = searchParams.get('error');
        if (backendError) {
            setError(backendError);
            return;
        }

        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        const role = searchParams.get('role');

        if (!token || !userId || !username || !role) {
            setError(t('auth.oauth2Redirect.incompleteResponse'));
            return;
        }

        applySession({ token, userId, username, role: role as UserRole });
        navigate('/dashboard', { replace: true });
        // Hanya dijalankan sekali saat mount — searchParams/navigate/applySession/t stabil untuk siklus hidup halaman ini.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-background p-4">
                <Card className="w-[400px] shadow-xl border-red-100 dark:border-red-500/30">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/15">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">{t('auth.oauth2Redirect.failedTitle')}</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/login"><ArrowLeft className="mr-2 h-4 w-4" /> {t('auth.oauth2Redirect.backToLogin')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-background p-4">
            <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">{t('auth.oauth2Redirect.completing')}</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectPage;
