import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Zap, AlertTriangle, ListFilter, Search, Radio, ClipboardEdit, FileCode2 } from 'lucide-react';

// Import Hooks & Types
import { useProjects } from '@/hooks/useProjects';
import { useTestSuitesByProject } from '@/hooks/useTestSuites';
import { useAuth } from '@/contexts/AuthContext';

// Import UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

// Import Komponen
import TestSuiteFormDialog from '@/components/testsuite/TestSuiteFormDialog';
import StartTestRunDialog from '@/components/testsuite/StartTestRunDialog';
import TestSuitesTable from '@/components/testsuite/TestSuitesTable';
import ImportJUnitDialog from '@/components/testsuite/ImportJUnitDialog';

const PAGE_SIZE = 10;
// Sesuai matriks izin backend: create/update TestSuite run butuh role global ADMIN, TESTER, atau DEVELOPER.
const RUN_CREATE_ROLES = ['ADMIN', 'TESTER', 'DEVELOPER'] as const;

const TestSuitesPage: React.FC = () => {
    const { t } = useTranslation();
    const { hasRole } = useAuth();
    const canCreateRun = hasRole([...RUN_CREATE_ROLES]);

    // 1. States
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(0);
    const [isStartRunOpen, setIsStartRunOpen] = useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isJUnitImportOpen, setIsJUnitImportOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // 2. Data Fetching
    const { data: projectsPage, isLoading: isLoadingProjects } = useProjects({ size: 100 });
    const projects = projectsPage?.content;

    const {
        data: testSuitesPage,
        isLoading: isLoadingSuites,
        isError: isErrorSuites
    } = useTestSuitesByProject(selectedProjectId || -1, { page, size: PAGE_SIZE });

    const testSuites = testSuitesPage?.content;

    // 3. Effects
    // Menggunakan useEffect untuk side-effect setting default project
    useEffect(() => {
        if (!selectedProjectId && projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // 4. Logika Filter Search (di halaman yang sedang dimuat)
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
        setPage(0); // Reset ke halaman pertama saat ganti project
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <Zap className="h-7 w-7 mr-3 text-primary" /> {t('testSuites.pageTitle')}
            </h1>

            <Card className="shadow-lg border-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center">
                        <ListFilter className="h-5 w-5 mr-2 text-muted-foreground" /> {t('testSuites.filterCardTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        {/* Pilih Project */}
                        <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">{t('testSuites.projectLabel')}</label>
                            <Select
                                onValueChange={handleProjectChange}
                                value={selectedProjectId ? String(selectedProjectId) : undefined}
                                disabled={isLoadingProjects}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder={isLoadingProjects ? t('testSuites.projectLoading') : t('testSuites.projectPlaceholder')} />
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
                            <label className="text-xs font-bold uppercase text-muted-foreground">{t('testSuites.searchLabel')}</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('testSuites.searchPlaceholder')}
                                    className="pl-10 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tombol New Run */}
                        {canCreateRun && (
                            <div className="w-full md:w-auto flex gap-2">
                                <Button
                                    onClick={() => setIsStartRunOpen(true)}
                                    disabled={!selectedProjectId}
                                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-md"
                                    title={t('testSuites.startLiveRunTitle')}
                                >
                                    <Radio className="h-4 w-4 mr-2" /> {t('testSuites.startLiveRun')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsFormDialogOpen(true)}
                                    disabled={!selectedProjectId}
                                    className="w-full md:w-auto"
                                    title={t('testSuites.manualInputTitle')}
                                >
                                    <ClipboardEdit className="h-4 w-4 mr-2" /> {t('testSuites.manualInput')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsJUnitImportOpen(true)}
                                    disabled={!selectedProjectId}
                                    className="w-full md:w-auto"
                                    title={t('testSuites.junitImport.buttonTitle')}
                                >
                                    <FileCode2 className="h-4 w-4 mr-2" /> {t('testSuites.junitImport.button')}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bagian Tabel Riwayat */}
            <Card className="shadow-md border-none overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="text-lg">
                        {t('testSuites.testRunsTitle')}<span className="text-primary">{projects?.find(p => p.id === selectedProjectId)?.name || t('testSuites.selectProjectFallback')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0"> {/* P-0 agar tabel menempel ke pinggir card */}
                    {isErrorSuites && (
                        <div className="p-8 text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            {t('testSuites.loadError')}
                        </div>
                    )}

                    {isLoadingSuites ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">{t('testSuites.loadingHistory')}</p>
                        </div>
                    ) : (
                        <>
                            <TestSuitesTable
                                data={filteredTestSuites}
                                projectId={selectedProjectId!}
                                isLoading={false}
                            />
                            {testSuitesPage && testSuitesPage.totalPages > 1 && (
                                <div className="px-4 pb-4">
                                    <Pagination
                                        page={testSuitesPage.number}
                                        totalPages={testSuitesPage.totalPages}
                                        totalElements={testSuitesPage.totalElements}
                                        pageSize={testSuitesPage.size}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Mulai Live Run — membuat suite kosong (IN PROGRESS), lalu arahkan ke halaman detail */}
            <StartTestRunDialog
                open={isStartRunOpen}
                onOpenChange={setIsStartRunOpen}
                projectId={selectedProjectId}
            />

            {/* Dialog Input Manual — logging run yang sudah selesai dieksekusi, sekaligus */}
            <TestSuiteFormDialog
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                initialProjectId={selectedProjectId}
            />

            {/* Dialog Import Laporan JUnit XML dari CI/CD — dibuat & langsung difinalisasi */}
            <ImportJUnitDialog
                open={isJUnitImportOpen}
                onOpenChange={setIsJUnitImportOpen}
                projectId={selectedProjectId}
            />
        </div>
    );
};

export default TestSuitesPage;
