import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Pillar3aPdf } from '@/lib/pdf/pillar3a-pdf'
import type { Pillar3aPdfData } from '@/lib/pdf/pillar3a-pdf'
import { QuellensteuerPdf } from '@/lib/pdf/quellensteuer-pdf'
import type { QuellensteuerPdfData } from '@/lib/pdf/quellensteuer-pdf'
import { ChecklistePdf } from '@/lib/pdf/checkliste-pdf'
import type { ChecklistePdfData } from '@/lib/pdf/checkliste-pdf'
import { SteuervergleichPdf } from '@/lib/pdf/steuervergleich-pdf'
import type { SteuervergleichPdfData } from '@/lib/pdf/steuervergleich-pdf'

type ToolType = '3a-rechner' | 'quellensteuer' | 'checkliste' | 'steuervergleich'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      toolType: ToolType
      pdfData: Pillar3aPdfData | QuellensteuerPdfData | ChecklistePdfData | SteuervergleichPdfData
      saveToAccount?: boolean
      formData?: Record<string, unknown>
      resultData?: Record<string, unknown>
    }

    const { toolType, pdfData, saveToAccount, formData, resultData } = body

    // Select correct PDF component based on toolType
    let element: React.ReactElement
    let filename: string

    switch (toolType) {
      case '3a-rechner':
        element = React.createElement(Pillar3aPdf, { data: pdfData as Pillar3aPdfData })
        filename = `3a-rechner-${new Date().toISOString().split('T')[0]}.pdf`
        break
      case 'quellensteuer':
        element = React.createElement(QuellensteuerPdf, { data: pdfData as QuellensteuerPdfData })
        filename = `quellensteuer-${new Date().toISOString().split('T')[0]}.pdf`
        break
      case 'checkliste':
        element = React.createElement(ChecklistePdf, { data: pdfData as ChecklistePdfData })
        filename = `steuer-checkliste-${new Date().toISOString().split('T')[0]}.pdf`
        break
      case 'steuervergleich':
        element = React.createElement(SteuervergleichPdf, { data: pdfData as SteuervergleichPdfData })
        filename = `steuervergleich-${new Date().toISOString().split('T')[0]}.pdf`
        break
      default:
        return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    // Save to user's account if authenticated
    if (saveToAccount && formData && resultData) {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const locale = (pdfData as { locale?: string }).locale || 'de'
        const date = new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH')
        const toolNames: Record<string, { de: string; en: string }> = {
          '3a-rechner': { de: '3a-Rechner', en: 'Pillar 3a Calculator' },
          'quellensteuer': { de: 'Quellensteuer', en: 'Withholding Tax' },
          'checkliste': { de: 'Steuer-Checkliste', en: 'Tax Checklist' },
          'steuervergleich': { de: 'Steuervergleich', en: 'Tax Comparison' },
        }
        const toolName = toolNames[toolType]?.[locale as 'de' | 'en'] || toolType
        const defaultName = `${toolName} ${date}`

        await supabase.from('tax_calculations').insert({
          user_id: user.id,
          name: defaultName,
          form_data: formData,
          result_data: resultData,
          mode: 'simple',
          locale,
          tool_type: toolType,
        })
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Tool PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
