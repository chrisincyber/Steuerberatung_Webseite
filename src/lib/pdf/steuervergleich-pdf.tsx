import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { ToolPdfLayout, PdfRow, PdfTotalRow, formatCHF, pdfStyles } from './tool-pdf-layout'

export interface SteuervergleichPdfData {
  locale: 'de' | 'en'
  calculatedAt: string
  inputs: {
    grossIncome: number
    maritalStatus: string
    children: number
  }
  summary: {
    cheapest: { name: string; totalTax: number }
    mostExpensive: { name: string; totalTax: number }
    savings: number
  }
  cantonResults: { rank: number; name: string; code: string; totalTax: number; effectiveRate: number }[]
}

const localStyles = StyleSheet.create({
  tableHeader: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#102a43', marginTop: 4 },
  tableHeaderText: { fontSize: 8, fontWeight: 'bold', color: '#102a43', fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', backgroundColor: '#f0f4f8' },
  colRank: { width: '8%' },
  colCanton: { width: '37%' },
  colTax: { width: '30%', textAlign: 'right' },
  colRate: { width: '25%', textAlign: 'right' },
  cellText: { fontSize: 9, color: '#102a43' },
  cellTextMuted: { fontSize: 9, color: '#486581' },
})

const labels = {
  de: {
    title: 'Steuervergleich Schweiz',
    subtitle: 'Erstellt mit dem Petertil Tax Steuervergleich',
    date: 'Berechnet am',
    inputs: 'Eingaben',
    grossIncome: 'Bruttoeinkommen',
    maritalStatus: 'Zivilstand',
    children: 'Kinder',
    summary: 'Zusammenfassung',
    cheapest: 'Günstigster Kanton',
    mostExpensive: 'Teuerster Kanton',
    savings: 'Sparpotenzial',
    ranking: 'Kantonsranking',
    rank: '#',
    canton: 'Kanton',
    taxBurden: 'Steuerbelastung',
    effectiveRate: 'Eff. Steuersatz',
    disclaimer: 'Die Ergebnisse sind unverbindliche Schätzungen ohne Gewähr auf Richtigkeit oder Vollständigkeit. Es wird keine Haftung für die Korrektheit der Ergebnisse übernommen. Die Nutzung erfolgt auf eigenes Risiko. Die Berechnung stellt keine Steuerberatung dar und ersetzt keine professionelle Steuerberatung. Steuersätze und Abzüge können sich jährlich ändern.',
    maritalOptions: { single: 'Ledig', married: 'Verheiratet', divorced: 'Geschieden', widowed: 'Verwitwet' } as Record<string, string>,
  },
  en: {
    title: 'Swiss Tax Comparison',
    subtitle: 'Generated with the Petertil Tax Comparison Tool',
    date: 'Calculated on',
    inputs: 'Inputs',
    grossIncome: 'Gross Income',
    maritalStatus: 'Marital Status',
    children: 'Children',
    summary: 'Summary',
    cheapest: 'Cheapest Canton',
    mostExpensive: 'Most Expensive Canton',
    savings: 'Savings Potential',
    ranking: 'Canton Ranking',
    rank: '#',
    canton: 'Canton',
    taxBurden: 'Tax Burden',
    effectiveRate: 'Eff. Tax Rate',
    disclaimer: 'Results are non-binding estimates with no guarantee of accuracy or completeness. No liability is accepted for the correctness of the results. Use at your own risk. This does not constitute tax advice and does not replace professional tax consultation. Tax rates and deductions may change annually.',
    maritalOptions: { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed' } as Record<string, string>,
  },
}

export function SteuervergleichPdf({ data }: { data: SteuervergleichPdfData }) {
  const l = labels[data.locale]
  const { inputs, summary, cantonResults } = data

  return (
    <ToolPdfLayout
      title={l.title}
      subtitle={l.subtitle}
      date={`${l.date}: ${data.calculatedAt}`}
      disclaimer={l.disclaimer}
    >
      <Text style={pdfStyles.sectionTitle}>{l.inputs}</Text>
      <PdfRow label={l.grossIncome} value={formatCHF(inputs.grossIncome)} />
      <PdfRow label={l.maritalStatus} value={l.maritalOptions[inputs.maritalStatus] || inputs.maritalStatus} />
      <PdfRow label={l.children} value={String(inputs.children)} />

      <Text style={pdfStyles.sectionTitle}>{l.summary}</Text>
      <PdfRow label={l.cheapest} value={`${summary.cheapest.name} – ${formatCHF(summary.cheapest.totalTax)}`} />
      <PdfRow label={l.mostExpensive} value={`${summary.mostExpensive.name} – ${formatCHF(summary.mostExpensive.totalTax)}`} />
      <PdfTotalRow label={l.savings} value={formatCHF(summary.savings)} />

      <Text style={pdfStyles.sectionTitle}>{l.ranking}</Text>
      <View style={localStyles.tableHeader}>
        <Text style={[localStyles.tableHeaderText, localStyles.colRank]}>{l.rank}</Text>
        <Text style={[localStyles.tableHeaderText, localStyles.colCanton]}>{l.canton}</Text>
        <Text style={[localStyles.tableHeaderText, localStyles.colTax]}>{l.taxBurden}</Text>
        <Text style={[localStyles.tableHeaderText, localStyles.colRate]}>{l.effectiveRate}</Text>
      </View>
      {cantonResults.map((c, i) => (
        <View key={c.code} style={i % 2 === 1 ? localStyles.tableRowAlt : localStyles.tableRow}>
          <Text style={[localStyles.cellTextMuted, localStyles.colRank]}>{c.rank}</Text>
          <Text style={[localStyles.cellText, localStyles.colCanton]}>{c.name} ({c.code})</Text>
          <Text style={[localStyles.cellText, localStyles.colTax]}>{formatCHF(c.totalTax)}</Text>
          <Text style={[localStyles.cellTextMuted, localStyles.colRate]}>{c.effectiveRate}%</Text>
        </View>
      ))}
    </ToolPdfLayout>
  )
}
