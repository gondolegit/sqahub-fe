import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Loader2, UserPlus, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import API from '@/utils/api';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        role: 'TESTER'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data } = await API.post('/auth/register', formData);

            setSuccess(data.message || "Registrasi Berhasil! Anda akan diarahkan ke halaman Login.");

            // Redirect ke login dan bawa username melalui state
            setTimeout(() => {
                navigate('/login', { state: { registeredUsername: formData.username } });
            }, 2000);

        } catch (err) {
            console.error('Error saat registrasi:', err);
            if (isAxiosError(err)) {
                setError(err.response?.data?.message || err.response?.data?.error || 'Registrasi Gagal. Coba lagi.');
            } else {
                setError('Gagal terhubung ke server. Pastikan API berjalan.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold text-primary flex items-center justify-center">
                        <UserPlus className="h-6 w-6 mr-2" /> Daftar SQAHub
                    </CardTitle>
                    <CardDescription>
                        Buat akun Anda dan pilih peran Anda dalam tim.
                    </CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        {/* Status Message */}
                        {error && (
                            <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15 rounded-lg flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" /> {success}
                            </div>
                        )}
                        
                        {/* Form Inputs */}
                        <div className="grid gap-2"><Label htmlFor="username">Username</Label><Input id="username" type="text" value={formData.username} onChange={handleChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="name">Nama Lengkap</Label><Input id="name" type="text" value={formData.name} onChange={handleChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={handleChange} required /></div>
                        
                        {/* Role Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select onValueChange={handleSelectChange} defaultValue={formData.role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Backend hanya menerima TESTER/DEVELOPER dari registrasi publik — role lain
                                        (ADMIN, AUTOMATION) diturunkan paksa jadi TESTER demi mencegah privilege
                                        escalation, jadi tidak ditampilkan di sini agar tidak menyesatkan. */}
                                    <SelectItem value="TESTER">Tester</SelectItem>
                                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                'Buat Akun Baru'
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute inset-0 -top-2.5 flex justify-center">
                            <span className="bg-card px-3 text-xs uppercase text-muted-foreground">atau</span>
                        </span>
                    </div>

                    <GoogleAuthButton label="Daftar dengan Google" disabled={isLoading} />
                </CardContent>
                
                <CardFooter className="flex flex-col justify-center text-sm space-y-2">
                    <Link to="/login" className="text-primary hover:underline">
                        Sudah punya akun? Login di sini.
                    </Link>
                    <Link to="/" className="text-muted-foreground hover:text-primary flex items-center">
                        <ArrowLeft className="h-3 w-3 mr-1" /> Kembali ke Beranda
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;