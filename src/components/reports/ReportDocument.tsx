import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer';
import { type TestSuite, type RunDetail } from '@/types/testSuite';

// --- Sinkronisasi Warna dengan Tailwind Dashboard ---
const COLORS = {
    PRIMARY: '#0F172A',    // slate-900
    SECONDARY: '#334155',  // slate-700
    ACCENT: '#2563EB',     // blue-600
    EMERALD: '#10B981',    // emerald-500
    RED: '#EF4444',        // red-500
    AMBER: '#F59E0B',      // amber-500
    INDIGO: '#6366F1',     // indigo-500
    BORDER: '#E2E8F0',     // slate-200
    BG_SLATE: '#F8FAFC',   // slate-50
    TEXT_MAIN: '#1E293B',  // slate-800
    TEXT_MUTED: '#64748B'  // slate-500
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        color: COLORS.TEXT_MAIN,
        backgroundColor: '#FFFFFF'
    },
    // --- Header Style (Dark Theme ala Dashboard) ---
    headerBanner: {
        backgroundColor: COLORS.PRIMARY,
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    confidentialTag: {
        fontSize: 7,
        color: COLORS.RED,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5
    },
    reportTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontStyle: 'italic'
    },
    reportSubtitle: {
        fontSize: 9,
        color: '#CBD5E1', // slate-300
        marginTop: 5
    },

    // --- Counter Grid (4 Columns) ---
    kpiContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25
    },
    kpiCard: {
        flex: 1,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: 6,
        borderTopWidth: 4, // Aksen warna top-border ala Dashboard
    },
    kpiLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.TEXT_MUTED,
        textTransform: 'uppercase',
        marginBottom: 4
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -1
    },
    kpiDesc: {
        fontSize: 6,
        color: COLORS.TEXT_MUTED,
        marginTop: 3,
        fontWeight: 'bold'
    },

    // --- Metadata Grid (ISO Standard) ---
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.PRIMARY,
        paddingBottom: 5
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.PRIMARY,
        textTransform: 'uppercase',
    },
    metadataGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        backgroundColor: COLORS.BG_SLATE,
        borderRadius: 8,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.BORDER
    },
    metadataItem: {
        width: '25%',
        marginBottom: 12
    },
    metadataLabel: {
        fontSize: 6,
        color: COLORS.TEXT_MUTED,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    metadataValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.PRIMARY,
        marginTop: 2,
        textTransform: 'uppercase'
    },

    // --- Visual Analysis ---
    visualSection: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
        minHeight: 180
    },
    chartWrapper: {
        width: '40%',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    descriptionWrapper: {
        width: '60%',
        padding: 15,
        backgroundColor: COLORS.BG_SLATE,
        borderRadius: 8,
        justifyContent: 'center'
    },
    descText: {
        fontSize: 9,
        lineHeight: 1.6,
        color: COLORS.SECONDARY,
        textAlign: 'justify'
    },

    // --- Table Implementation ---
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.PRIMARY,
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4
    },
    tableHeaderText: {
        color: '#FFFFFF',
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        minHeight: 35,
        alignItems: 'center',
        paddingHorizontal: 5
    },
    colId: { width: '10%', textAlign: 'center', fontSize: 7 },
    colStatus: { width: '15%', textAlign: 'center', fontSize: 7, fontWeight: 'bold' },
    colName: { width: '35%', fontSize: 7, fontWeight: 'bold', paddingLeft: 5 },
    colResult: { width: '40%', fontSize: 7, paddingLeft: 5 },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: COLORS.TEXT_MUTED
    }
});

interface ReportDocumentProps {
    testSuite: TestSuite;
    pieChartImage: string;
}

const ReportDocument: React.FC<ReportDocumentProps> = ({ testSuite, pieChartImage }) => {
    const { t } = useTranslation();
    // Sinkronisasi logika perhitungan dengan TestRunDetailPage.tsx
    const total = (testSuite.statusTotalPassed + testSuite.statusTotalFailed +
        testSuite.statusTotalError + testSuite.statusTotalSkipped) || 1;

    const passRate = (testSuite.statusTotalPassed / total) * 100;

    // Meniru array statusCards dari TestRunDetailPage
    const statusCards = [
        { statusKey: 'passed', count: testSuite.statusTotalPassed, color: COLORS.EMERALD },
        { statusKey: 'failed', count: testSuite.statusTotalFailed, color: COLORS.RED },
        { statusKey: 'error', count: testSuite.statusTotalError, color: COLORS.AMBER },
        { statusKey: 'skipped', count: testSuite.statusTotalSkipped, color: COLORS.INDIGO },
    ] as const;

    return (
        <Document author="SQAHUB Enterprise" title={`ISO_REPORT_${testSuite.name}`}>
            <Page size="A4" style={styles.page}>

                {/* --- 1. DASHBOARD HEADER --- */}
                <View style={styles.headerBanner}>
                    <Text style={styles.confidentialTag}>{t('pdfReport.confidentialTag')}</Text>
                    <Text style={styles.reportTitle}>{t('pdfReport.titlePrefix')}{testSuite.name}</Text>
                    <Text style={styles.reportSubtitle}>
                        {t('pdfReport.subtitle', { id: testSuite.id, date: new Date().toLocaleString('id-ID') })}
                    </Text>
                </View>

                {/* --- 2. STATUS COUNTER GRID (Sesuai Dashboard) --- */}
                <View style={styles.kpiContainer}>
                    {statusCards.map((stat) => (
                        <View key={stat.statusKey} style={[styles.kpiCard, { borderTopColor: stat.color }]}>
                            <Text style={styles.kpiLabel}>{t(`pdfReport.statusLabels.${stat.statusKey}`)}</Text>
                            <Text style={[styles.kpiValue, { color: stat.color }]}>{stat.count}</Text>
                            <Text style={styles.kpiDesc}>{t(`pdfReport.statusDesc.${stat.statusKey}`)}</Text>
                        </View>
                    ))}
                </View>

                {/* --- 3. METADATA CONTEXT --- */}
                <View style={styles.sectionHeader}>
                    <View style={{ width: 4, height: 12, backgroundColor: COLORS.ACCENT, marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>{t('pdfReport.contextTitle')}</Text>
                </View>

                <View style={styles.metadataGrid}>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.project')}</Text><Text style={styles.metadataValue}>{testSuite.projectName || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.mode')}</Text><Text style={styles.metadataValue}>{testSuite.executionType || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.environment')}</Text><Text style={styles.metadataValue}>{testSuite.testEnvironment || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.os')}</Text><Text style={styles.metadataValue}>{testSuite.os || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.version')}</Text><Text style={styles.metadataValue}>{testSuite.version || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.agent')}</Text><Text style={styles.metadataValue}>{testSuite.browser || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.officer')}</Text><Text style={styles.metadataValue}>{testSuite.executedByUsername || '-'}</Text></View>
                    <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{t('pdfReport.metadata.passRate')}</Text><Text style={[styles.metadataValue, { color: COLORS.ACCENT }]}>{passRate.toFixed(2)}%</Text></View>
                </View>

                {/* --- 4. VISUAL ANALYSIS (PIE CHART) --- */}
                <View style={styles.sectionHeader}>
                    <View style={{ width: 4, height: 12, backgroundColor: COLORS.ACCENT, marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>{t('pdfReport.visualTitle')}</Text>
                </View>

                <View style={styles.visualSection} wrap={false}>
                    <View style={styles.chartWrapper}>
                        {pieChartImage ? (
                            <Image src={pieChartImage} style={{ width: 140, height: 140 }} />
                        ) : (
                            <Text style={{ fontSize: 7, color: COLORS.TEXT_MUTED }}>{t('pdfReport.chartNotRendered')}</Text>
                        )}
                    </View>
                    <View style={styles.descriptionWrapper}>
                        <Text style={styles.descText}>
                            {testSuite.description ||
                                t('pdfReport.defaultDescription', {
                                    name: testSuite.name,
                                    total,
                                    passed: testSuite.statusTotalPassed,
                                    passRate: passRate.toFixed(2),
                                    version: testSuite.version || 'N/A',
                                })}
                        </Text>
                    </View>
                </View>

                {/* --- 5. DETAILED SPECIFICATION TABLE --- */}
                <View style={styles.sectionHeader}>
                    <View style={{ width: 4, height: 12, backgroundColor: COLORS.ACCENT, marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>{t('pdfReport.resultsTitle')}</Text>
                </View>

                <View>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.tableHeaderText, styles.colId]}>{t('pdfReport.table.tcId')}</Text>
                        <Text style={[styles.tableHeaderText, styles.colStatus]}>{t('pdfReport.table.outcome')}</Text>
                        <Text style={[styles.tableHeaderText, styles.colName]}>{t('pdfReport.table.specification')}</Text>
                        <Text style={[styles.tableHeaderText, styles.colResult]}>{t('pdfReport.table.observedOutcome')}</Text>
                    </View>

                    {(testSuite.runDetails || []).map((detail: RunDetail) => (
                        <View style={styles.tableRow} key={detail.id} wrap={false}>
                            <Text style={styles.colId}>{detail.idTestCase}</Text>
                            <Text style={[styles.colStatus, {
                                color: detail.status === 'PASSED' ? COLORS.EMERALD :
                                    detail.status === 'FAILED' ? COLORS.RED :
                                        detail.status === 'ERROR' ? COLORS.AMBER : COLORS.TEXT_MUTED
                            }]}>{detail.status}</Text>
                            <Text style={styles.colName}>{detail.testCaseName}</Text>
                            <View style={styles.colResult}>
                                <Text style={{ fontWeight: 'bold' }}>{detail.actualResult}</Text>
                                <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 6, marginTop: 2 }}>{detail.remarks || '-'}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* --- FOOTER --- */}
                <View style={styles.footer} fixed>
                    <Text>{t('pdfReport.footerBrand')}</Text>
                    <Text render={({ pageNumber, totalPages }) => t('pdfReport.footerPage', { pageNumber, totalPages })} />
                </View>

            </Page>
        </Document>
    );
};

export default ReportDocument;