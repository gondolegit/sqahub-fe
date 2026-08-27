// src/pages/Auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
            setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
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
            setError(message || 'Tautan reset tidak valid atau sudah kedaluwarsa.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
            <Card className="w-[400px] shadow-xl border-slate-200/70">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-primary">Atur Ulang Password</CardTitle>
                    <CardDescription>Buat password baru untuk akun Anda.</CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>

                <CardContent>
                    {!token ? (
                        <div className="space-y-4 text-center">
                            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                Tautan reset tidak lengkap. Silakan buka kembali tautan dari email Anda.
                            </div>
                            <Link to="/forgot-password" className="block">
                                <Button variant="outline" className="w-full">Minta Tautan Baru</Button>
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <p className="text-sm text-slate-600">
                                Password berhasil diperbarui. Mengalihkan ke halaman login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Password Baru</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={MIN_PASSWORD_LENGTH}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Ulangi password baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Password Baru'}
                            </Button>

                            <Link to="/login" className="block">
                                <Button type="button" variant="link" className="w-full text-slate-500 hover:text-primary">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Login
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
