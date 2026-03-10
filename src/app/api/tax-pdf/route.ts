import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { TaxCalculationPdf } from '@/lib/pdf/tax-calculation-pdf'
import type { TaxPdfData } from '@/lib/pdf/tax-calculation-pdf'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      pdfData: TaxPdfData
      saveToAccount?: boolean
      formState?: Record<string, unknown>
      resultData?: Record<string, unknown>
      mode?: 'simple' | 'complex'
    }

    const { pdfData, saveToAccount, formState, resultData, mode } = body

    const buffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(TaxCalculationPdf, { data: pdfData }) as any
    )

    if (saveToAccount && formState && resultData) {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const municipalityName = (formState.selectedCity as { name?: string })?.name || ''
        const defaultName = pdfData.locale === 'de'
          ? `Steuerberechnung ${municipalityName} ${pdfData.calculatedAt}`
          : `Tax Calculation ${municipalityName} ${pdfData.calculatedAt}`

        await supabase.from('tax_calculations').insert({
          user_id: user.id,
          name: defaultName.trim(),
          form_data: formState,
          result_data: resultData,
          mode: mode || 'simple',
          locale: pdfData.locale,
        })
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="steuerberechnung-${pdfData.form.taxYear}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
