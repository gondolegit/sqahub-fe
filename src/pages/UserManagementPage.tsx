// src/pages/UserManagementPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, ShieldCheck, AlertTriangle } from 'lucide-react';

const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const { user, hasRole } = useAuth();

    // Periksa role di client (meski sudah dilindungi oleh routing)
    const isAdmin = hasRole(['ADMIN']);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <Users className="mr-3 h-7 w-7" /> {t('userManagement.title')}
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('userManagement.listTitle')}</CardTitle>
                    <CardDescription>
                        {t('userManagement.listDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    {isAdmin ? (
                        <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-md">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
                                <ShieldCheck className="mr-2 h-4 w-4" /> {t('userManagement.accessGranted', { username: user?.username || t('userManagement.guestFallback') })}
                            </p>
                            <Separator className="my-3" />
                            <p className="text-muted-foreground mt-2">
                                {t('userManagement.comingSoon')}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4" /> {t('userManagement.accessDenied')}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 border p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">{t('userManagement.placeholderTitle')}</h3>
                        <p>{t('userManagement.placeholderDescription')}</p>
                        {/* Placeholder untuk tabel pengguna */}
                        <div className="h-40 bg-muted rounded-md mt-2 flex items-center justify-center text-muted-foreground">
                            {t('userManagement.placeholderBox')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagementPage;
