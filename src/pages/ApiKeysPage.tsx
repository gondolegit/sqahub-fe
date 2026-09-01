// src/pages/ApiKeysPage.tsx
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
                        <KeyRound className="h-7 w-7 text-primary" /> {t('common.apiKeys')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('apiKeys.subtitle')}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsCreateOpen(true)} className="shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> {t('apiKeys.createButton')}
                    </Button>
                )}
            </div>

            <Card className="shadow-md border-none">
                <CardHeader>
                    <CardTitle className="text-lg">{t('apiKeys.listTitle')}</CardTitle>
                    <CardDescription>{t('apiKeys.listSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : !apiKeys || apiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <KeyRound className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground">{t('apiKeys.empty')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('apiKeys.table.name')}</TableHead>
                                    <TableHead>{t('apiKeys.table.status')}</TableHead>
                                    <TableHead>{t('apiKeys.table.expires')}</TableHead>
                                    <TableHead>{t('apiKeys.table.lastUsed')}</TableHead>
                                    <TableHead>{t('apiKeys.table.created')}</TableHead>
                                    {canManage && <TableHead className="text-right">{t('apiKeys.table.actions')}</TableHead>}
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
                                            {key.expiresAt ? formatDate(key.expiresAt) : t('apiKeys.neverExpires')}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {key.lastUsedAt ? formatDate(key.lastUsedAt, true) : t('apiKeys.neverUsed')}
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
                                                    aria-label={t('apiKeys.revokeAria', { name: key.name })}
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
                        <DialogTitle>{t('apiKeys.createDialog.title')}</DialogTitle>
                        <DialogDescription>{t('apiKeys.createDialog.description')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="keyName">{t('apiKeys.createDialog.nameLabel')}</Label>
                            <Input id="keyName" placeholder={t('apiKeys.createDialog.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="keyExpiry" className="flex items-center gap-1.5">
                                <CalendarClock className="h-3.5 w-3.5" /> {t('apiKeys.createDialog.expiryLabel')}
                            </Label>
                            <Input id="keyExpiry" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>{t('apiKeys.createDialog.cancel')}</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {t('apiKeys.createDialog.submit')}
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
                            <ShieldAlert className="h-5 w-5" /> {t('apiKeys.revealDialog.title')}
                        </DialogTitle>
                        <DialogDescription>
                            <Trans i18nKey="apiKeys.revealDialog.description" components={{ bold: <span className="font-semibold" /> }} />
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                        <code className="flex-1 break-all text-sm font-mono text-foreground">{revealedKey?.rawKey}</code>
                        <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={handleCopy} aria-label={t('apiKeys.revealDialog.copyAria')}>
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setRevealedKey(null)}>{t('apiKeys.revealDialog.confirmSaved')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Konfirmasi Cabut */}
            <AlertDialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-destructive" /> {t('apiKeys.revokeConfirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('apiKeys.revokeConfirm.description', { name: keyToRevoke?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('apiKeys.revokeConfirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (keyToRevoke) revokeMutation.mutate(keyToRevoke.id);
                                setKeyToRevoke(null);
                            }}
                        >
                            {t('apiKeys.revokeConfirm.action')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ApiKeysPage;
