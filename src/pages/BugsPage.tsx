// src/pages/BugsPage.tsx
//
// Daftar Bug/Issue per Project: status (10-state lifecycle) dan assignee bisa diubah langsung
// dari dropdown di tabel (bukan lewat dialog terpisah) untuk mempercepat triase sehari-hari.
// Dropdown status hanya menampilkan transisi yang VALID dari status saat ini (lihat lib/bugStatus)
// — backend tetap menegakkan validasi yang sama sebagai pertahanan lapis kedua.
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bug as BugIcon, Loader2, Frown, ArrowLeft, PlusCircle, Pencil, Trash, ClipboardList } from 'lucide-react';

import { useProjectDetail } from '@/hooks/useProjects';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useBugsByProject, useUpdateBugStatus, useAssignBug, useDeleteBug } from '@/hooks/useBugs';
import { useAuth } from '@/contexts/AuthContext';
import { getBugStatusBadgeClass, getSeverityBadgeClass, getAllowedNextStatuses } from '@/lib/bugStatus';
import { formatDate } from '@/lib/utils';
import type { Bug, BugStatus } from '@/types/bug';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BugFormDialog from '@/components/bug/BugFormDialog';

const BUG_MANAGE_ROLES = ['ADMIN', 'TESTER', 'DEVELOPER'] as const;
const UNASSIGNED_VALUE = '__unassigned__';

const BugsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const canManage = hasRole([...BUG_MANAGE_ROLES]);

    const { projectId: projectIdStr } = useParams<{ projectId: string }>();
    const projectId = projectIdStr ? parseInt(projectIdStr) : -1;
    const isValidId = projectId > 0 && !isNaN(projectId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBug, setEditingBug] = useState<Bug | null>(null);
    const [bugToDelete, setBugToDelete] = useState<Bug | null>(null);

    const { data: projectDetail, isLoading: isLoadingProject } = useProjectDetail(isValidId ? projectId : -1);
    const { data: bugsPage, isLoading: isLoadingBugs, isError } = useBugsByProject(isValidId ? projectId : undefined, { size: 50 });
    const { data: members } = useProjectMembers(isValidId ? projectId : undefined);

    const updateStatusMutation = useUpdateBugStatus();
    const assignMutation = useAssignBug();
    const deleteMutation = useDeleteBug();

    const bugs = bugsPage?.content ?? [];

    const handleOpenCreate = () => { setEditingBug(null); setIsFormOpen(true); };
    const handleOpenEdit = (bug: Bug) => { setEditingBug(bug); setIsFormOpen(true); };

    const handleStatusChange = (bug: Bug, newStatus: string) => {
        updateStatusMutation.mutate({ bugId: bug.id, status: newStatus as BugStatus, projectId: bug.projectId });
    };

    const handleAssigneeChange = (bug: Bug, value: string) => {
        assignMutation.mutate({
            bugId: bug.id,
            assignedToUserId: value === UNASSIGNED_VALUE ? null : parseInt(value),
            projectId: bug.projectId,
        });
    };

    const handleConfirmDelete = () => {
        if (!bugToDelete) return;
        deleteMutation.mutate({ bugId: bugToDelete.id, projectId: bugToDelete.projectId }, {
            onSuccess: () => setBugToDelete(null),
        });
    };

    if (!isValidId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-destructive">
                <Frown className="h-12 w-12 mb-4" />
                <p className="text-xl font-bold">{t('bugs.invalidProjectId')}</p>
                <Button variant="link" onClick={() => navigate('/projects')}>{t('common.back')}</Button>
            </div>
        );
    }

    if (isLoadingProject || isLoadingBugs) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">{t('bugs.loading')}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-destructive">
                <Frown className="h-12 w-12 mb-4" />
                <p className="text-xl font-bold">{t('bugs.loadError')}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BugIcon className="h-6 w-6 text-primary" /> {t('bugs.titlePrefix')}{projectDetail?.name || projectId}
                        </CardTitle>
                        <CardDescription>{t('bugs.subtitle', { count: bugsPage?.totalElements ?? 0 })}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/features`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
                    </Button>
                </CardHeader>
            </Card>

            {canManage && (
                <div className="flex justify-end">
                    <Button onClick={handleOpenCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('bugs.reportBug')}
                    </Button>
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    {bugs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('bugs.table.title')}</TableHead>
                                    <TableHead>{t('bugs.table.severity')}</TableHead>
                                    <TableHead className="min-w-[220px]">{t('bugs.table.status')}</TableHead>
                                    <TableHead className="min-w-[160px]">{t('bugs.table.assignee')}</TableHead>
                                    <TableHead>{t('bugs.table.reportedBy')}</TableHead>
                                    <TableHead>{t('bugs.table.createdAt')}</TableHead>
                                    {canManage && <TableHead className="text-right">{t('bugs.table.actions')}</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bugs.map((bug) => {
                                    const allowedNext = getAllowedNextStatuses(bug.status);
                                    return (
                                        <TableRow key={bug.id}>
                                            <TableCell className="max-w-[240px]">
                                                <p className="font-medium truncate">{bug.title}</p>
                                                {bug.testCaseName && (
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                                        <ClipboardList className="h-3 w-3 shrink-0" /> {bug.testCaseName}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityBadgeClass(bug.severity)}>{bug.severity}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {canManage ? (
                                                    <Select value={bug.status} onValueChange={(v) => handleStatusChange(bug, v)} disabled={updateStatusMutation.isPending}>
                                                        <SelectTrigger className="h-8 w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={bug.status}>{bug.status}</SelectItem>
                                                            {allowedNext.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge className={getBugStatusBadgeClass(bug.status)}>{bug.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {canManage ? (
                                                    <Select
                                                        value={bug.assignedToId ? String(bug.assignedToId) : UNASSIGNED_VALUE}
                                                        onValueChange={(v) => handleAssigneeChange(bug, v)}
                                                        disabled={assignMutation.isPending}
                                                    >
                                                        <SelectTrigger className="h-8 w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={UNASSIGNED_VALUE}>{t('bugs.form.unassigned')}</SelectItem>
                                                            {members?.map((m) => (
                                                                <SelectItem key={m.idUser} value={String(m.idUser)}>{m.username}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-sm">{bug.assignedToUsername || '-'}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">{bug.reportedByUsername}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formatDate(bug.createdAt, true)}</TableCell>
                                            {canManage && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(bug)} aria-label={`${t('common.edit')}: ${bug.title}`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setBugToDelete(bug)} aria-label={`${t('common.delete')}: ${bug.title}`}>
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <BugIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground mb-4">{t('bugs.emptyNoData')}</p>
                            {canManage && <Button onClick={handleOpenCreate}>{t('bugs.reportFirst')}</Button>}
                        </div>
                    )}
                </CardContent>
            </Card>

            <BugFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} initialData={editingBug} projectId={projectId} />

            <AlertDialog open={!!bugToDelete} onOpenChange={(open) => !open && setBugToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('bugs.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('bugs.deleteConfirmDescription', { title: bugToDelete?.title })}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BugsPage;
