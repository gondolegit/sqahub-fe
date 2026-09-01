// src/hooks/useBugs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import API from '@/utils/api';
import type { Bug, BugRequest, UpdateBugParams, BugStatus } from '@/types/bug';
import type { Page } from '@/types/index';

const BUG_QUERY_KEY = 'bugs';

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

export interface BugFilters {
    status?: BugStatus;
    severity?: string;
    assignedToUserId?: number;
    page?: number;
    size?: number;
}

// GET /bugs/project/{projectId} — [paginated], filter opsional (status/severity/assignee)
export const useBugsByProject = (projectId: number | undefined, filters: BugFilters = {}) => {
    const { status, severity, assignedToUserId, page = 0, size = 20 } = filters;
    return useQuery<Page<Bug>, ApiError>({
        queryKey: [BUG_QUERY_KEY, 'project', projectId, { status, severity, assignedToUserId, page, size }],
        queryFn: async () => {
            const { data } = await API.get(`/bugs/project/${projectId}`, {
                params: { status, severity, assignedToUserId, page, size, sort: 'createdAt,desc' },
            });
            return data;
        },
        enabled: !!projectId && projectId > 0,
        placeholderData: (previousData) => previousData,
    });
};

// POST /bugs
export const useCreateBug = () => {
    const queryClient = useQueryClient();
    return useMutation<Bug, ApiError, BugRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.post('/bugs', payload);
            return data;
        },
        onSuccess: (newBug) => {
            toast.success("Bug Dilaporkan", { description: `'${newBug.title}' berhasil ditambahkan.` });
            queryClient.invalidateQueries({ queryKey: [BUG_QUERY_KEY, 'project', newBug.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Melaporkan Bug", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};

// PUT /bugs/{id}
export const useUpdateBug = () => {
    const queryClient = useQueryClient();
    return useMutation<Bug, ApiError, UpdateBugParams>({
        mutationFn: async ({ bugId, ...payload }) => {
            const { data } = await API.put(`/bugs/${bugId}`, payload);
            return data;
        },
        onSuccess: (updatedBug) => {
            toast.success("Bug Diperbarui", { description: `'${updatedBug.title}' berhasil diubah.` });
            queryClient.invalidateQueries({ queryKey: [BUG_QUERY_KEY, 'project', updatedBug.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Memperbarui Bug", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};

interface UpdateStatusParams {
    bugId: number;
    status: BugStatus;
    projectId: number;
}

// PUT /bugs/{id}/status
export const useUpdateBugStatus = () => {
    const queryClient = useQueryClient();
    return useMutation<Bug, ApiError, UpdateStatusParams>({
        mutationFn: async ({ bugId, status }) => {
            const { data } = await API.put(`/bugs/${bugId}/status`, { status });
            return data;
        },
        onSuccess: (updatedBug) => {
            toast.success("Status Bug Diperbarui", { description: `Status berubah menjadi ${updatedBug.status}.` });
            queryClient.invalidateQueries({ queryKey: [BUG_QUERY_KEY, 'project', updatedBug.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Mengubah Status", { description: getErrorMessage(error, "Transisi status tidak valid.") });
        },
    });
};

interface AssignBugParams {
    bugId: number;
    assignedToUserId: number | null;
    projectId: number;
}

// PUT /bugs/{id}/assign
export const useAssignBug = () => {
    const queryClient = useQueryClient();
    return useMutation<Bug, ApiError, AssignBugParams>({
        mutationFn: async ({ bugId, assignedToUserId }) => {
            const { data } = await API.put(`/bugs/${bugId}/assign`, { assignedToUserId });
            return data;
        },
        onSuccess: (updatedBug) => {
            toast.success(updatedBug.assignedToUsername ? "Bug Ditugaskan" : "Penugasan Dilepas", {
                description: updatedBug.assignedToUsername
                    ? `Ditugaskan ke ${updatedBug.assignedToUsername}.`
                    : "Bug ini tidak lagi ditugaskan ke siapa pun.",
            });
            queryClient.invalidateQueries({ queryKey: [BUG_QUERY_KEY, 'project', updatedBug.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Menugaskan Bug", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};

interface DeleteBugParams {
    bugId: number;
    projectId: number;
}

// DELETE /bugs/{id}
export const useDeleteBug = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, DeleteBugParams>({
        mutationFn: async ({ bugId }) => {
            await API.delete(`/bugs/${bugId}`);
        },
        onSuccess: (_, variables) => {
            toast.success("Bug Dihapus");
            queryClient.invalidateQueries({ queryKey: [BUG_QUERY_KEY, 'project', variables.projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Menghapus Bug", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};
