import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { ToolPdfLayout, pdfStyles } from './tool-pdf-layout'

export interface ChecklistePdfData {
  locale: 'de' | 'en'
  calculatedAt: string
  situations: string[]
  essentialDocs: string[]
  additionalDocs: string[]
  tip: string | null
}

const localStyles = StyleSheet.create({
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  checkbox: { width: 12, height: 12, borderWidth: 1, borderColor: '#486581', borderRadius: 2, marginRight: 8, marginTop: 1 },
  checkText: { fontSize: 10, color: '#102a43', flex: 1, lineHeight: 1.4 },
  tipBox: { marginTop: 16, padding: 12, backgroundColor: '#f0f4f8', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#c49a2e' },
  tipTitle: { fontSize: 10, fontWeight: 'bold', color: '#102a43', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  tipText: { fontSize: 9, color: '#486581', lineHeight: 1.5 },
  situationTag: { fontSize: 9, color: '#486581', marginBottom: 12 },
})

const labels = {
  de: {
    title: 'Steuer-Checkliste',
    subtitle: 'Erstellt mit dem Petertil Tax Checklisten-Tool',
    date: 'Erstellt am',
    situations: 'Ihre Situation',
    essentialDocs: 'Grundlegende Dokumente',
    additionalDocs: 'Zusätzliche Dokumente',
    tip: 'Tipp',
    disclaimer: 'Diese Checkliste ist eine allgemeine Orientierungshilfe und erhebt keinen Anspruch auf Vollständigkeit. Je nach individueller Situation können weitere Unterlagen erforderlich sein. Die Nutzung erfolgt auf eigenes Risiko und ersetzt keine professionelle Steuerberatung.',
  },
  en: {
    title: 'Tax Checklist',
    subtitle: 'Generated with the Petertil Tax Checklist Tool',
    date: 'Created on',
    situations: 'Your Situation',
    essentialDocs: 'Essential Documents',
    additionalDocs: 'Additional Documents',
    tip: 'Tip',
    disclaimer: 'This checklist is a general guide and does not claim to be complete. Depending on your individual situation, additional documents may be required. Use at your own risk and this does not replace professional tax consultation.',
  },
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={localStyles.checkItem}>
      <View style={localStyles.checkbox} />
      <Text style={localStyles.checkText}>{text}</Text>
    </View>
  )
}

export function ChecklistePdf({ data }: { data: ChecklistePdfData }) {
  const l = labels[data.locale]

  return (
    <ToolPdfLayout
      title={l.title}
      subtitle={l.subtitle}
      date={`${l.date}: ${data.calculatedAt}`}
      disclaimer={l.disclaimer}
    >
      <Text style={pdfStyles.sectionTitle}>{l.situations}</Text>
      <Text style={localStyles.situationTag}>{data.situations.join(', ')}</Text>

      <Text style={pdfStyles.sectionTitle}>{l.essentialDocs}</Text>
      {data.essentialDocs.map((doc, i) => (
        <CheckItem key={`e-${i}`} text={doc} />
      ))}

      {data.additionalDocs.length > 0 && (
        <>
          <Text style={pdfStyles.sectionTitle}>{l.additionalDocs}</Text>
          {data.additionalDocs.map((doc, i) => (
            <CheckItem key={`a-${i}`} text={doc} />
          ))}
        </>
      )}

      {data.tip && (
        <View style={localStyles.tipBox}>
          <Text style={localStyles.tipTitle}>{l.tip}</Text>
          <Text style={localStyles.tipText}>{data.tip}</Text>
        </View>
      )}
    </ToolPdfLayout>
  )
}
