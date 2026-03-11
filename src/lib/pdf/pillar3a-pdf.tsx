import React from 'react'
import { Text } from '@react-pdf/renderer'
import { ToolPdfLayout, PdfRow, PdfTotalRow, formatCHF, pdfStyles } from './tool-pdf-layout'

export interface Pillar3aPdfData {
  locale: 'de' | 'en'
  calculatedAt: string
  inputs: {
    grossIncome: number
    canton: string
    maritalStatus: string
    hasPK: boolean
    contribution: number
  }
  results: {
    taxWithout: number
    taxWith: number
    annualSavings: number
    returnPercent: number
    over10Years: number
    over20Years: number
  }
}

const labels = {
  de: {
    title: 'Säule 3a Steuerersparnis',
    subtitle: 'Erstellt mit dem Petertil Tax 3a-Rechner',
    date: 'Berechnet am',
    inputs: 'Eingaben',
    grossIncome: 'Bruttoeinkommen',
    canton: 'Kanton',
    maritalStatus: 'Zivilstand',
    pensionFund: 'Pensionskasse',
    contribution: '3a-Beitrag',
    results: 'Ergebnisse',
    taxWithout: 'Steuer ohne 3a',
    taxWith: 'Steuer mit 3a',
    annualSavings: 'Jährliche Ersparnis',
    returnPercent: 'Rendite',
    over10Years: 'Über 10 Jahre',
    over20Years: 'Über 20 Jahre',
    yes: 'Ja',
    no: 'Nein',
    disclaimer: 'Die Ergebnisse sind unverbindliche Schätzungen ohne Gewähr auf Richtigkeit oder Vollständigkeit. Es wird keine Haftung für die Korrektheit der Ergebnisse übernommen. Die Nutzung erfolgt auf eigenes Risiko. Die Berechnung stellt keine Steuerberatung dar und ersetzt keine professionelle Steuerberatung.',
    maritalOptions: { single: 'Ledig', married: 'Verheiratet', divorced: 'Geschieden', widowed: 'Verwitwet' } as Record<string, string>,
  },
  en: {
    title: 'Pillar 3a Tax Savings',
    subtitle: 'Generated with the Petertil Tax 3a Calculator',
    date: 'Calculated on',
    inputs: 'Inputs',
    grossIncome: 'Gross Income',
    canton: 'Canton',
    maritalStatus: 'Marital Status',
    pensionFund: 'Pension Fund',
    contribution: '3a Contribution',
    results: 'Results',
    taxWithout: 'Tax without 3a',
    taxWith: 'Tax with 3a',
    annualSavings: 'Annual Savings',
    returnPercent: 'Return',
    over10Years: 'Over 10 Years',
    over20Years: 'Over 20 Years',
    yes: 'Yes',
    no: 'No',
    disclaimer: 'Results are non-binding estimates with no guarantee of accuracy or completeness. No liability is accepted for the correctness of the results. Use at your own risk. This does not constitute tax advice and does not replace professional tax consultation.',
    maritalOptions: { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed' } as Record<string, string>,
  },
}

export function Pillar3aPdf({ data }: { data: Pillar3aPdfData }) {
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
      <PdfRow label={l.maritalStatus} value={l.maritalOptions[inputs.maritalStatus] || inputs.maritalStatus} />
      <PdfRow label={l.pensionFund} value={inputs.hasPK ? l.yes : l.no} />
      <PdfRow label={l.contribution} value={formatCHF(inputs.contribution)} />

      <Text style={pdfStyles.sectionTitle}>{l.results}</Text>
      <PdfRow label={l.taxWithout} value={formatCHF(results.taxWithout)} />
      <PdfRow label={l.taxWith} value={formatCHF(results.taxWith)} />
      <PdfTotalRow label={l.annualSavings} value={formatCHF(results.annualSavings)} />
      <PdfRow label={l.returnPercent} value={`${results.returnPercent}%`} />
      <PdfRow label={l.over10Years} value={formatCHF(results.over10Years)} />
      <PdfRow label={l.over20Years} value={formatCHF(results.over20Years)} />
    </ToolPdfLayout>
  )
}
