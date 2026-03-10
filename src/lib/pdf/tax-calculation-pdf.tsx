import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const navy = '#102a43'
const navyLight = '#486581'
const navyMuted = '#829ab1'
const gold = '#c49a2e'
const bgLight = '#f0f4f8'

const s = StyleSheet.create({
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

interface TaxPdfData {
  locale: 'de' | 'en'
  calculatedAt: string
  mode: 'simple' | 'complex'
  form: {
    taxYear: number
    grossIncome: string
    canton: string
    maritalStatus: string
    children: number
    municipalityName?: string
    confession?: string
    income2?: string
    fortune?: string
  }
  result: {
    source: 'estv' | 'fallback'
    federalTax: number
    cantonalTax: number
    municipalTax: number
    churchTax?: number
    fortuneTax?: number
    totalTax: number
    effectiveRate: number
    taxableIncome?: number
  }
}

const labels = {
  de: {
    title: 'Steuerberechnung',
    subtitle: 'Erstellt mit dem Petertil Tax Steuerrechner',
    date: 'Berechnet am',
    inputs: 'Eingaben',
    taxYear: 'Steuerjahr',
    grossIncome: 'Bruttoeinkommen',
    canton: 'Kanton',
    municipality: 'Gemeinde',
    maritalStatus: 'Zivilstand',
    children: 'Kinder',
    confession: 'Konfession',
    fortune: 'Vermögen',
    income2: 'Einkommen Person 2',
    results: 'Ergebnisse',
    taxableIncome: 'Steuerbares Einkommen',
    federal: 'Bundessteuer',
    cantonal: 'Kantonssteuer',
    municipal: 'Gemeindesteuer',
    churchTax: 'Kirchensteuer',
    fortuneTax: 'Vermögenssteuer',
    total: 'Total Steuerbelastung',
    effectiveRate: 'Effektiver Steuersatz',
    disclaimerTitle: 'Rechtlicher Hinweis',
    disclaimerText: 'Die Ergebnisse sind unverbindliche Schätzungen ohne Gewähr auf Richtigkeit oder Vollständigkeit. Es wird keine Haftung für die Korrektheit der Ergebnisse übernommen. Die Nutzung erfolgt auf eigenes Risiko. Die Berechnung stellt keine Steuerberatung dar und ersetzt keine professionelle Steuerberatung. Die Berechnungsdaten stammen aus dem ESTV-Steuerrechner. Es besteht keine Verbindung zur ESTV oder zur Schweizerischen Eidgenossenschaft. Steuersätze und Abzüge können sich jährlich ändern.',
    maritalOptions: { single: 'Ledig', married: 'Verheiratet', divorced: 'Geschieden', widowed: 'Verwitwet' } as Record<string, string>,
    confessionOptions: { none: 'Keine', protestant: 'Evangelisch-ref.', catholic: 'Röm.-kath.', christCatholic: 'Christkath.' } as Record<string, string>,
  },
  en: {
    title: 'Tax Calculation',
    subtitle: 'Generated with the Petertil Tax Calculator',
    date: 'Calculated on',
    inputs: 'Inputs',
    taxYear: 'Tax Year',
    grossIncome: 'Gross Income',
    canton: 'Canton',
    municipality: 'Municipality',
    maritalStatus: 'Marital Status',
    children: 'Children',
    confession: 'Confession',
    fortune: 'Fortune',
    income2: 'Income Person 2',
    results: 'Results',
    taxableIncome: 'Taxable Income',
    federal: 'Federal Tax',
    cantonal: 'Cantonal Tax',
    municipal: 'Municipal Tax',
    churchTax: 'Church Tax',
    fortuneTax: 'Wealth Tax',
    total: 'Total Tax',
    effectiveRate: 'Effective Tax Rate',
    disclaimerTitle: 'Legal Notice',
    disclaimerText: 'Results are non-binding estimates with no guarantee of accuracy or completeness. No liability is accepted for the correctness of the results. Use at your own risk. This does not constitute tax advice and does not replace professional tax consultation. Calculation data is sourced from the ESTV tax calculator. There is no affiliation with ESTV or the Swiss Confederation. Tax rates and deductions may change annually.',
    maritalOptions: { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed' } as Record<string, string>,
    confessionOptions: { none: 'None', protestant: 'Protestant', catholic: 'Catholic', christCatholic: 'Christ Catholic' } as Record<string, string>,
  },
}

function formatCHF(amount: number) {
  return `CHF ${amount.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  )
}

export function TaxCalculationPdf({ data }: { data: TaxPdfData }) {
  const l = labels[data.locale]
  const { form, result } = data

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerText}>Petertil Tax</Text>
          <Text style={s.headerSub}>{l.subtitle}</Text>
        </View>

        <Text style={s.title}>{l.title}</Text>
        <Text style={s.date}>{l.date}: {data.calculatedAt}</Text>

        <Text style={s.sectionTitle}>{l.inputs}</Text>
        <Row label={l.taxYear} value={String(form.taxYear)} />
        <Row label={l.grossIncome} value={formatCHF(parseFloat(form.grossIncome) || 0)} />
        <Row label={l.canton} value={form.canton} />
        {form.municipalityName && <Row label={l.municipality} value={form.municipalityName} />}
        <Row label={l.maritalStatus} value={l.maritalOptions[form.maritalStatus] || form.maritalStatus} />
        <Row label={l.children} value={String(form.children)} />
        {form.confession && <Row label={l.confession} value={l.confessionOptions[form.confession] || form.confession} />}
        {form.income2 && parseFloat(form.income2) > 0 && <Row label={l.income2} value={formatCHF(parseFloat(form.income2))} />}
        {form.fortune && parseFloat(form.fortune) > 0 && <Row label={l.fortune} value={formatCHF(parseFloat(form.fortune))} />}

        <Text style={s.sectionTitle}>{l.results}</Text>
        {result.taxableIncome !== undefined && result.taxableIncome > 0 && (
          <Row label={l.taxableIncome} value={formatCHF(result.taxableIncome)} />
        )}
        <Row label={l.federal} value={formatCHF(result.federalTax)} />
        <Row label={l.cantonal} value={formatCHF(result.cantonalTax)} />
        <Row label={l.municipal} value={formatCHF(result.municipalTax)} />
        {result.churchTax !== undefined && result.churchTax > 0 && (
          <Row label={l.churchTax} value={formatCHF(result.churchTax)} />
        )}
        {result.fortuneTax !== undefined && result.fortuneTax > 0 && (
          <Row label={l.fortuneTax} value={formatCHF(result.fortuneTax)} />
        )}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{l.total}</Text>
          <Text style={s.totalValue}>{formatCHF(result.totalTax)}</Text>
        </View>
        <Row label={l.effectiveRate} value={`${result.effectiveRate}%`} />

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>{l.disclaimerTitle}</Text>
          <Text style={s.disclaimerText}>{l.disclaimerText}</Text>
        </View>

        <Text style={s.footer}>petertiltax.ch</Text>
      </Page>
    </Document>
  )
}

export type { TaxPdfData }
