// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}!</h1>
      <p className="text-muted-foreground">Ini adalah halaman dashboard utama SQAHUB.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.roles.join(', ') || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Akses Anda ditentukan oleh peran ini.
            </p>
          </CardContent>
        </Card>
        
        {/* Tambahkan card status/metric lainnya di sini */}
        
      </div>
      
      <div className="p-4 border rounded-lg bg-card mt-6">
        <h2 className="text-xl font-semibold mb-3">Testing Status</h2>
        <p>Aplikasi berhasil memuat data dari AuthContext.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Jika Anda melihat sidebar dan role Anda, berarti sistem otentikasi (login, token storage, context) sudah bekerja.
        </p>
      </div>

    </div>
  );
};

export default DashboardPage;