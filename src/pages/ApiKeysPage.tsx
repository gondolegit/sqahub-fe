// src/pages/ApiKeysPage.tsx
import React, { useState } from 'react';
import {
    KeyRound, Plus, Trash2, Loader2, Copy, Check, ShieldAlert, Clock, CalendarClock,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/hooks/useApiKeys';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import type { ApiKey } from '@/types/index';

// Sesuai matriks izin backend: create/revoke ApiKey butuh role global ADMIN, TESTER, atau DEVELOPER.
const API_KEY_MANAGE_ROLES = ['ADMIN', 'TESTER', 'DEVELOPER'] as const;

const STATUS_BADGE: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    REVOKED: 'bg-muted text-muted-foreground border-border',
    EXPIRED: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
};

const ApiKeysPage: React.FC = () => {
    const { hasRole } = useAuth();
    const canManage = hasRole([...API_KEY_MANAGE_ROLES]);

    const { data: apiKeys, isLoading } = useApiKeys();
    const createMutation = useCreateApiKey();
    const revokeMutation = useRevokeApiKey();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [revealedKey, setRevealedKey] = useState<ApiKey | null>(null);
    const [copied, setCopied] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(
            { name, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined },
            {
                onSuccess: (created) => {
                    setIsCreateOpen(false);
                    setName('');
                    setExpiresAt('');
                    setRevealedKey(created);
                },
            }
        );
    };

    const handleCopy = () => {
        if (!revealedKey?.rawKey) return;
        navigator.clipboard.writeText(revealedKey.rawKey).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <KeyRound className="h-7 w-7 text-primary" /> API Keys
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola kredensial untuk integrasi eksternal (Katalon, Jenkins, dsb).
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsCreateOpen(true)} className="shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Buat API Key
                    </Button>
                )}
            </div>

            <Card className="shadow-md border-none">
                <CardHeader>
                    <CardTitle className="text-lg">Daftar API Key Anda</CardTitle>
                    <CardDescription>Hanya kunci milik akun Anda sendiri yang ditampilkan.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : !apiKeys || apiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <KeyRound className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground">Belum ada API Key.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Kedaluwarsa</TableHead>
                                    <TableHead>Terakhir Dipakai</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    {canManage && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={STATUS_BADGE[key.status] || 'bg-muted text-muted-foreground'}>
                                                {key.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {key.expiresAt ? formatDate(key.expiresAt) : 'Tidak pernah'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {key.lastUsedAt ? formatDate(key.lastUsedAt, true) : 'Belum pernah'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                                        {canManage && (
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => setKeyToRevoke(key)}
                                                    disabled={key.status === 'REVOKED'}
                                                    aria-label={`Cabut kunci ${key.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Buat Key */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Buat API Key Baru</DialogTitle>
                        <DialogDescription>Beri nama yang jelas agar mudah dikenali nanti.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="keyName">Nama</Label>
                            <Input id="keyName" placeholder="Mis. Jenkins CI Pipeline" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="keyExpiry" className="flex items-center gap-1.5">
                                <CalendarClock className="h-3.5 w-3.5" /> Kedaluwarsa (opsional)
                            </Label>
                            <Input id="keyExpiry" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Buat
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog "Copy Once" — tampil sesaat setelah key dibuat */}
            <Dialog open={!!revealedKey} onOpenChange={(open) => !open && setRevealedKey(null)}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <ShieldAlert className="h-5 w-5" /> API Key Berhasil Dibuat
                        </DialogTitle>
                        <DialogDescription>
                            Salin kunci ini sekarang — demi keamanan, kunci lengkap <span className="font-semibold">tidak akan ditampilkan lagi</span> setelah dialog ini ditutup.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                        <code className="flex-1 break-all text-sm font-mono text-foreground">{revealedKey?.rawKey}</code>
                        <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={handleCopy} aria-label="Salin API key">
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setRevealedKey(null)}>Saya Sudah Menyimpannya</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Konfirmasi Cabut */}
            <AlertDialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-destructive" /> Cabut API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{keyToRevoke?.name}" akan langsung berhenti berfungsi untuk semua integrasi yang memakainya. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (keyToRevoke) revokeMutation.mutate(keyToRevoke.id);
                                setKeyToRevoke(null);
                            }}
                        >
                            Cabut
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ApiKeysPage;
