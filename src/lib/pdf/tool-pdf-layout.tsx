import React, { ReactNode } from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const navy = '#102a43'
const navyLight = '#486581'
const navyMuted = '#829ab1'
const gold = '#c49a2e'
const bgLight = '#f0f4f8'

export const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: navy },
  header: { backgroundColor: navy, padding: 20, marginBottom: 20, marginHorizontal: -40, marginTop: -40 },
  headerText: { color: gold, fontSize: 18, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  headerSub: { color: '#d9e2ec', fontSize: 9, textAlign: 'center', marginTop: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: navy, marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  date: { fontSize: 9, color: navyMuted, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: navy, marginBottom: 8, marginTop: 16, fontFamily: 'Helvetica-Bold', borderBottomWidth: 1, borderBottomColor: bgLight, paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  rowLabel: { color: navyLight, fontSize: 10 },
  rowValue: { fontWeight: 'bold', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: bgLight, paddingHorizontal: 8, borderRadius: 4, marginTop: 4 },
  totalLabel: { fontWeight: 'bold', fontSize: 12, fontFamily: 'Helvetica-Bold' },
  totalValue: { fontWeight: 'bold', fontSize: 14, fontFamily: 'Helvetica-Bold' },
  disclaimer: { marginTop: 24, padding: 12, backgroundColor: bgLight, borderRadius: 4 },
  disclaimerTitle: { fontSize: 8, fontWeight: 'bold', color: navyLight, marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  disclaimerText: { fontSize: 7, color: navyMuted, lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: navyMuted },
})

export function formatCHF(amount: number) {
  return `CHF ${amount.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
}

export function PdfRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.row}>
      <Text style={pdfStyles.rowLabel}>{label}</Text>
      <Text style={pdfStyles.rowValue}>{value}</Text>
    </View>
  )
}

export function PdfTotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.totalRow}>
      <Text style={pdfStyles.totalLabel}>{label}</Text>
      <Text style={pdfStyles.totalValue}>{value}</Text>
    </View>
  )
}

interface ToolPdfLayoutProps {
  title: string
  subtitle: string
  date: string
  disclaimer: string
  children: ReactNode
}

export function ToolPdfLayout({ title, subtitle, date, disclaimer, children }: ToolPdfLayoutProps) {
  const disclaimerTitle = disclaimer.startsWith('Die ') || disclaimer.startsWith('Diese ')
    ? 'Rechtlicher Hinweis'
    : 'Legal Notice'

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerText}>Petertil Tax</Text>
          <Text style={pdfStyles.headerSub}>{subtitle}</Text>
        </View>

        <Text style={pdfStyles.title}>{title}</Text>
        <Text style={pdfStyles.date}>{date}</Text>

        {children}

        <View style={pdfStyles.disclaimer}>
          <Text style={pdfStyles.disclaimerTitle}>{disclaimerTitle}</Text>
          <Text style={pdfStyles.disclaimerText}>{disclaimer}</Text>
        </View>

        <Text style={pdfStyles.footer}>petertiltax.ch | info@petertiltax.ch</Text>
      </Page>
    </Document>
  )
}
