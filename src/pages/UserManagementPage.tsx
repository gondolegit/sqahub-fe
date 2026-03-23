// src/pages/UserManagementPage.tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, ShieldCheck, AlertTriangle } from 'lucide-react';

const UserManagementPage: React.FC = () => {
    const { user, hasRole } = useAuth();
    
    // Periksa role di client (meski sudah dilindungi oleh routing)
    const isAdmin = hasRole(['ADMIN']);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <Users className="mr-3 h-7 w-7" /> Manajemen Pengguna
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna Sistem</CardTitle>
                    <CardDescription>
                        Kelola akun pengguna, peran, dan status akses di sini. Halaman ini hanya tersedia untuk peran ADMIN.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    {isAdmin ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-700 flex items-center">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Akses Diizinkan. Selamat datang, Admin {user?.username || 'Guest'}!
                            </p>
                            <Separator className="my-3" />
                            <p className="text-muted-foreground mt-2">
                                *Implementasi fitur Create/Read/Update/Delete Pengguna akan dilakukan di fase selanjutnya.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-700 flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4" /> Akses Ditolak. Anda tidak memiliki peran ADMIN.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 border p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Konten User Management</h3>
                        <p>Tabel daftar pengguna akan ditempatkan di sini.</p>
                        {/* Placeholder untuk tabel pengguna */}
                        <div className="h-40 bg-gray-100 rounded-md mt-2 flex items-center justify-center text-gray-500">
                            (Tabel Pengguna Aktif/Role)
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagementPage;