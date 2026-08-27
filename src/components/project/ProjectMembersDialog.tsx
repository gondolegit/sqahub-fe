// src/components/project/ProjectMembersDialog.tsx
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Loader2, Info, ShieldCheck } from 'lucide-react';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    useProjectMembers, useAddProjectMember, useUpdateProjectMember, useRemoveProjectMember,
} from '@/hooks/useProjectMembers';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectMember, ProjectMemberRole } from '@/types/index';

const MEMBER_ROLES: ProjectMemberRole[] = ['MANAGER', 'TESTER', 'DEVELOPER', 'VIEWER'];

const ROLE_BADGE_CLASSES: Record<ProjectMemberRole, string> = {
    MANAGER: 'bg-violet-100 text-violet-700 border-violet-200',
    TESTER: 'bg-blue-100 text-blue-700 border-blue-200',
    DEVELOPER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    VIEWER: 'bg-slate-100 text-slate-600 border-slate-200',
};

interface ProjectMembersDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const initials = (name: string) =>
    name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join('') || '?';

const ProjectMembersDialog: React.FC<ProjectMembersDialogProps> = ({ project, open, onOpenChange }) => {
    const projectId = project?.id;
    const { user } = useAuth();
    const { data: members, isLoading, isError } = useProjectMembers(projectId);
    const addMutation = useAddProjectMember(projectId);
    const updateMutation = useUpdateProjectMember(projectId);
    const removeMutation = useRemoveProjectMember(projectId);

    // Sesuai spec backend: hanya MANAGER proyek ini yang boleh mengelola anggota (bukan role global).
    const isManager = !!user && members?.some((m) => String(m.idUser) === user.id && m.role === 'MANAGER');

    const [newUserId, setNewUserId] = useState('');
    const [newRole, setNewRole] = useState<ProjectMemberRole>('TESTER');
    const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const idUser = Number(newUserId);
        if (!idUser || idUser <= 0) return;
        addMutation.mutate({ idUser, role: newRole }, {
            onSuccess: () => setNewUserId(''),
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b bg-slate-50/60">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Users className="h-5 w-5 text-primary" /> Tim Proyek
                        </DialogTitle>
                        <DialogDescription>
                            Kelola siapa saja yang punya akses ke <span className="font-semibold text-slate-700">{project?.name}</span> dan perannya.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Form tambah anggota — hanya MANAGER proyek ini yang boleh mengelola tim */}
                        {isManager ? (
                            <>
                                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3 rounded-xl border border-dashed p-4 bg-slate-50/40">
                                    <div className="flex-1 w-full space-y-1.5">
                                        <Label htmlFor="newUserId" className="text-xs font-bold uppercase text-slate-500">User ID</Label>
                                        <Input
                                            id="newUserId"
                                            type="number"
                                            min={1}
                                            placeholder="Mis. 7"
                                            value={newUserId}
                                            onChange={(e) => setNewUserId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-40 space-y-1.5">
                                        <Label className="text-xs font-bold uppercase text-slate-500">Peran</Label>
                                        <Select value={newRole} onValueChange={(v) => setNewRole(v as ProjectMemberRole)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {MEMBER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={addMutation.isPending} className="w-full sm:w-auto">
                                        {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                        Tambah
                                    </Button>
                                </form>
                                <p className="-mt-4 flex items-start gap-1.5 text-xs text-slate-400">
                                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    Masukkan User ID numerik pengguna yang sudah terdaftar di SQAHub.
                                </p>
                            </>
                        ) : (
                            <p className="flex items-center gap-1.5 text-xs text-slate-400 rounded-lg bg-slate-50 p-3">
                                <Info className="h-3.5 w-3.5 shrink-0" />
                                Hanya MANAGER proyek ini yang bisa menambah, mengubah peran, atau mengeluarkan anggota.
                            </p>
                        )}

                        {/* Daftar anggota */}
                        <ScrollArea className="h-[320px] rounded-lg border">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full p-10 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat anggota...
                                </div>
                            ) : isError ? (
                                <div className="p-10 text-center text-sm text-destructive">
                                    Gagal memuat anggota tim (mungkin Anda tidak punya akses ke proyek ini).
                                </div>
                            ) : !members || members.length === 0 ? (
                                <div className="p-10 text-center text-sm text-slate-400">Belum ada anggota tercatat.</div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0">
                                        <TableRow>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Peran</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                                            {initials(m.username)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-sm truncate">{m.username}</p>
                                                            <p className="text-xs text-slate-400 truncate">{m.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {isManager ? (
                                                        <Select
                                                            value={m.role}
                                                            onValueChange={(role) => updateMutation.mutate({ idUser: m.idUser, role: role as ProjectMemberRole })}
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            <SelectTrigger className="h-8 w-[130px]">
                                                                <Badge variant="outline" className={`${ROLE_BADGE_CLASSES[m.role]} border-none font-semibold`}>
                                                                    {m.role === 'MANAGER' && <ShieldCheck className="h-3 w-3 mr-1" />}
                                                                    {m.role}
                                                                </Badge>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {MEMBER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Badge variant="outline" className={`${ROLE_BADGE_CLASSES[m.role]} border-none font-semibold`}>
                                                            {m.role === 'MANAGER' && <ShieldCheck className="h-3 w-3 mr-1" />}
                                                            {m.role}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isManager && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-destructive"
                                                            onClick={() => setMemberToRemove(m)}
                                                            aria-label={`Keluarkan ${m.username} dari proyek`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!memberToRemove} onOpenChange={(o) => !o && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Keluarkan Anggota?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {memberToRemove?.username} akan kehilangan akses ke proyek "{project?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (memberToRemove) removeMutation.mutate(memberToRemove.idUser);
                                setMemberToRemove(null);
                            }}
                        >
                            Keluarkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ProjectMembersDialog;
