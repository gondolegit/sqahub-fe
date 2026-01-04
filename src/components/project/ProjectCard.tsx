// src/components/project/ProjectCard.tsx
import React from 'react';
import type { Project } from '@/types'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; 

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean; // Tambahkan prop untuk disable tombol saat delete sedang berjalan
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete, isDeleting }) => {
    
    // Fungsi bantu untuk menentukan warna badge Status
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            default: // suspended/pending/etc
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        }
    };

    return (
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border border-gray-200">
            {/* Header Card yang dapat diklik (Area navigasi) */}
            <div className="flex-grow cursor-pointer" onClick={onClick}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                        <Badge 
                            className={`${getStatusVariant(project.status)} text-xs font-semibold`}
                            variant="secondary"
                        >
                            {project.status.toUpperCase()}
                        </Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-2 mt-1">
                        {project.description || 'Tidak ada deskripsi proyek.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-4 text-xs text-gray-500 space-y-1">
                    <p><strong>ID:</strong> {project.id}</p>
                    <p><strong>Tipe:</strong> {project.type.toUpperCase()}</p>
                    <p><strong>Dibuat:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
                </CardContent>
            </div>

            {/* Footer dengan Aksi */}
            <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} disabled={isDeleting}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <div className="flex space-x-2">
                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" onClick={onClick} disabled={isDeleting}>
                        Fitur <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default ProjectCard;