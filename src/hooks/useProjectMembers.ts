// src/hooks/useProjectMembers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import API from '@/utils/api';
import type { ProjectMember, ProjectMemberRequest } from '@/types/index';

const PROJECT_MEMBERS_QUERY_KEY = 'projectMembers';

type ApiError = AxiosError<{ message?: string }>;
const getErrorMessage = (error: ApiError, fallback: string): string =>
    error.response?.data?.message || error.message || fallback;

// GET /project/{projectId}/members — caller harus punya akses lihat ke proyek
export const useProjectMembers = (projectId: number | undefined) => {
    return useQuery<ProjectMember[], ApiError>({
        queryKey: [PROJECT_MEMBERS_QUERY_KEY, projectId],
        queryFn: async () => {
            const { data } = await API.get(`/project/${projectId}/members`);
            return data;
        },
        enabled: !!projectId && projectId > 0,
    });
};

// POST /project/{projectId}/members — caller harus OWNER/ADMIN proyek ini
export const useAddProjectMember = (projectId: number | undefined) => {
    const queryClient = useQueryClient();
    return useMutation<ProjectMember, ApiError, ProjectMemberRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.post(`/project/${projectId}/members`, payload);
            return data;
        },
        onSuccess: (member) => {
            toast.success("Anggota Ditambahkan", { description: `${member.username} kini menjadi ${member.role} di proyek ini.` });
            queryClient.invalidateQueries({ queryKey: [PROJECT_MEMBERS_QUERY_KEY, projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Menambah Anggota", { description: getErrorMessage(error, "Pastikan Anda OWNER/ADMIN proyek ini dan User ID valid.") });
        },
    });
};

// PUT /project/{projectId}/members/{userId} — caller harus OWNER/ADMIN proyek ini
export const useUpdateProjectMember = (projectId: number | undefined) => {
    const queryClient = useQueryClient();
    return useMutation<ProjectMember, ApiError, ProjectMemberRequest>({
        mutationFn: async (payload) => {
            const { data } = await API.put(`/project/${projectId}/members/${payload.idUser}`, payload);
            return data;
        },
        onSuccess: (member) => {
            toast.success("Peran Diperbarui", { description: `${member.username} sekarang berperan sebagai ${member.role}.` });
            queryClient.invalidateQueries({ queryKey: [PROJECT_MEMBERS_QUERY_KEY, projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Memperbarui Peran", { description: getErrorMessage(error, "Terjadi kesalahan saat memperbarui anggota.") });
        },
    });
};

// DELETE /project/{projectId}/members/{userId} — caller harus OWNER/ADMIN proyek ini
export const useRemoveProjectMember = (projectId: number | undefined) => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, number>({
        mutationFn: async (userId) => {
            await API.delete(`/project/${projectId}/members/${userId}`);
        },
        onSuccess: () => {
            toast.success("Anggota Dikeluarkan");
            queryClient.invalidateQueries({ queryKey: [PROJECT_MEMBERS_QUERY_KEY, projectId] });
        },
        onError: (error) => {
            toast.error("Gagal Mengeluarkan Anggota", { description: getErrorMessage(error, "Terjadi kesalahan.") });
        },
    });
};
