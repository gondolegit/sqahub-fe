// src/components/reports/PdfExportButton.tsx
//
// @react-pdf/renderer adalah dependency yang sangat besar (>1MB) dan hanya dibutuhkan
// saat pengguna benar-benar mengekspor laporan ke PDF. Mengimpornya secara statis di
// halaman laporan membuat halaman itu sendiri berat untuk diunduh di koneksi lambat,
// meski tombol export belum pernah diklik. Komponen ini menunda import
// @react-pdf/renderer + ReportDocument sampai benar-benar dirender.
import React, { Suspense, lazy } from 'react';
import type { TestSuite } from '@/types/testSuite';

export interface PdfExportRenderState {
    loading: boolean;
}

interface PdfExportButtonProps {
    testSuite: TestSuite;
    pieChartImage: string;
    fileName: string;
    children: (state: PdfExportRenderState) => React.ReactNode;
}

const LazyPdfDownloadLink = lazy(() =>
    Promise.all([
        import('@react-pdf/renderer'),
        import('./ReportDocument'),
    ]).then(([{ PDFDownloadLink }, { default: ReportDocument }]) => ({
        default: ({ testSuite, pieChartImage, fileName, children }: PdfExportButtonProps) => (
            <PDFDownloadLink
                document={<ReportDocument testSuite={testSuite} pieChartImage={pieChartImage} />}
                fileName={fileName}
            >
                {(state) => children(state)}
            </PDFDownloadLink>
        ),
    }))
);

const PdfExportButton: React.FC<PdfExportButtonProps> = (props) => (
    <Suspense fallback={props.children({ loading: true })}>
        <LazyPdfDownloadLink {...props} />
    </Suspense>
);

export default PdfExportButton;
