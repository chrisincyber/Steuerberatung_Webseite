import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { ToolPdfLayout, PdfRow, PdfTotalRow, formatCHF, pdfStyles } from './tool-pdf-layout'

export interface QuellensteuerPdfData {
  locale: 'de' | 'en'
  calculatedAt: string
  inputs: {
    grossIncome: number
    canton: string
    permitType: string
    married: boolean
    children: number
    churchTax: boolean
  }
  results: {
    tariffCode: string
    withholdingTax: number
    withholdingRate: number
    ordinaryTax: number
    difference: number
    recommendation: string
  }
}

const localStyles = StyleSheet.create({
  recommendation: { marginTop: 16, padding: 12, backgroundColor: '#f0f4f8', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#c49a2e' },
  recommendationTitle: { fontSize: 10, fontWeight: 'bold', color: '#102a43', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  recommendationText: { fontSize: 9, color: '#486581', lineHeight: 1.5 },
})

const labels = {
  de: {
    title: 'Quellensteuer-Analyse',
    subtitle: 'Erstellt mit dem Petertil Tax Quellensteuer-Rechner',
    date: 'Berechnet am',
    inputs: 'Eingaben',
    grossIncome: 'Bruttoeinkommen',
    canton: 'Kanton',
    permitType: 'Bewilligungstyp',
    maritalStatus: 'Zivilstand',
    children: 'Kinder',
    churchTax: 'Kirchensteuer',
    results: 'Ergebnisse',
    tariffCode: 'Tarifcode',
    withholdingTax: 'Quellensteuer',
    withholdingRate: 'Satz',
    ordinaryTax: 'Ordentliche Steuer',
    difference: 'Differenz',
    recommendation: 'Empfehlung',
    yes: 'Ja',
    no: 'Nein',
    married: 'Verheiratet',
    single: 'Ledig',
    disclaimer: 'Die Ergebnisse sind unverbindliche Schätzungen ohne Gewähr auf Richtigkeit oder Vollständigkeit. Es wird keine Haftung für die Korrektheit der Ergebnisse übernommen. Die Nutzung erfolgt auf eigenes Risiko. Die Berechnung stellt keine Steuerberatung dar und ersetzt keine professionelle Steuerberatung.',
  },
  en: {
    title: 'Withholding Tax Analysis',
    subtitle: 'Generated with the Petertil Tax Withholding Tax Calculator',
    date: 'Calculated on',
    inputs: 'Inputs',
    grossIncome: 'Gross Income',
    canton: 'Canton',
    permitType: 'Permit Type',
    maritalStatus: 'Marital Status',
    children: 'Children',
    churchTax: 'Church Tax',
    results: 'Results',
    tariffCode: 'Tariff Code',
    withholdingTax: 'Withholding Tax',
    withholdingRate: 'Rate',
    ordinaryTax: 'Ordinary Tax',
    difference: 'Difference',
    recommendation: 'Recommendation',
    yes: 'Yes',
    no: 'No',
    married: 'Married',
    single: 'Single',
    disclaimer: 'Results are non-binding estimates with no guarantee of accuracy or completeness. No liability is accepted for the correctness of the results. Use at your own risk. This does not constitute tax advice and does not replace professional tax consultation.',
  },
}

export function QuellensteuerPdf({ data }: { data: QuellensteuerPdfData }) {
  const l = labels[data.locale]
  const { inputs, results } = data

  return (
    <ToolPdfLayout
      title={l.title}
      subtitle={l.subtitle}
      date={`${l.date}: ${data.calculatedAt}`}
      disclaimer={l.disclaimer}
    >
      <Text style={pdfStyles.sectionTitle}>{l.inputs}</Text>
      <PdfRow label={l.grossIncome} value={formatCHF(inputs.grossIncome)} />
      <PdfRow label={l.canton} value={inputs.canton} />
      <PdfRow label={l.permitType} value={inputs.permitType} />
      <PdfRow label={l.maritalStatus} value={inputs.married ? l.married : l.single} />
      <PdfRow label={l.children} value={String(inputs.children)} />
      <PdfRow label={l.churchTax} value={inputs.churchTax ? l.yes : l.no} />

      <Text style={pdfStyles.sectionTitle}>{l.results}</Text>
      <PdfRow label={l.tariffCode} value={results.tariffCode} />
      <PdfRow label={l.withholdingTax} value={formatCHF(results.withholdingTax)} />
      <PdfRow label={l.withholdingRate} value={`${results.withholdingRate}%`} />
      <PdfRow label={l.ordinaryTax} value={formatCHF(results.ordinaryTax)} />
      <PdfTotalRow label={l.difference} value={formatCHF(results.difference)} />

      <View style={localStyles.recommendation}>
        <Text style={localStyles.recommendationTitle}>{l.recommendation}</Text>
        <Text style={localStyles.recommendationText}>{results.recommendation}</Text>
      </View>
    </ToolPdfLayout>
  )
}
