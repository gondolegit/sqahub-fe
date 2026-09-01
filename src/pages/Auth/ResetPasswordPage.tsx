// src/pages/Auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import { Loader2, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import API from '@/utils/api';

const MIN_PASSWORD_LENGTH = 8;

const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setError(t('auth.resetPassword.errorMinLength', { min: MIN_PASSWORD_LENGTH }));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('auth.resetPassword.errorMismatch'));
            return;
        }

        setIsLoading(true);
        try {
            await API.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login', { replace: true }), 2500);
        } catch (err) {
            const message = isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            setError(message || t('auth.resetPassword.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-background p-4">
            <Card className="w-[400px] shadow-xl border-slate-200/70 dark:border-border">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-primary">{t('auth.resetPassword.title')}</CardTitle>
                    <CardDescription>{t('auth.resetPassword.subtitle')}</CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>

                <CardContent>
                    {!token ? (
                        <div className="space-y-4 text-center">
                            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {t('auth.resetPassword.incompleteLink')}
                            </div>
                            <Link to="/forgot-password" className="block">
                                <Button variant="outline" className="w-full">{t('auth.resetPassword.requestNewLink')}</Button>
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t('auth.resetPassword.successMessage')}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">{t('auth.resetPassword.newPasswordLabel')}</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={MIN_PASSWORD_LENGTH}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPasswordLabel')}</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.resetPassword.submit')}
                            </Button>

                            <Link to="/login" className="block">
                                <Button type="button" variant="link" className="w-full text-muted-foreground hover:text-primary">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('auth.resetPassword.backToLogin')}
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
