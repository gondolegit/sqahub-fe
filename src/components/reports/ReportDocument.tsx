// src/components/reports/ReportDocument.tsx
// 🚨 PEROMBAKAN GAYA (Mencoba meniru gaya modern/Katalon)

import React from 'react';
import { 
    Document, Page, Text, View, StyleSheet, Image, Font
} from '@react-pdf/renderer';
import { type TestSuite, type RunDetail } from '@/types/testSuite';

// --- REGISTER FONT (Opsional, tapi penting untuk styling yang konsisten) ---
// Font.register({ family: 'Roboto', src: 'path/to/Roboto-Regular.ttf' });
// Gunakan 'Helvetica' sebagai fallback yang aman

const PRIMARY_COLOR = '#007ACC'; // Biru tua/Cyan
const SUCCESS_COLOR = '#10B981';
const FAILURE_COLOR = '#EF4444';
const WARNING_COLOR = '#F59E0B';
const BORDER_COLOR = '#E5E7EB';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    
    // --- Header ---
    header: { 
        fontSize: 28, 
        marginBottom: 5, 
        textAlign: 'left', 
        color: PRIMARY_COLOR,
        fontWeight: 'extrabold',
    },
    subHeader: { 
        fontSize: 14, 
        marginBottom: 20, 
        textAlign: 'left', 
        color: '#4B5563',
    },
    
    // --- Box Ringkasan Statistik ---
    summaryGrid: {
        flexDirection: 'row',
        marginBottom: 20,
        // Menjaga agar grid tidak terbagi halaman
        flexWrap: 'wrap', 
    },
    summaryBox: {
        width: '25%', // 4 box per baris
        padding: 10,
        marginRight: 5,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 4,
        alignItems: 'center',
    },
    summaryLabel: { fontSize: 8, color: '#6B7280', marginBottom: 2 },
    summaryValue: { fontSize: 16, fontWeight: 'bold' },

    // --- Detail & Grafik ---
    sectionTitle: { 
        fontSize: 14, 
        marginTop: 15, 
        marginBottom: 8, 
        paddingBottom: 4,
        borderBottomWidth: 2,
        borderBottomColor: PRIMARY_COLOR,
        fontWeight: 'bold',
        color: '#374151'
    },
    detailRow: { 
        flexDirection: 'row', 
        marginBottom: 5, 
        fontSize: 10 
    },
    detailKey: { width: '25%', color: '#6B7280' },
    detailValue: { width: '75%', fontWeight: 'bold', color: '#1F2937' },

    // --- Tabel Detail Run ---
    table: { 
        marginTop: 10,
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: BORDER_COLOR,
    },
    tableRow: { 
        flexDirection: "row",
        borderBottomWidth: 1, 
        borderBottomColor: BORDER_COLOR,
        alignItems: 'stretch',
    },
    tableColHeader: { 
        padding: 6, 
        backgroundColor: '#F3F4F6',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: BORDER_COLOR,
    },
    tableColContent: { 
        padding: 6, 
        fontSize: 8, 
        borderRightWidth: 1,
        borderRightColor: BORDER_COLOR,
    },
    statusPass: { color: SUCCESS_COLOR, fontWeight: 'bold' },
    statusFail: { color: FAILURE_COLOR, fontWeight: 'bold' },
    statusError: { color: WARNING_COLOR, fontWeight: 'bold' },

    // --- Footer ---
    footer: {
        position: 'absolute', 
        bottom: 20, 
        left: 40, 
        right: 40, 
        fontSize: 8, 
        textAlign: 'right',
        borderTopWidth: 1,
        borderTopColor: BORDER_COLOR,
        paddingTop: 5
    }
});

// Helper untuk Durasi (Sama)
const durationDisplay = (suite: TestSuite) => { 
    // ... (Logika durationDisplay tetap sama)
    const seconds = Math.floor(suite.elapsedTime); 
    if (seconds < 60) return `${seconds} dtk`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} dtk` : `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60; 
    return remainingMinutes > 0 
        ? `${hours} jam ${remainingMinutes} min` 
        : `${hours} jam`;
};

// Helper untuk Warna Status
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PASS': return styles.statusPass;
        case 'FAIL': return styles.statusFail;
        case 'ERROR': return styles.statusError;
        default: return {};
    }
};

interface ReportDocumentProps {
    testSuite: TestSuite;
    pieChartImage: string; 
}

// Komponen Document Utama
const ReportDocument: React.FC<ReportDocumentProps> = ({ testSuite, pieChartImage }) => {
    
    const totalRuns = testSuite.statusTotalPassed + testSuite.statusTotalFailed + testSuite.statusTotalError + testSuite.statusTotalSkipped;
    const passRate = totalRuns > 0 ? (testSuite.statusTotalPassed / totalRuns) * 100 : 0;
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Judul & Sub Judul */}
                <Text style={styles.header}>Test Execution Report</Text>
                <Text style={styles.subHeader}>Run ID: {testSuite.id} - {testSuite.name}</Text>

                {/* 1. Ringkasan Status (Box Grid) */}
                <View style={styles.summaryGrid}>
                    <View style={{ ...styles.summaryBox, borderColor: SUCCESS_COLOR }}>
                        <Text style={styles.summaryLabel}>Passed</Text>
                        <Text style={{ ...styles.summaryValue, color: SUCCESS_COLOR }}>{testSuite.statusTotalPassed}</Text>
                    </View>
                    <View style={{ ...styles.summaryBox, borderColor: FAILURE_COLOR }}>
                        <Text style={styles.summaryLabel}>Failed</Text>
                        <Text style={{ ...styles.summaryValue, color: FAILURE_COLOR }}>{testSuite.statusTotalFailed}</Text>
                    </View>
                    <View style={{ ...styles.summaryBox, borderColor: WARNING_COLOR }}>
                        <Text style={styles.summaryLabel}>Error/Skipped</Text>
                        <Text style={{ ...styles.summaryValue, color: WARNING_COLOR }}>{testSuite.statusTotalError + testSuite.statusTotalSkipped}</Text>
                    </View>
                    <View style={{ ...styles.summaryBox, borderColor: PRIMARY_COLOR }}>
                        <Text style={styles.summaryLabel}>Total Test Cases</Text>
                        <Text style={{ ...styles.summaryValue, color: PRIMARY_COLOR }}>{totalRuns}</Text>
                    </View>
                </View>

                {/* 2. Detail Eksekusi & Grafik */}
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    
                    {/* Kolom Kiri: Detail Meta Data */}
                    <View style={{ width: '55%', paddingRight: 15 }}>
                        <Text style={styles.sectionTitle}>Execution Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Project:</Text>
                            <Text style={styles.detailValue}>{testSuite.projectName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Executed By:</Text>
                            <Text style={styles.detailValue}>{testSuite.executedByUsername}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Start Time:</Text>
                            <Text style={styles.detailValue}>{new Date(testSuite.startDate).toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>End Time:</Text>
                            <Text style={styles.detailValue}>{testSuite.endDate ? new Date(testSuite.endDate).toLocaleString('id-ID') : 'IN PROGRESS'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailKey}>Total Duration:</Text>
                            <Text style={{ ...styles.detailValue, fontWeight: 'extrabold', color: PRIMARY_COLOR }}>
                                {durationDisplay(testSuite)}
                            </Text>
                        </View>
                        <View style={{ ...styles.detailRow, marginTop: 8 }}>
                            <Text style={styles.detailKey}>Pass Rate:</Text>
                            <Text style={{ ...styles.detailValue, fontWeight: 'extrabold', color: SUCCESS_COLOR }}>
                                {passRate.toFixed(2)}%
                            </Text>
                        </View>
                    </View>

                    {/* Kolom Kanan: Grafik */}
                    <View style={{ width: '45%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.sectionTitle}>Execution Summary Chart</Text>
                        {pieChartImage && (
                            <Image 
                                src={pieChartImage} 
                                style={{ width: 180, height: 180, marginTop: 10 }} 
                            />
                        )}
                    </View>
                </View>
                
                {/* 3. Detail Lingkungan */}
                <Text style={styles.sectionTitle}>Environment Details</Text>
                <View style={{ flexDirection: 'row', marginBottom: 15, fontSize: 10 }}>
                    <View style={{ width: '33%' }}>
                        <Text style={styles.detailKey}>Stage: <Text style={styles.detailValue}>{testSuite.testStage}</Text></Text>
                        <Text style={styles.detailKey}>Environment: <Text style={styles.detailValue}>{testSuite.testEnvironment}</Text></Text>
                    </View>
                    <View style={{ width: '33%' }}>
                        <Text style={styles.detailKey}>OS: <Text style={styles.detailValue}>{testSuite.os}</Text></Text>
                        <Text style={styles.detailKey}>Browser: <Text style={styles.detailValue}>{testSuite.browser}</Text></Text>
                    </View>
                    <View style={{ width: '34%' }}>
                        <Text style={styles.detailKey}>Hostname: <Text style={styles.detailValue}>{testSuite.hostname}</Text></Text>
                        <Text style={styles.detailKey}>App Version: <Text style={styles.detailValue}>{testSuite.version}</Text></Text>
                    </View>
                </View>
                
                {/* 4. Detail Test Case */}
                <Text style={styles.sectionTitle}>Detailed Test Case Log</Text>

                {/* Kontainer Tabel */}
                <View style={styles.table}>
                    {/* Header Tabel */}
                    <View style={styles.tableRow} fixed>
                        <View style={{ ...styles.tableColHeader, width: '8%' }}><Text>ID</Text></View>
                        <View style={{ ...styles.tableColHeader, width: '12%' }}><Text>Status</Text></View>
                        <View style={{ ...styles.tableColHeader, width: '25%' }}><Text>Nama Test Case</Text></View>
                        <View style={{ ...styles.tableColHeader, width: '55%', borderRightWidth: 0 }}><Text>Hasil & Catatan</Text></View>
                    </View>
                
                    {/* Isi Tabel */}
                    {testSuite.runDetails.map((detail: RunDetail) => (
                        <View style={styles.tableRow} key={detail.id} wrap={false}>
                            <View style={{ ...styles.tableColContent, width: '8%' }}><Text>{detail.idTestCase}</Text></View>
                            <View style={{ ...styles.tableColContent, width: '12%', textAlign: 'center' }}>
                                <Text style={getStatusStyle(detail.status)}>
                                    {detail.status}
                                </Text>
                            </View>
                            <View style={{ ...styles.tableColContent, width: '25%' }}><Text>{detail.testCaseName}</Text></View>
                            <View style={{ ...styles.tableColContent, width: '55%', borderRightWidth: 0 }}>
                                <Text style={{ fontWeight: 'bold' }}>Hasil Aktual: {detail.actualResult}</Text>
                                <Text style={{ marginTop: 2 }}>Catatan: {detail.remarks || '-'}</Text>
                            </View>
                        </View>
                    ))}
                </View>
                
                {/* Footer */}
                <Text style={styles.footer} 
                    render={({ pageNumber, totalPages }) => (`Report generated on ${new Date().toLocaleDateString('id-ID')} | Page ${pageNumber} of ${totalPages}`)} 
                    fixed 
                />
            </Page>
        </Document>
    );
};

export default ReportDocument;