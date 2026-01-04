// src/components/project/ProjectList.tsx
import React, { useState } from 'react';
// Menggunakan 'import type' untuk tipe demi konsistensi TypeScript
import type { Project } from '@/types'; 
// Import hook nilai
import { useProjects, useDeleteProject } from '@/hooks/useProjects'; 

// Import komponen UI yang diperlukan
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import ProjectFormDialog from './ProjectFormDialog';
import { toast } from 'sonner';

const ProjectList: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Menggunakan hook READ (tanpa page/size karena API mengembalikan array penuh)
    const { data, isLoading, isError, error } = useProjects(); 
    const { mutate: deleteMutate, isPending: isDeleting } = useDeleteProject(); 

    // --- Aksi Form Dialog ---
    const handleAddProject = () => {
        setSelectedProject(null); // Mode Create
        setIsFormOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project); // Mode Edit
        setIsFormOpen(true);
    };

    // --- Aksi Delete ---
    const handleDeleteProject = (projectId: number, projectName: string) => {
        // PERBAIKAN: Menggunakan Sonner untuk konfirmasi delete
        toast.warning(`Apakah Anda yakin ingin menghapus project '${projectName}'?`, {
            action: {
                label: "Hapus",
                onClick: () => {
                    deleteMutate(projectId, {
                        onSuccess: () => {
                            toast.success("Berhasil Dihapus", { description: `Project '${projectName}' telah dihapus.` });
                        },
                        onError: () => {
                            toast.error("Gagal Hapus", { description: "Terjadi kesalahan saat menghapus project." });
                        }
                    });
                }
            },
            cancel: {
                label: "Batal",
                onClick: () => toast.info("Penghapusan dibatalkan.")
            },
            duration: 5000, // Beri waktu lebih lama untuk konfirmasi
        });
    };

    // --- Render Content ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Memuat daftar proyek...</p>
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500 p-4 border border-red-300 rounded">Gagal memuat data: {error.message}</div>;
    }

    // PERBAIKAN 1: Mengakses data langsung dari 'data' karena API mengembalikan array
    const projects: Project[] = data || []; 

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Daftar Project ({projects.length})</h2>
                <Button onClick={handleAddProject} className="gap-2" disabled={isDeleting}>
                    <Plus className="h-4 w-4" />
                    Tambah Project Baru
                </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead className="w-[200px]">Nama Project</TableHead>
                            <TableHead className="hidden md:table-cell">Tipe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right w-[120px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.id}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{project.type}</TableCell>
                                    <TableCell>
                                        {/* PERBAIKAN 2: Menggunakan toLowerCase() untuk mencocokkan status API */}
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${project.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 
                                              project.status.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                              'bg-yellow-100 text-yellow-800'}`
                                        }>
                                            {/* Menampilkan status dengan huruf kapital untuk UI */}
                                            {project.status.toUpperCase()} 
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end space-x-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleEditProject(project)}
                                            disabled={isDeleting}
                                        >
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDeleteProject(project.id, project.name)}
                                            className="text-red-500 hover:bg-red-50"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    Belum ada project yang ditambahkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Form (Create/Edit) */}
            <ProjectFormDialog 
                open={isFormOpen} 
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setSelectedProject(null);
                }}
                initialData={selectedProject}
            />
        </div>
    );
};

export default ProjectList;