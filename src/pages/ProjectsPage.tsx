// src/pages/ProjectsPage.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Eye, Search } from 'lucide-react'; // Tambahkan Search icon
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'; // Menggunakan React Router DOM

// Import Komponen
import ProjectFormDialog from '@/components/project/ProjectFormDialog';
import { Input } from '@/components/ui/input'; // Import komponen Input

// Import Hooks dan Tipe
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import type { Project } from '@/types/index'; // Asumsi Project diimpor dari types/index

// Import komponen UI lainnya
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();

    // 1. STATE UNTUK UI
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [initialProjectData, setInitialProjectData] = useState<Project | null>(null);
    const [searchQuery, setSearchQuery] = useState(''); // State untuk searching

    // 2. HOOKS QUERY DAN MUTATION
    const { data: projects, isLoading, isError, error } = useProjects();
    const deleteMutation = useDeleteProject();

    // --- LOGIKA FILTERING ---
    const filteredProjects = projects?.filter(project => {
        const query = searchQuery.toLowerCase();
        return (
            project.name.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.status.toLowerCase().includes(query)
        );
    }) || [];

    // --- HANDLERS ---
    const handleViewFeatures = (projectId: number) => {
        navigate(`/projects/${projectId}/features`);
    };

    const handleOpenCreateDialog = () => {
        setInitialProjectData(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (project: Project) => {
        setInitialProjectData(project);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setInitialProjectData(null);
        }
    };

    const handleDeleteProject = (projectId: number, projectName: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus project '${projectName}'?`)) {
            deleteMutation.mutate(projectId, {
                onSuccess: () => {
                    toast.success("Project Dihapus", { description: `Project '${projectName}' berhasil dihapus.` });
                },
                onError: (err: any) => {
                    toast.error("Gagal Hapus Project", { description: err.message || "Terjadi kesalahan saat menghapus project." });
                }
            });
        }
    };


    // --- RENDERING KONTEN ---
    if (isLoading) {
        return <div className="p-8 text-center"><Spinner /> Loading Projects...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Error: {error?.message || "Gagal memuat daftar proyek."}</div>;
    }


    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Daftar Proyek</h1>
                <Button onClick={handleOpenCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Project Baru
                </Button>
            </header>
            
            {/* AREA SEARCHING */}
            <div className="mb-8 relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Cari Proyek berdasarkan Nama, Deskripsi, atau Status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                        >
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-xl font-extrabold truncate">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="text-xs text-gray-400">
                                    ID: {project.id}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 p-4 flex-grow">
                                {/* Deskripsi Proyek */}
                                <p className="text-sm text-gray-700 line-clamp-3 min-h-[60px]">
                                    {project.description || '*Tidak ada deskripsi proyek.*'}
                                </p>

                                {/* Badge Status */}
                                <div className="flex justify-start">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold leading-none rounded-full 
                                        ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                          project.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-500'}`}>
                                        {project.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Detail Tambahan */}
                                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t mt-3">
                                    <p>
                                        Tipe: <span className="font-medium text-gray-700">{project.type}</span>
                                    </p>
                                    <p>
                                        Dibuat oleh: <span className="font-medium text-gray-700">{project.createdByUsername}</span>
                                    </p>
                                    <p>
                                        Dibuat pada: {new Date(project.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">

                                    <Button size="sm" onClick={() => handleViewFeatures(project.id)} className="flex-shrink-0">
                                        <Eye className="mr-2 h-4 w-4" /> Features
                                    </Button>

                                    <Button variant="outline" size="sm"
                                        onClick={() => handleOpenEditDialog(project)} className="flex-shrink-0">
                                        Edit
                                    </Button>

                                    <Button variant="destructive" size="sm"
                                        onClick={() => handleDeleteProject(project.id, project.name)}
                                        disabled={deleteMutation.isPending && deleteMutation.variables === project.id}
                                        className="flex-shrink-0">
                                        {deleteMutation.isPending && deleteMutation.variables === project.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Hapus'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="p-10 text-center border rounded-lg bg-gray-50">
                    <p className="text-lg text-gray-500">
                         {searchQuery ? `Tidak ada proyek yang cocok dengan kata kunci: "${searchQuery}"` : "Belum ada proyek yang dibuat."}
                    </p>
                    {!searchQuery && (
                        <Button onClick={handleOpenCreateDialog} className="mt-4">
                            Buat Project Pertama
                        </Button>
                    )}
                </div>
            )}

            <ProjectFormDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                initialData={initialProjectData}
            />
        </div>
    );
};

export default ProjectsPage;