// src/hooks/useProjects.ts (DIREVISI)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

// !!! PENTING: IMPOR SEMUA TIPE DARI SUMBER TUNGGAL (src/types/index)
import type { 
    ProjectStatus, 
    ProjectType, 
    Project, // Project type lengkap (termasuk createdBy, etc.)
    CreateProjectRequest, // Request body untuk Create
    UpdateProjectRequest, // Request body untuk Update
} from '@/types/index'; 
// Catatan: Asumsi tipe-tipe di atas sudah diexport di '@/types/index'

// --- DEFINISI TIPE LOKAL DIHAPUS (Hanya menggunakan impor) ---

// --- CONFIGURATION DASAR (Sama seperti sebelumnya) ---
const API_BASE_URL = 'http://localhost:8080/api/v1'; 
const PROJECT_QUERY_KEY = 'projects';
const getAuthHeaders = () => {
    // ... (logic token) ...
    const token = localStorage.getItem('authToken'); 
    // ...
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// --- HOOKS MUTATION (CREATE) ---

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    // Sekarang menggunakan CreateProjectRequest dari '@/types/index'
    const createProject = async (projectData: CreateProjectRequest): Promise<Project> => { 
        const response = await axios.post(`${API_BASE_URL}/project`, projectData, getAuthHeaders());
        return response.data;
    };

    // Tipe parameter input di sini adalah CreateProjectRequest
    return useMutation<Project, Error, CreateProjectRequest>({ 
        mutationFn: createProject,
        onSuccess: (newProject) => {
            toast.success("Project Baru Dibuat", { description: `Project '${newProject.name}' berhasil ditambahkan.` });
            queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] });
        },
        onError: (error) => {
            toast.error("Gagal Tambah Project", { description: error.message || "Terjadi kesalahan saat membuat project." });
        }
    });
};

// --- HOOKS MUTATION (UPDATE) ---

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    // Sekarang menggunakan UpdateProjectRequest dari '@/types/index'
    const updateProject = async (project: UpdateProjectRequest): Promise<Project> => { 
        const { id, ...dataToUpdate } = project;
        const response = await axios.put(`${API_BASE_URL}/project/${id}`, dataToUpdate, getAuthHeaders());
        return response.data;
    };

    // Tipe parameter input di sini adalah UpdateProjectRequest
    return useMutation<Project, Error, UpdateProjectRequest>({ 
        mutationFn: updateProject,
        onSuccess: (updatedProject) => {
            toast.success("Project Diperbarui", { description: `Project '${updatedProject.name}' berhasil diubah.` });
            queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['projectDetail', updatedProject.id] });
        },
        onError: (error) => {
            toast.error("Gagal Update Project", { description: error.message || "Terjadi kesalahan saat memperbarui project." });
        }
    });
};

// --- HOOKS QUERY (READ ALL & DETAIL) TETAP SAMA ---

export const useProjects = () => {
    // ... (logic fetchProjects)
    const fetchProjects = async (): Promise<Project[]> => {
        const response = await axios.get(`${API_BASE_URL}/project`, getAuthHeaders());
        return response.data;
    };

    return useQuery<Project[], Error>({
        queryKey: [PROJECT_QUERY_KEY],
        queryFn: fetchProjects,
    });
};

export const useProjectDetail = (projectId: number) => {
    // ... (logic fetchProjectDetail)
    const fetchProjectDetail = async (): Promise<Project> => {
        const response = await axios.get(`${API_BASE_URL}/project/${projectId}`, getAuthHeaders());
        return response.data;
    };

    return useQuery<Project, Error>({
        queryKey: ['projectDetail', projectId],
        queryFn: fetchProjectDetail,
        enabled: projectId > 0, 
    });
};

export const useDeleteProject = () => {
    // ... (logic deleteProject)
    const queryClient = useQueryClient();
    const deleteProject = async (projectId: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/project/${projectId}`, getAuthHeaders());
    };
    return useMutation<void, Error, number>({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] });
        },
        onError: (error) => {
            console.error("Error deleting project:", error);
        }
    });
};