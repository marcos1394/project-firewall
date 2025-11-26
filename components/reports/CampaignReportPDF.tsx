/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Estilos del PDF (Parecido a CSS pero limitado)
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 40 },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#111827', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subBrand: { fontSize: 10, color: '#6B7280' },
  titleSection: { marginTop: 20, marginBottom: 30 },
  reportTitle: { fontSize: 24, color: '#111827', fontWeight: 'bold' },
  metaData: { fontSize: 10, color: '#4B5563', marginTop: 5 },
  
  // KPI Cards Grid
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  kpiCard: { width: '30%', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 5 },
  kpiLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase' },
  kpiValue: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 5 },
  
  // Tabla
  table: { width: 'auto', borderWidth: 1, borderColor: '#E5E7EB', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '33%', borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#F9FAFB', padding: 8 },
  tableCol: { width: '33%', borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB', borderLeftWidth: 0, borderTopWidth: 0, padding: 8 },
  tableCellHeader: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  tableCell: { fontSize: 10, color: '#111827' },
  
  // Status Colors
  textRed: { color: '#DC2626', fontWeight: 'bold' },
  textGreen: { color: '#059669', fontWeight: 'bold' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#9CA3AF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10 }
});

// Tipos de datos
interface ReportProps {
  campaign: any;
  targets: any[];
}

export const CampaignReportPDF = ({ campaign, targets }: ReportProps) => {
  const total = targets.length;
  const clicked = targets.filter(t => t.status === 'clicked' || t.status === 'trained').length;
  const trained = targets.filter(t => t.status === 'trained').length;
  const riskRate = total > 0 ? Math.round((clicked / total) * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.brand}>KINETIS SECURITY</Text>
                <Text style={styles.subBrand}>Auditoría de Vulnerabilidad Humana</Text>
            </View>
            <View>
                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>CONFIDENCIAL</Text>
            </View>
        </View>

        {/* Título */}
        <View style={styles.titleSection}>
            <Text style={styles.reportTitle}>Reporte de Campaña</Text>
            <Text style={styles.metaData}>Operación: {campaign.name}</Text>
            <Text style={styles.metaData}>Fecha: {new Date(campaign.created_at).toLocaleDateString()}</Text>
            <Text style={styles.metaData}>ID: {campaign.id}</Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Empleados Auditados</Text>
                <Text style={styles.kpiValue}>{total}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: clicked > 0 ? '#FEF2F2' : '#ECFDF5' }]}>
                <Text style={styles.kpiLabel}>Vulnerables</Text>
                <Text style={[styles.kpiValue, { color: clicked > 0 ? '#DC2626' : '#059669' }]}>{clicked}</Text>
            </View>
            <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Tasa de Riesgo</Text>
                <Text style={styles.kpiValue}>{riskRate}%</Text>
            </View>
        </View>

        {/* Tabla de Resultados */}
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Detalle de Objetivos</Text>
        
        <View style={styles.table}>
            {/* Header Tabla */}
            <View style={styles.tableRow}>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Email</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Estado</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Acción Tomada</Text></View>
            </View>
            
            {/* Filas */}
            {targets.map((target) => (
                <View style={styles.tableRow} key={target.id}>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{target.email}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>
                            {target.status === 'clicked' ? 'VULNERABLE' : 
                             target.status === 'trained' ? 'RECUPERADO' : 
                             target.status === 'sent' ? 'ENVIADO' : target.status.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.tableCol}>
                        {target.status === 'clicked' ? (
                            <Text style={[styles.tableCell, styles.textRed]}>Hizo Clic (Fallo)</Text>
                        ) : target.status === 'trained' ? (
                            <Text style={[styles.tableCell, styles.textGreen]}>Capacitación Completa</Text>
                        ) : (
                            <Text style={[styles.tableCell, {color: '#9CA3AF'}]}>Sin interacción</Text>
                        )}
                    </View>
                </View>
            ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <Text>Generado automáticamente por Kinetis Security Platform. Este documento contiene información sensible.</Text>
            <Text>© 2025 Kinetis Organization.</Text>
        </View>

      </Page>
    </Document>
  );
};