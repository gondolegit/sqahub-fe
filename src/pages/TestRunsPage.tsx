// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     Loader2, PlusCircle, Frown, ArrowLeft, Trash, Eye
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { toast } from 'sonner';
// import { Badge } from '@/components/ui/badge';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// // Import Hooks & Types
// import {
//     useTestSuitesByProject,
//     useDeleteTestSuite
// } from '@/hooks/useTestSuites';

// import type { TestSuite } from '@/types/testSuite';

// import { formatDate } from '@/lib/utils'; // Asumsi Anda punya utilitas ini

// // Import Komponen Dialog yang akan kita buat
// import TestSuiteDetailDialog from '@/components/testsuite/TestSuiteDetailDialog';
// import TestSuiteFormDialog from '@/components/testsuite/TestSuiteFormDialog';

// // --- KOMPONEN UTAMA ---
// const TestRunsPage: React.FC = () => {
//     const navigate = useNavigate();
//     const { projectId: projectIdStr } = useParams<{ projectId: string }>();

//     const projectId = projectIdStr ? parseInt(projectIdStr) : -1;
//     const isValidProjectId = projectId > 0 && !isNaN(projectId);

//     // States untuk UI dan Dialog
//     const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
//     const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
//     const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(null);

//     // STATE BARU: Untuk konfirmasi penghapusan
//     const [suiteToDelete, setSuiteToDelete] = useState<{ id: number; name: string } | null>(null);

//     // Data Hooks
//     const { data: testSuites, isLoading, isError } =
//         useTestSuitesByProject(isValidProjectId ? projectId : -1);

//     const deleteMutation = useDeleteTestSuite();

//     // --- HANDLERS DIALOG ---

//     // Handler untuk membuka Detail Dialog
//     const handleViewDetail = (suiteId: number) => {

//         navigate(`/projects/${projectId}/test-runs/${suiteId}`);

//         // setSelectedSuiteId(suiteId);
//         // setIsDetailDialogOpen(true);
//     };

//     // Handler untuk membuka Form Dialog (Create Baru)
//     const handleOpenCreateForm = () => {
//         setIsFormDialogOpen(true);
//     };

//     // Handler untuk persiapan Delete
//     const handlePrepareDelete = (suite: TestSuite) => {
//         setSuiteToDelete({ id: suite.id, name: suite.name });
//     };

//     // Handler Eksekusi Delete
//     const handleDeleteTestSuite = () => {
//         if (!suiteToDelete) return;
//         const { id: testSuiteId, name: suiteName } = suiteToDelete;

//         deleteMutation.mutate(testSuiteId, {
//             onSuccess: () => {
//                 toast.success("Test Suite Dihapus", { description: `Test Suite '${suiteName}' berhasil dihapus.` });
//                 setSuiteToDelete(null);
//             },
//             onError: (err: any) => {
//                 toast.error("Gagal Hapus Test Suite", { description: err.message || "Terjadi kesalahan saat menghapus suite." });
//                 setSuiteToDelete(null);
//             }
//         });
//     };

//     // --- UTILS PENDUKUNG ---

//     const getSuiteStatus = (suite: TestSuite) => {
//         if (!suite.endDate) {
//             return { label: "IN PROGRESS", variant: "default" };
//         }
//         if (suite.statusTotalFailed > 0 || suite.statusTotalError > 0) {
//             return { label: "FAILED", variant: "destructive" };
//         }
//         if (suite.statusTotalPassed > 0 && suite.statusTotalFailed === 0) {
//             return { label: "PASSED", variant: "success" };
//         }
//         return { label: "COMPLETED", variant: "secondary" };
//     };

//     const getStatusBadgeClass = (variant: string) => {
//         switch (variant) {
//             case 'destructive': return 'bg-red-500 hover:bg-red-600 text-white';
//             case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
//             default: return 'bg-yellow-500 hover:bg-yellow-600 text-white';
//         }
//     };

//     // --- RENDER KONDISIONAL ---
//     if (!isValidProjectId) {
//         return (
//             <div className="flex flex-col items-center justify-center p-8 text-red-600">
//                 <Frown className="h-10 w-10 mb-2" />
//                 <p className="text-lg font-semibold">Project ID tidak valid.</p>
//             </div>
//         );
//     }

//     if (isLoading) {
//         return (
//             <div className="flex justify-center p-8">
//                 <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
//                 <p className="text-gray-500 ml-2">Memuat riwayat Test Suite...</p>
//             </div>
//         );
//     }

//     if (isError) {
//         return (
//             <div className="flex flex-col items-center justify-center p-8 text-red-600">
//                 <Frown className="h-10 w-10 mb-2" />
//                 <p className="text-lg font-semibold">Gagal memuat Test Suites.</p>
//             </div>
//         );
//     }

//     // Asumsi: projectName bisa diambil dari salah satu suite (jika ada data) atau konteks global
//     const projectName = testSuites && testSuites.length > 0 ? testSuites[0].projectName : `Proyek ID: ${projectId}`;


//     return (
//         <div className="container mx-auto p-4 space-y-6">
//             {/* Header */}
//             <Card className="shadow-lg">
//                 <CardHeader>
//                     <div className="flex justify-between items-start">
//                         <div>
//                             <CardTitle className="text-3xl font-bold">
//                                 Riwayat Eksekusi Test Suite
//                             </CardTitle>
//                             <CardDescription className="text-md mt-1">
//                                 Proyek: {projectName} | Total Run: {testSuites?.length || 0}
//                             </CardDescription>
//                         </div>
//                         <Button variant="outline" onClick={() => navigate(`/projects`)}>
//                             <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Proyek
//                         </Button>
//                     </div>
//                 </CardHeader>
//             </Card>

//             {/* Aksi & Tabel */}
//             <div className="flex justify-end mb-4">
//                 {/* 🚨 Tombol untuk memulai Run Test Suite Baru */}
//                 <Button onClick={handleOpenCreateForm}>
//                     <PlusCircle className="mr-2 h-4 w-4" /> Mulai Run Test Suite Baru
//                 </Button>
//             </div>

//             <Card>
//                 <CardContent className="p-0">
//                     {testSuites && testSuites.length > 0 ? (
//                         <div className="overflow-x-auto">
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead className="w-[50px]">ID</TableHead>
//                                         <TableHead>Nama Test Suite</TableHead>
//                                         <TableHead className="w-[100px] text-center">Status</TableHead>
//                                         <TableHead>Start Date</TableHead>
//                                         <TableHead className="text-center">Passed</TableHead>
//                                         <TableHead className="text-center">Failed</TableHead>
//                                         <TableHead className="text-center">Skipped</TableHead>
//                                         <TableHead>Executed By</TableHead>
//                                         <TableHead className="w-[120px] text-right">Aksi</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {testSuites.map((suite) => {
//                                         const status = getSuiteStatus(suite);
//                                         return (
//                                             <TableRow key={suite.id}>
//                                                 <TableCell className="font-medium">{suite.id}</TableCell>
//                                                 <TableCell className="font-medium">{suite.name}</TableCell>
//                                                 <TableCell className="text-center">
//                                                     <Badge className={getStatusBadgeClass(status.variant)}>
//                                                         {status.label}
//                                                     </Badge>
//                                                 </TableCell>
//                                                 <TableCell>{formatDate(suite.startDate)}</TableCell>
//                                                 <TableCell className="text-center text-green-600 font-semibold">{suite.statusTotalPassed}</TableCell>
//                                                 <TableCell className="text-center text-red-600 font-semibold">{suite.statusTotalFailed}</TableCell>
//                                                 <TableCell className="text-center text-yellow-600 font-semibold">{suite.statusTotalSkipped}</TableCell>
//                                                 <TableCell>{suite.executedByUsername}</TableCell>

//                                                 {/* Kolom Aksi */}
//                                                 <TableCell className="text-right">
//                                                     <div className="flex justify-end space-x-1">
//                                                         {/* View Detail */}
//                                                         <Button
//                                                             variant="ghost"
//                                                             size="icon"
//                                                             onClick={() => handleViewDetail(suite.id)} // Menggunakan fungsi navigasi yang baru
//                                                             title="Lihat Detail Run"
//                                                         >
//                                                             <Eye className="h-4 w-4 text-blue-600" />
//                                                         </Button>
//                                                         {/* Hapus */}
//                                                         <Button
//                                                             variant="ghost"
//                                                             size="icon"
//                                                             onClick={() => handlePrepareDelete(suite)}
//                                                             disabled={deleteMutation.isPending && suiteToDelete?.id === suite.id}
//                                                             title="Hapus Test Suite Run"
//                                                         >
//                                                             {deleteMutation.isPending && suiteToDelete?.id === suite.id ? (
//                                                                 <Loader2 className="h-4 w-4 animate-spin" />
//                                                             ) : (
//                                                                 <Trash className="h-4 w-4 text-red-500" />
//                                                             )}
//                                                         </Button>
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         );
//                                     })}
//                                 </TableBody>
//                             </Table>
//                         </div>
//                     ) : (
//                         <div className="p-10 text-center border-none rounded-lg bg-white">
//                             <p className="text-lg text-gray-500">
//                                 Belum ada riwayat Test Suite Run untuk proyek ini.
//                             </p>
//                             <Button onClick={handleOpenCreateForm} className="mt-4">
//                                 Mulai Run Test Suite Pertama Anda
//                             </Button>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* 🚨 1. Component untuk Detail Test Suite (Mode View) */}
//             <TestSuiteDetailDialog
//                 open={isDetailDialogOpen}
//                 onOpenChange={setIsDetailDialogOpen}
//                 testSuiteId={selectedSuiteId}
//             // Anda juga bisa menambahkan logic finalize/edit jika perlu di sini
//             />

//             {/* 🚨 2. Component untuk Form Test Suite (Mode Create) */}
//             <TestSuiteFormDialog
//                 open={isFormDialogOpen}
//                 onOpenChange={setIsFormDialogOpen}
//                 projectId={projectId}
//             // Tidak perlu initialData/edit di sini, karena endpoint POST hanya untuk buat baru.
//             />

//             {/* 🚨 ALERT DIALOG UNTUK KONFIRMASI PENGHAPUSAN 🚨 */}
//             <AlertDialog
//                 open={!!suiteToDelete}
//                 onOpenChange={(open) => {
//                     if (!open) setSuiteToDelete(null);
//                 }}
//             >
//                 <AlertDialogContent>
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Konfirmasi Penghapusan Test Suite</AlertDialogTitle>
//                         <AlertDialogDescription>
//                             Apakah Anda yakin ingin menghapus Test Suite
//                             **"{suiteToDelete?.name}"** (ID: {suiteToDelete?.id})?
//                             Tindakan ini akan menghapus semua riwayat eksekusi terkait dan **tidak dapat dibatalkan**.
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel
//                             disabled={deleteMutation.isPending}
//                         >
//                             Batal
//                         </AlertDialogCancel>
//                         <AlertDialogAction
//                             onClick={handleDeleteTestSuite}
//                             className="bg-red-600 hover:bg-red-700"
//                             disabled={deleteMutation.isPending}
//                         >
//                             {deleteMutation.isPending ? (
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             ) : (
//                                 'Hapus Permanen'
//                             )}
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>

//         </div>
//     );
// };

// export default TestRunsPage;