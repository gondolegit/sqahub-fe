import React, { useState, useEffect } from 'react';
import { Loader2, Zap, AlertTriangle, ListFilter, Search } from 'lucide-react';

// Import Hooks & Types
import { useProjects } from '@/hooks/useProjects';
import { useTestSuitesByProject } from '@/hooks/useTestSuites';

// Import UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Import Komponen
import TestSuiteFormDialog from '@/components/testsuite/TestSuiteFormDialog';
import TestSuitesTable from '@/components/testsuite/TestSuitesTable'; 

const TestSuitesPage: React.FC = () => {
    // 1. States
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // 2. Data Fetching
    const { data: projects, isLoading: isLoadingProjects } = useProjects();
    
    const { 
        data: testSuites, 
        isLoading: isLoadingSuites, 
        isError: isErrorSuites 
    } = useTestSuitesByProject(selectedProjectId || -1);

    // 3. Effects
    // Menggunakan useEffect untuk side-effect setting default project
    useEffect(() => {
        if (!selectedProjectId && projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // 4. Logika Filter Search (Client-side)
    const filteredTestSuites = React.useMemo(() => {
        if (!testSuites) return [];
        if (!searchQuery) return testSuites;
        
        return testSuites.filter(suite =>
            suite.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [testSuites, searchQuery]);
    
    const handleProjectChange = (projectIdStr: string) => {
        setSelectedProjectId(parseInt(projectIdStr));
        setSearchQuery(""); // Reset search saat ganti project
    };
    
    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <Zap className="h-7 w-7 mr-3 text-primary" /> Riwayat Test Suites
            </h1>
            
            <Card className="shadow-lg border-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center">
                        <ListFilter className="h-5 w-5 mr-2 text-muted-foreground" /> Filter & Aksi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        {/* Pilih Project */}
                        <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Proyek</label>
                            <Select 
                                onValueChange={handleProjectChange} 
                                value={selectedProjectId ? String(selectedProjectId) : undefined}
                                disabled={isLoadingProjects}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder={isLoadingProjects ? "Memuat..." : "Pilih Proyek"} />
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

                        {/* Search Input */}
                        <div className="w-full md:flex-1 space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Cari Nama Run</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Ketik nama test suite..." 
                                    className="pl-10 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {/* Tombol New Run */}
                        <div className="w-full md:w-auto">
                            <Button 
                                onClick={() => setIsFormDialogOpen(true)} 
                                disabled={!selectedProjectId}
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-md"
                            >
                                <Zap className="h-4 w-4 mr-2 fill-current" /> New Run Test
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bagian Tabel Riwayat */}
            <Card className="shadow-md border-none overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="text-lg">
                        Test Runs: <span className="text-primary">{projects?.find(p => p.id === selectedProjectId)?.name || "Pilih Proyek"}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0"> {/* P-0 agar tabel menempel ke pinggir card */}
                    {isErrorSuites && (
                        <div className="p-8 text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2" /> 
                            Gagal memuat data Test Suites.
                        </div>
                    )}

                    {isLoadingSuites ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">Memuat riwayat pengujian...</p>
                        </div>
                    ) : (
                        <TestSuitesTable 
                            data={filteredTestSuites} 
                            projectId={selectedProjectId!} 
                            isLoading={false} 
                        /> 
                    )}
                </CardContent>
            </Card>
            
            {/* Dialog Run Baru */}
            <TestSuiteFormDialog 
                open={isFormDialogOpen} 
                onOpenChange={setIsFormDialogOpen} 
                initialProjectId={selectedProjectId} 
            />
        </div>
    );
};

export default TestSuitesPage;