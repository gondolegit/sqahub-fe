// src/pages/Auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Loader2, ArrowLeft, MailCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import API from '@/utils/api';

const ForgotPasswordPage: React.FC = () => {
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
            setError(message || 'Gagal mengirim permintaan. Coba lagi beberapa saat lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
            <Card className="w-[400px] shadow-xl border-slate-200/70">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-primary">Lupa Password?</CardTitle>
                    <CardDescription>
                        Login SQAHub memakai username, tapi reset password dikirim lewat <span className="font-medium text-slate-600">email akun</span> Anda —
                        masukkan email yang dipakai saat mendaftar, kami kirimkan tautan reset jika email tersebut terdaftar.
                    </CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>

                <CardContent>
                    {sent ? (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <MailCheck className="h-6 w-6 text-emerald-600" />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Jika <span className="font-semibold text-slate-800">{email}</span> terdaftar,
                                kami sudah mengirimkan instruksi reset password ke alamat tersebut. Periksa juga folder spam.
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/login"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Akun Terdaftar</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@perusahaan.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-slate-400">Bukan username login Anda — gunakan alamat email saat registrasi.</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim Tautan Reset'}
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

export default ForgotPasswordPage;
