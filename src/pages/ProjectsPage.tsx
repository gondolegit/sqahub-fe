import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutGrid, List, MoreVertical, 
  ExternalLink, Pencil, Trash2, FolderPlus 
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

// Custom Components & Hooks
import ProjectFormDialog from '@/components/project/ProjectFormDialog';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import type { Project } from '@/types/index';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects, isLoading, isError } = useProjects();
  const deleteMutation = useDeleteProject();

  // Optimized Search Logic (ISO-standard: Responsiveness)
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = searchQuery.toLowerCase();
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Project Hub</h1>
          <p className="text-slate-500">Kelola dan pantau seluruh sistem otomasi testing Anda.</p>
        </div>
        <Button onClick={() => handleAction(null)} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Proyek Baru
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari proyek..." 
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <LoadingGrid />
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={() => handleAction(project)}
              onDelete={() => confirmDelete(project)}
              onView={() => navigate(`/projects/${project.id}/features`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => handleAction(null)} isSearch={!!searchQuery} />
      )}

      <ProjectFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={selectedProject} 
      />
    </div>
  );
};

// --- SUB-COMPONENTS (Clean Code: Atomic Design) ---

const ProjectCard = ({ project, onEdit, onDelete, onView }: any) => (
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="flex-grow py-4">
      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
        {project.description || "Tidak ada deskripsi tersedia."}
      </p>
    </CardContent>
    <CardFooter className="border-t bg-slate-50/50 p-4 flex justify-between items-center">
      <StatusBadge status={project.status} />
      <Button size="sm" variant="ghost" onClick={onView} className="text-primary hover:text-primary hover:bg-primary/10">
        Features <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    </CardFooter>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    suspended: "bg-amber-100 text-amber-700 border-amber-200",
    archived: "bg-slate-100 text-slate-700 border-slate-200",
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

const EmptyState = ({ onAdd, isSearch }: any) => (
  <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-slate-50">
    <FolderPlus className="h-12 w-12 text-slate-300 mb-4" />
    <h3 className="text-lg font-medium">{isSearch ? "Hasil tidak ditemukan" : "Belum ada proyek"}</h3>
    <p className="text-slate-500 mb-6 text-center max-w-xs">
      {isSearch ? "Coba gunakan kata kunci lain." : "Mulai dengan membuat proyek pertama Anda sekarang."}
    </p>
    {!isSearch && <Button onClick={onAdd}>Buat Proyek</Button>}
  </div>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100 mt-10">
    Gagal memuat data. Periksa koneksi API Anda.
  </div>
);

export default ProjectsPage;