// src/pages/Auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import { Loader2, ArrowLeft, MailCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import API from '@/utils/api';

const ForgotPasswordPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            // Backend selalu mengembalikan pesan generik yang sama, ada atau tidaknya email —
            // ini mencegah enumerasi akun, jadi UI di sini juga harus selalu menampilkan sukses.
            setSent(true);
        } catch (err) {
            const message = isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            setError(message || t('auth.forgotPassword.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-background p-4">
            <Card className="w-[400px] shadow-xl border-slate-200/70 dark:border-border">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-primary">{t('auth.forgotPassword.title')}</CardTitle>
                    <CardDescription>
                        <Trans i18nKey="auth.forgotPassword.subtitle" components={{ bold: <span className="font-medium text-foreground" /> }} />
                    </CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>

                <CardContent>
                    {sent ? (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                                <MailCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                <Trans i18nKey="auth.forgotPassword.sentMessage" values={{ email }} components={{ bold: <span className="font-semibold text-foreground" /> }} />
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/login"><ArrowLeft className="mr-2 h-4 w-4" /> {t('auth.forgotPassword.backToLogin')}</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('auth.forgotPassword.emailLabel')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">{t('auth.forgotPassword.emailHint')}</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.forgotPassword.submit')}
                            </Button>

                            <Link to="/login" className="block">
                                <Button type="button" variant="link" className="w-full text-muted-foreground hover:text-primary">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('auth.forgotPassword.backToLogin')}
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
