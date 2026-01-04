import React, { useState, useMemo } from 'react';
import { Loader2, Zap, AlertTriangle, ListFilter } from 'lucide-react';

// Import Hooks & Types
import { useProjects } from '@/hooks/useProjects'; // Hook untuk mendapatkan daftar proyek
import { useTestSuitesByProject } from '@/hooks/useTestSuites'; // Hook baru/revisi untuk API: GET /testsuite/project/{projectId}

// Import UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import Komponen
import TestSuiteFormDialog from '@/components/testsuite/TestSuiteFormDialog';
import TestSuitesTable from '@/components/testsuite/TestSuitesTable'; 

const TestSuitesPage: React.FC = () => {
    // State untuk Proyek yang dipilih (default: tidak ada)
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
    // State untuk Dialog Run Baru
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

    // Fetch daftar Proyek
    const { data: projects, isLoading: isLoadingProjects, isError: isErrorProjects } = useProjects();
    
    // Fetch daftar Test Suites berdasarkan Proyek yang dipilih
    const { 
        data: testSuites, 
        isLoading: isLoadingSuites, 
        isError: isErrorSuites 
    } = useTestSuitesByProject(selectedProjectId || -1); // Hanya fetch jika Project ID valid

    // Set Project pertama sebagai default jika belum ada yang dipilih
    useMemo(() => {
        if (!selectedProjectId && projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);
    
    const handleProjectChange = (projectIdStr: string) => {
        setSelectedProjectId(parseInt(projectIdStr));
    };
    
    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <Zap className="h-7 w-7 mr-3 text-primary" /> Riwayat Test Suites
            </h1>
            
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-semibold flex items-center">
                        <ListFilter className="h-5 w-5 mr-2 text-gray-500" /> Filter & Aksi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        {/* Pilih Project List */}
                        <div className="w-1/3">
                            <label className="text-sm font-medium">Pilih Proyek:</label>
                            <Select 
                                onValueChange={handleProjectChange} 
                                value={selectedProjectId ? String(selectedProjectId) : undefined}
                                disabled={isLoadingProjects}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingProjects ? "Memuat Proyek..." : "Pilih Proyek"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects?.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Tombol New Run Test */}
                        <div className="w-2/3 flex justify-end">
                            <Button 
                                onClick={() => setIsFormDialogOpen(true)} 
                                disabled={!selectedProjectId}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Zap className="h-5 w-5 mr-2" /> New Run Test
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bagian Riwayat Test Suites */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>
                        Riwayat Test Runs: {projects?.find(p => p.id === selectedProjectId)?.name || "Pilih Proyek"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isErrorSuites && (
                        <div className="text-red-500 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> Gagal memuat data Test Suites.</div>
                    )}
                    {isLoadingSuites ? (
                        <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Memuat Riwayat...</div>
                    ) : (
                        // Menggunakan selectedProjectId! karena sudah divalidasi oleh enabled hook atau disabled button
                        <TestSuitesTable data={testSuites || []} projectId={selectedProjectId!} /> 
                    )}
                </CardContent>
            </Card>
            
            {/* Dialog Run Baru */}
            <TestSuiteFormDialog 
                open={isFormDialogOpen} 
                onOpenChange={setIsFormDialogOpen} 
                // 🚨 Properti ini sekarang valid asalkan TestSuiteFormDialogProps sudah diperbaiki.
                initialProjectId={selectedProjectId} 
            />
        </div>
    );
};

export default TestSuitesPage;