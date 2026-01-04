import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    useFeatures,
    useDeleteFeature,
    type Feature,
    type DeleteFeatureParams
} from '@/hooks/useFeatures';
import { useProjectDetail } from '@/hooks/useProjects';

import { Loader2, PlusCircle, Frown, ArrowLeft, Search, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import FeatureFormDialog from '@/components/feature/FeatureFormDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
// Pastikan path import ini sesuai dengan struktur folder Shadcn Anda

// =========================================================================
// 🚨 DUMMY: FETCHING TEST CASE (Anda harus memindahkan ini ke hook yang sesuai)
// =========================================================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || '';
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};
interface TestCase {
    id: number;
}
const fetchTestCasesByFeature = async (featureId: number): Promise<TestCase[]> => {
    if (featureId <= 0) return [];
    const response = await axios.get<TestCase[]>(`${API_BASE_URL}/testcase/feature/${featureId}`, getAuthHeaders());
    return response.data;
};

interface FeatureWithCount extends Feature {
    testCaseCount: number;
}


const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();
    const { projectId: projectIdStr } = useParams<{ projectId: string }>();
    const projectId = projectIdStr ? parseInt(projectIdStr) : undefined;
    const isValidId = projectId && !isNaN(projectId);

    // States untuk UI dan Dialog CRUD
    const [searchQuery, setSearchQuery] = useState('');
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [initialFeatureData, setInitialFeatureData] = useState<Feature | null>(null);
    // 🚨 STATE BARU: Untuk konfirmasi penghapusan
    const [featureToDelete, setFeatureToDelete] = useState<{ id: number; name: string } | null>(null);

    // Data Hooks
    const {
        data: features,
        isLoading: isLoadingFeatures,
        isError: isErrorFeatures,
        error: errorFeatures
    } = useFeatures(isValidId ? projectId : -1);

    const { data: projectDetail, isLoading: isLoadingProject } = useProjectDetail(isValidId ? projectId : -1);
    const deleteMutation = useDeleteFeature();

    const projectName = projectDetail?.name || `Proyek ID: ${projectId}`;


    // =========================================================================
    // LOGIKA PENGHITUNGAN TEST CASE (MENGGUNAKAN useQueries)
    // =========================================================================
    const featureQueries = features?.map(feature => ({
        queryKey: ['testCasesByFeature', feature.id],
        queryFn: () => fetchTestCasesByFeature(feature.id),
        enabled: !!feature.id,
        staleTime: 5 * 60 * 1000,
    })) || [];

    const testCaseResults = useQueries({ queries: featureQueries });

    const isLoadingTCCounts = testCaseResults.some(result => result.isLoading);
    const isLoadingTotal = isLoadingFeatures || isLoadingProject || isLoadingTCCounts;


    const featuresWithCount: FeatureWithCount[] = features?.map((feature, index) => {
        const tcData = testCaseResults[index];
        const count = tcData?.data?.length || 0;

        return {
            ...feature,
            testCaseCount: count,
        };
    }) || [];


    // --- LOGIKA FILTERING (Menggunakan featuresWithCount yang sudah diperbarui) ---
    const filteredFeatures = featuresWithCount.filter(feature => {
        const query = searchQuery.toLowerCase();

        return (
            (feature.name || '').toLowerCase().includes(query) ||
            (feature.description || '').toLowerCase().includes(query) ||
            (feature.status || '').toLowerCase().includes(query) ||
            (feature.type || '').toLowerCase().includes(query)
        );
    }) || [];

    // --- HANDLERS ---

    // HANDLER NAVIGASI KE HALAMAN TEST CASE
    const handleViewTestCases = (featureId: number) => {
        if (projectId) {
            navigate(`/projects/${projectId}/features/${featureId}/testcases`);
        } else {
            toast.error("Error Navigasi", { description: "Project ID tidak ditemukan." });
        }
    };

    // Handler untuk membuka dialog mode Edit
    const handleOpenEditDialog = (feature: Feature) => {
        setInitialFeatureData(feature);
        setIsFeatureDialogOpen(true);
    };

    // Handler untuk membuka dialog mode Create
    const handleOpenCreateDialog = () => {
        setInitialFeatureData(null);
        setIsFeatureDialogOpen(true);
    };

    // Handler untuk menutup dialog
    const handleDialogClose = (open: boolean) => {
        setIsFeatureDialogOpen(open);
        if (!open) {
            setInitialFeatureData(null); // Reset data setelah ditutup
        }
    };

    // 🚨 HANDLER BARU/MODIFIKASI: Mempersiapkan penghapusan
    const handlePrepareDelete = (feature: Feature) => {
        setFeatureToDelete({ id: feature.id, name: feature.name });
    };

    // 🚨 HANDLER MODIFIKASI: Eksekusi Penghapusan (Dipanggil dari AlertDialog)
    const handleDeleteFeature = () => {
        if (!featureToDelete) return;

        const { id: featureId, name: featureName } = featureToDelete;

        const params: DeleteFeatureParams = { featureId, projectId: projectId! };

        deleteMutation.mutate(params, {
            onSuccess: () => {
                toast.success("Fitur Dihapus", { description: `Fitur '${featureName}' berhasil dihapus.` });
                setFeatureToDelete(null); // Tutup dialog konfirmasi setelah sukses
            },
            onError: (err: any) => {
                toast.error("Gagal Hapus Fitur", { description: err.message || "Terjadi kesalahan saat menghapus fitur." });
                setFeatureToDelete(null); // Tutup dialog
            }
        });
    };


    // --- RENDER KONDISIONAL ---
    if (!isValidId) {
        // ... (Kode render Project ID tidak valid)
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
                <Frown className="h-10 w-10 mb-2" />
                <p className="text-lg font-semibold">Project ID tidak valid.</p>
                <Link to="/projects"><Button className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Project</Button></Link>
            </div>
        );
    }

    if (isLoadingTotal) {
        // ... (Kode render Loading)
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <p className="text-gray-500 ml-2">Memuat detail proyek, fitur, dan menghitung Test Case...</p>
            </div>
        );
    }

    if (isErrorFeatures) {
        // ... (Kode render Error)
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
                <Frown className="h-10 w-10 mb-2" />
                <p className="text-lg font-semibold">Gagal memuat fitur.</p>
                <p className="text-sm">{errorFeatures?.message || "Terjadi kesalahan saat mengambil data fitur."}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header Halaman Fitur */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-bold">
                                Fitur: {projectName}
                            </CardTitle>
                            <CardDescription className="text-md mt-1">
                                Kelola semua Fitur, Test Case, dan dokumentasi terkait Project ini.
                            </CardDescription>
                        </div>
                        <Link to="/projects">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Project
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
            </Card>

            {/* Bagian Aksi & Searching */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari Fitur (Nama, Deskripsi, Status, Tipe)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleOpenCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Fitur Baru
                </Button>
            </div>

            {/* Tabel Konten */}
            <Card>
                <CardContent className="p-0">
                    {filteredFeatures.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">ID</TableHead>
                                        <TableHead>Nama Fitur</TableHead>
                                        <TableHead className="w-[100px]">Tipe</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[100px] text-center">TC Count</TableHead>
                                        <TableHead className="w-[100px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFeatures.map((feature) => (
                                        <TableRow key={feature.id}>
                                            <TableCell className="font-medium">{feature.id}</TableCell>
                                            <TableCell className="font-medium">{feature.name}</TableCell>
                                            <TableCell>{feature.type}</TableCell>

                                            {/* Kolom Status menggunakan Badge */}
                                            <TableCell>
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full 
                                                    ${feature.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        feature.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-500'}`}>
                                                    {feature.status.toUpperCase()}
                                                </span>
                                            </TableCell>

                                            {/* Kolom TC Count yang Clickable */}
                                            <TableCell
                                                className="text-center font-bold text-blue-600 cursor-pointer hover:underline"
                                                onClick={() => handleViewTestCases(feature.id)}
                                            >
                                                {feature.testCaseCount || 0}
                                            </TableCell>

                                            {/* Kolom Aksi (Icon-based) */}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-1">
                                                    {/* 🚨 VIEW DETAIL (Optional: Jika FeatureFormDialog tidak cocok untuk View)
                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(feature, 'view')}>
                    <Eye className="h-4 w-4" />
                </Button> 
                */}

                                                    {/* Edit */}
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(feature)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    {/* Hapus - Sekarang memanggil handler persiapan */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handlePrepareDelete(feature)} // 🚨 Panggil handler baru
                                                        disabled={deleteMutation.isPending && deleteMutation.variables?.featureId === feature.id}
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables?.featureId === feature.id ? (
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
                                {searchQuery ? `Tidak ada fitur yang cocok dengan kata kunci: "${searchQuery}"` : "Proyek ini belum memiliki fitur."}
                            </p>
                            {!searchQuery && (
                                <Button onClick={handleOpenCreateDialog} className="mt-4">
                                    Tambahkan Fitur Baru
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* FeatureFormDialog diaktifkan (Untuk Create/Edit/View Detail) */}
            <FeatureFormDialog 
                open={isFeatureDialogOpen}
                onOpenChange={handleDialogClose}
                initialData={initialFeatureData}
                projectId={projectId} 
            />

            {/* 🚨 ALERT DIALOG UNTUK KONFIRMASI PENGHAPUSAN 🚨 */}
            <AlertDialog 
                open={!!featureToDelete} // Buka jika featureToDelete ada
                onOpenChange={(open) => {
                    if (!open) setFeatureToDelete(null); // Tutup jika diklik di luar
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus fitur 
                            "{featureToDelete?.name}"? 
                            Tindakan ini akan menghapus semua Test Case terkait dan tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            disabled={deleteMutation.isPending}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteFeature} // Panggil fungsi eksekusi penghapusan
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

export default FeaturesPage;