import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog'; 
import { Loader2, PlusCircle, Frown, ArrowLeft, Search, Pencil, Trash, ClipboardList } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { toast } from 'sonner';

// --- TYPES & HOOKS ---
import type { TestCase, DeleteTestCaseParams } from '@/types/testCase';
import { useFeatureDetail } from '@/hooks/useFeatures'; 
import { useTestCasesByFeature, useDeleteTestCase } from '@/hooks/useTestCases'; 
import TestCaseFormDialog from '@/components/testcase/TestCaseFormDialog';

// Interface diperluas untuk menangani UI mode
interface TestCaseWithMode extends TestCase {
    mode?: 'view' | 'edit';
}

const TestCasesPage: React.FC = () => {
    const navigate = useNavigate();
    const { projectId: projectIdStr, featureId: featureIdStr } = 
        useParams<{ projectId: string; featureId: string }>();

    const projectId = projectIdStr ? parseInt(projectIdStr) : -1;
    const featureId = featureIdStr ? parseInt(featureIdStr) : -1;
    const isValidId = featureId > 0 && !isNaN(featureId);

    // --- STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isTcDialogOpen, setIsTcDialogOpen] = useState(false);
    const [initialTcData, setInitialTcData] = useState<TestCaseWithMode | null>(null);
    const [caseToDelete, setCaseToDelete] = useState<{ id: number; name: string } | null>(null); 

    // --- DATA FETCHING ---
    const { data: featureDetail, isLoading: isLoadingFeature } = 
        useFeatureDetail(isValidId ? featureId : -1);
    
    const { 
        data: testCases, 
        isLoading: isLoadingTestCases, 
        isError: isErrorTestCases 
    } = useTestCasesByFeature(isValidId ? featureId : -1); 
    
    const deleteMutation = useDeleteTestCase();

    // --- LOGIKA FILTERING ---
    const filteredTestCases = useMemo(() => {
        if (!testCases) return [];
        const query = searchQuery.toLowerCase();
        return testCases.filter(tc => 
            tc.name?.toLowerCase().includes(query) ||
            tc.description?.toLowerCase().includes(query) ||
            tc.type?.toLowerCase().includes(query) ||
            tc.tag?.toLowerCase().includes(query)
        );
    }, [testCases, searchQuery]);

    // --- HANDLERS ---
    const handleOpenCreateDialog = () => {
        setInitialTcData(null);
        setIsTcDialogOpen(true);
    };

    const handleOpenEditDialog = (tc: TestCase) => {
        setInitialTcData({ ...tc, mode: 'edit' });
        setIsTcDialogOpen(true);
    };

    const handleViewDetail = (tc: TestCase) => {
        setInitialTcData({ ...tc, mode: 'view' });
        setIsTcDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsTcDialogOpen(open);
        if (!open) setInitialTcData(null);
    };
    
    const handleDeleteTestCase = () => {
        if (!caseToDelete) return;

        const params: DeleteTestCaseParams = { 
            testCaseId: caseToDelete.id, 
            idFeature: featureId 
        };
        
        deleteMutation.mutate(params, {
            onSuccess: () => {
                setCaseToDelete(null);
                toast.success("Berhasil", { description: "Test case telah dihapus." });
            },
            onError: (err: any) => {
                toast.error("Gagal", { description: err.message || "Gagal menghapus data." });
                setCaseToDelete(null);
            }
        });
    };
    
    // --- RENDER LOGIC ---
    if (!isValidId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-destructive">
                <Frown className="h-12 w-12 mb-4" />
                <p className="text-xl font-bold">Error: Feature ID tidak ditemukan.</p>
                <Button variant="link" onClick={() => navigate(-1)}>Kembali</Button>
            </div>
        );
    }
    
    if (isLoadingFeature || isLoadingTestCases) {
         return (
             <div className="flex flex-col items-center justify-center p-20 space-y-4">
                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
                 <p className="text-muted-foreground animate-pulse">Menyiapkan data test case...</p>
             </div>
         );
     }

    if (isErrorTestCases) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-destructive">
                <Frown className="h-12 w-12 mb-4" />
                <p className="text-xl font-bold">Gagal memuat data Test Case.</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>Coba Lagi</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header Section */}
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Test Cases: {featureDetail?.name || featureId} 
                        </CardTitle>
                        <CardDescription>
                            Proyek ID: {projectId} • Total: {testCases?.length || 0} items
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/features`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                </CardHeader>
            </Card>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari test case..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Baru
                </Button>
            </div>

            {/* Main Table */}
            <Card>
                <CardContent className="p-0">
                    {filteredTestCases.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead> 
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTestCases.map((tc) => (
                                    <TableRow key={tc.id}>
                                        <TableCell className="font-mono text-xs">{tc.id}</TableCell>
                                        <TableCell className="font-medium">{tc.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                {tc.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{tc.tag || '-'}</TableCell>
                                        <TableCell className="text-sm">{tc.createdByUsername}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewDetail(tc)} title="Detail">
                                                    <ClipboardList className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(tc)} title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setCaseToDelete({ id: tc.id, name: tc.name })}
                                                    disabled={deleteMutation.isPending && deleteMutation.variables?.testCaseId === tc.id}
                                                >
                                                    {deleteMutation.isPending && deleteMutation.variables?.testCaseId === tc.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash className="h-4 w-4 text-destructive" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : "Belum ada Test Case untuk fitur ini."}
                            </p>
                            {!searchQuery && <Button onClick={handleOpenCreateDialog}>Buat Test Case Pertama</Button>}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Form Dialog */}
            <TestCaseFormDialog 
                open={isTcDialogOpen}
                onOpenChange={handleDialogClose}
                initialData={initialTcData}
                idFeature={featureId} 
                idProject={projectId} 
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Test Case?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus <strong>{caseToDelete?.name}</strong>. Data yang dihapus tidak dapat dikembalikan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteTestCase} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TestCasesPage;