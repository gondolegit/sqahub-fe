import React, { useState } from 'react';
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

// Import Hooks yang Dibutuhkan
import { useFeatureDetail } from '@/hooks/useFeatures'; 
import { 
    useTestCases, 
    useDeleteTestCase, 
    type TestCase, 
    type DeleteTestCaseParams 
} from '@/hooks/useTestCases'; 
import TestCaseFormDialog from '@/components/testcase/TestCaseFormDialog';

// 🚨 DEFINISI INTERFACE DENGAN MODE (Sama seperti di TestCaseFormDialog)
interface TestCaseWithMode extends TestCase {
    mode?: 'view' | 'edit';
}

const TestCasesPage: React.FC = () => {
    const navigate = useNavigate();
    const { projectId: projectIdStr, featureId: featureIdStr } = 
        useParams<{ projectId: string; featureId: string }>();

    const projectId = projectIdStr ? parseInt(projectIdStr) : -1;
    const featureId = featureIdStr ? parseInt(featureIdStr) : -1;
    
    const isValidFeatureId = featureId > 0 && !isNaN(featureId);

    // States untuk UI dan Dialog CRUD
    const [searchQuery, setSearchQuery] = useState('');
    const [isTcDialogOpen, setIsTcDialogOpen] = useState(false);
    // Menggunakan TestCaseWithMode untuk menampung data dan mode
    const [initialTcData, setInitialTcData] = useState<TestCaseWithMode | null>(null);

    // STATE BARU: Untuk konfirmasi penghapusan
    const [caseToDelete, setCaseToDelete] = useState<{ id: number; name: string } | null>(null); 

    // Data Hooks
    const { data: featureDetail, isLoading: isLoadingFeature } = 
        useFeatureDetail(isValidFeatureId ? featureId : -1);
    
    const { data: testCases, isLoading: isLoadingTestCases, isError: isErrorTestCases } = 
        useTestCases(isValidFeatureId ? featureId : -1); 
    
    const deleteMutation = useDeleteTestCase();

    const featureName = featureDetail?.name || `Fitur ID: ${featureId}`;
    const projectName = featureDetail?.projectName || `Proyek ID: ${projectId}`;
    
    // --- LOGIKA FILTERING & SEARCHING ---
    const filteredTestCases = testCases?.filter(tc => {
        const query = searchQuery.toLowerCase();
        return (
            (tc.name || '').toLowerCase().includes(query) ||
            (tc.description || '').toLowerCase().includes(query) ||
            (tc.type || '').toLowerCase().includes(query) ||
            (tc.tag || '').toLowerCase().includes(query)
        );
    }) || [];

    // --- HANDLERS DIALOG CRUD ---

    const handleOpenEditDialog = (tc: TestCase) => {
        setInitialTcData({ ...tc, mode: 'edit' });
        setIsTcDialogOpen(true);
    };

    // 🚨 HANDLER BARU: View Detail
    const handleViewDetail = (tc: TestCase) => {
        setInitialTcData({ ...tc, mode: 'view' }); // Set mode ke 'view'
        setIsTcDialogOpen(true);
    };

    const handleOpenCreateDialog = () => {
        setInitialTcData(null); // Mode Create
        setIsTcDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsTcDialogOpen(open);
        if (!open) {
            setInitialTcData(null); // Reset data setelah ditutup
        }
    };
    
    // 🚨 HANDLER MODIFIKASI: Mempersiapkan penghapusan (Memicu AlertDialog)
    const handlePrepareDelete = (tc: TestCase) => {
        setCaseToDelete({ id: tc.id, name: tc.name });
    };

    // 🚨 HANDLER MODIFIKASI: Eksekusi Penghapusan (Dipanggil dari AlertDialog)
    const handleDeleteTestCase = () => {
        if (!caseToDelete) return;

        const { id: testCaseId, name: tcName } = caseToDelete;

        const params: DeleteTestCaseParams = { testCaseId, idFeature: featureId };
        
        deleteMutation.mutate(params, {
            onSuccess: () => {
                toast.success("Test Case Dihapus", { description: `TC '${tcName}' berhasil dihapus.` });
                setCaseToDelete(null); // Tutup dialog konfirmasi
            },
            onError: (err: any) => {
                toast.error("Gagal Hapus Test Case", { description: err.message || "Terjadi kesalahan saat menghapus TC." });
                setCaseToDelete(null); // Tutup dialog
            }
        });
    };
    

    // --- RENDER KONDISIONAL ---
    if (!isValidFeatureId) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
                <Frown className="h-10 w-10 mb-2" />
                <p className="text-lg font-semibold">Feature ID tidak valid.</p>
            </div>
        );
    }
    
    if (isLoadingFeature || isLoadingTestCases) {
         return (
             <div className="flex justify-center p-8">
                 <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                 <p className="text-gray-500 ml-2">Memuat fitur dan test case...</p>
             </div>
         );
     }

    if (isErrorTestCases) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
                <Frown className="h-10 w-10 mb-2" />
                <p className="text-lg font-semibold">Gagal memuat Test Case.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-bold">
                                Test Case untuk: {featureName} 
                            </CardTitle>
                            <CardDescription className="text-md mt-1">
                                Proyek: {projectName} | Total TC: {testCases?.length || 0}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/projects/${projectId}/features`)}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Fitur
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Aksi & Searching */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari Test Case (Nama, Deskripsi, Tipe, Tag)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleOpenCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Test Case Baru
                </Button>
            </div>

            {/* Tabel Konten */}
            <Card>
                <CardContent className="p-0">
                    {filteredTestCases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">ID</TableHead>
                                        <TableHead>Nama Test Case</TableHead>
                                        <TableHead className="w-[100px]">Tipe</TableHead>
                                        <TableHead className="w-[150px]">Tag</TableHead>
                                        <TableHead className="w-[100px]">Dibuat Oleh</TableHead>
                                        <TableHead className="w-[150px] text-right">Aksi</TableHead> 
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTestCases.map((tc) => (
                                        <TableRow key={tc.id}>
                                            <TableCell className="font-medium">{tc.id}</TableCell>
                                            <TableCell className="font-medium">{tc.name}</TableCell>
                                            <TableCell>{tc.type}</TableCell>
                                            <TableCell className="text-sm text-gray-500">{tc.tag || '-'}</TableCell>
                                            <TableCell>{tc.createdByUsername}</TableCell>
                                            
                                            {/* Kolom Aksi */}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-1">
                                                    {/* 🚨 View Detail (Memanggil dialog dengan mode 'view') */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleViewDetail(tc)}
                                                        title="Lihat Detail"
                                                    >
                                                        <ClipboardList className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    {/* Edit */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenEditDialog(tc)}
                                                        title="Edit Test Case"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {/* 🚨 Hapus (Memanggil handler persiapan delete) */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handlePrepareDelete(tc)}
                                                        disabled={deleteMutation.isPending && deleteMutation.variables?.testCaseId === tc.id}
                                                        title="Hapus Test Case"
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables?.testCaseId === tc.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-10 text-center border-none rounded-lg bg-white">
                            <p className="text-lg text-gray-500">
                                {searchQuery ? `Tidak ada Test Case yang cocok dengan kata kunci: "${searchQuery}"` : "Fitur ini belum memiliki Test Case."}
                            </p>
                            {!searchQuery && (
                                <Button onClick={handleOpenCreateDialog} className="mt-4">
                                    Tambahkan Test Case Baru
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* TestCase Form Dialog untuk Create/Edit/View */}
            <TestCaseFormDialog 
                open={isTcDialogOpen}
                onOpenChange={handleDialogClose}
                initialData={initialTcData} // Mengirim data dan mode
                idFeature={featureId} 
                idProject={projectId} 
            />

            {/* 🚨 ALERT DIALOG UNTUK KONFIRMASI PENGHAPUSAN 🚨 */}
            <AlertDialog 
                open={!!caseToDelete} 
                onOpenChange={(open) => {
                    if (!open) setCaseToDelete(null); 
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan Test Case</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus Test Case 
                            "{caseToDelete?.name}"? 
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            disabled={deleteMutation.isPending}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteTestCase} 
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Hapus Permanen'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
        </div>
    );
};

export default TestCasesPage;