import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, MoreVertical,
  ExternalLink, Pencil, Trash2, FolderPlus, Users
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

// Custom Components & Hooks
import ProjectFormDialog from '@/components/project/ProjectFormDialog';
import ProjectMembersDialog from '@/components/project/ProjectMembersDialog';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectStatus } from '@/types/index';

const PAGE_SIZE = 12;
// Sesuai matriks izin backend: create/edit/delete Project butuh role global ADMIN atau TESTER.
const PROJECT_MANAGE_ROLES = ['ADMIN', 'TESTER'] as const;

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManageProjects = hasRole([...PROJECT_MANAGE_ROLES]);

  // State Management
  const [page, setPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [membersProject, setMembersProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, isPlaceholderData } = useProjects({ page, size: PAGE_SIZE });
  const deleteMutation = useDeleteProject();

  const projects = useMemo(() => data?.content ?? [], [data]);

  // Pencarian berjalan di halaman yang sedang dimuat — backend GET /project belum menyediakan
  // parameter pencarian per nama, jadi ini murni penyaringan sisi klien untuk data yang sudah ada.
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Handlers
  const handleAction = (project: Project | null) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const confirmDelete = (project: Project) => {
    // Elegant toast replacement for window.confirm
    toast("Hapus Proyek?", {
      description: `Data '${project.name}' akan dihapus permanen.`,
      action: {
        label: "Hapus",
        onClick: () => deleteMutation.mutate(project.id, {
          onSuccess: () => toast.success("Terhapus"),
          onError: (err) => toast.error("Gagal", { description: err.message })
        }),
      },
    });
  };

  if (isError) return <ErrorState />;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Hub</h1>
          <p className="text-muted-foreground">Kelola dan pantau seluruh sistem otomasi testing Anda.</p>
        </div>
        {canManageProjects && (
          <Button onClick={() => handleAction(null)} className="shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-2 h-4 w-4" /> Proyek Baru
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari proyek di halaman ini..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <LoadingGrid />
      ) : filteredProjects.length > 0 ? (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                canManage={canManageProjects}
                onEdit={() => handleAction(project)}
                onDelete={() => confirmDelete(project)}
                onView={() => navigate(`/projects/${project.id}/features`)}
                onManageMembers={() => setMembersProject(project)}
              />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <Pagination
              page={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.size}
              onPageChange={setPage}
            />
          )}
        </div>
      ) : (
        <EmptyState onAdd={canManageProjects ? () => handleAction(null) : undefined} isSearch={!!searchQuery} />
      )}

      <ProjectFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedProject}
      />

      <ProjectMembersDialog
        project={membersProject}
        open={!!membersProject}
        onOpenChange={(open) => !open && setMembersProject(null)}
      />
    </div>
  );
};

// --- SUB-COMPONENTS (Clean Code: Atomic Design) ---

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onManageMembers: () => void;
}

const ProjectCard = ({ project, canManage, onEdit, onDelete, onView, onManageMembers }: ProjectCardProps) => (
  <Card className="group hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden">
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
          {project.type}
        </Badge>
        <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
          {project.name}
        </h3>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Menu aksi untuk ${project.name}`}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onManageMembers}><Users className="mr-2 h-4 w-4" /> Kelola Tim</DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="flex-grow py-4">
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {project.description || "Tidak ada deskripsi tersedia."}
      </p>
    </CardContent>
    <CardFooter className="border-t bg-muted/50 p-4 flex justify-between items-center">
      <StatusBadge status={project.status} />
      <Button size="sm" variant="ghost" onClick={onView} className="text-primary hover:text-primary hover:bg-primary/10">
        Features <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    </CardFooter>
  </Card>
);

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const variants: Record<ProjectStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    completed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
    suspended: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    archived: "bg-muted text-muted-foreground border-border",
    maintenance: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
  };
  return (
    <Badge variant="outline" className={`${variants[status] || variants.archived} capitalize px-2 py-0`}>
      {status}
    </Badge>
  );
};

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
  </div>
);

const EmptyState = ({ onAdd, isSearch }: { onAdd?: () => void; isSearch: boolean }) => (
  <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
    <FolderPlus className="h-12 w-12 text-muted-foreground/40 mb-4" />
    <h3 className="text-lg font-medium">{isSearch ? "Hasil tidak ditemukan" : "Belum ada proyek"}</h3>
    <p className="text-muted-foreground mb-6 text-center max-w-xs">
      {isSearch ? "Coba gunakan kata kunci lain." : "Mulai dengan membuat proyek pertama Anda sekarang."}
    </p>
    {!isSearch && onAdd && <Button onClick={onAdd}>Buat Proyek</Button>}
  </div>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/30 mt-10">
    Gagal memuat data. Periksa koneksi API Anda.
  </div>
);

export default ProjectsPage;
