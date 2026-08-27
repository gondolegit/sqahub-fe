// src/pages/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban, ListChecks, KeyRound, ArrowRight, Sparkles, ShieldCheck, ScrollText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ROLE_BADGE_CLASSES: Record<string, string> = {
    ADMIN: 'bg-violet-100 text-violet-700 border-violet-200',
    TESTER: 'bg-blue-100 text-blue-700 border-blue-200',
    DEVELOPER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    AUTOMATION: 'bg-amber-100 text-amber-700 border-amber-200',
};

const QUICK_LINKS = [
    { title: 'Projects', description: 'Kelola seluruh proyek pengujian Anda', href: '/projects', icon: FolderKanban, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Test Suites', description: 'Lihat riwayat eksekusi & buat run baru', href: '/test-suites', icon: ListChecks, gradient: 'from-emerald-500 to-emerald-600' },
    { title: 'API Keys', description: 'Integrasikan dengan Katalon, Jenkins, dll.', href: '/settings/api-keys', icon: KeyRound, gradient: 'from-amber-500 to-amber-600' },
];

const DashboardPage: React.FC = () => {
    const { user, hasRole } = useAuth();
    const { data: projectsPage, isLoading } = useProjects({ size: 5, sort: 'updatedAt,desc' });
    const recentProjects = projectsPage?.content ?? [];

    return (
        <div className="space-y-8">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-8 text-white shadow-xl">
                <Sparkles className="absolute -right-4 -top-4 h-32 w-32 text-white/10" />
                <p className="text-sm font-medium text-white/70">Selamat datang kembali,</p>
                <h1 className="text-3xl font-extrabold tracking-tight">{user?.username || 'Tester'} 👋</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                    {user?.roles.map((role) => (
                        <Badge key={role} variant="outline" className={`${ROLE_BADGE_CLASSES[role] || 'bg-white/10 text-white border-white/20'} bg-white/10 text-white border-white/20 font-semibold`}>
                            {role}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Quick links */}
            <div className="grid gap-4 md:grid-cols-3">
                {QUICK_LINKS.map((link) => (
                    <Link key={link.href} to={link.href} className="group">
                        <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <CardContent className="p-6">
                                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradient} text-white shadow-lg`}>
                                    <link.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-lg flex items-center gap-1.5">
                                    {link.title}
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {hasRole(['ADMIN']) && (
                    <Link to="/admin/activity-log" className="group">
                        <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg">
                                    <ScrollText className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-lg flex items-center gap-1.5">
                                    Activity Log
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Audit seluruh aktivitas sistem</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>

            {/* Recent projects */}
            <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-lg">Proyek Terbaru</CardTitle>
                        <CardDescription>Proyek yang baru saja diperbarui</CardDescription>
                    </div>
                    <Link to="/projects" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                        Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
                    ) : recentProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <ShieldCheck className="h-8 w-8 text-slate-200" />
                            <p className="text-slate-400 text-sm">Belum ada proyek. Mulai dengan membuat proyek pertama Anda.</p>
                        </div>
                    ) : (
                        recentProjects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}/features`}
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{project.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{project.description || 'Tidak ada deskripsi'}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 ml-3 font-mono text-[10px] uppercase">{project.type}</Badge>
                            </Link>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;
