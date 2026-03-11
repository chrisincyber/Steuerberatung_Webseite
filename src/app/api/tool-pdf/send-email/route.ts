import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { Resend } from 'resend'
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
    const { fullName, email, phone, toolType, pdfData } = await request.json() as {
      fullName: string
      email: string
      phone: string
      toolType: ToolType
      pdfData: Pillar3aPdfData | QuellensteuerPdfData | ChecklistePdfData | SteuervergleichPdfData
    }

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Select correct PDF component
    let element: React.ReactElement
    let filename: string
    let subjectDE: string
    let subjectEN: string

    switch (toolType) {
      case '3a-rechner':
        element = React.createElement(Pillar3aPdf, { data: pdfData as Pillar3aPdfData })
        filename = '3a-rechner.pdf'
        subjectDE = 'Ihre Säule 3a Berechnung'
        subjectEN = 'Your Pillar 3a Calculation'
        break
      case 'quellensteuer':
        element = React.createElement(QuellensteuerPdf, { data: pdfData as QuellensteuerPdfData })
        filename = 'quellensteuer.pdf'
        subjectDE = 'Ihre Quellensteuer-Analyse'
        subjectEN = 'Your Withholding Tax Analysis'
        break
      case 'checkliste':
        element = React.createElement(ChecklistePdf, { data: pdfData as ChecklistePdfData })
        filename = 'steuer-checkliste.pdf'
        subjectDE = 'Ihre Steuer-Checkliste'
        subjectEN = 'Your Tax Checklist'
        break
      case 'steuervergleich':
        element = React.createElement(SteuervergleichPdf, { data: pdfData as SteuervergleichPdfData })
        filename = 'steuervergleich.pdf'
        subjectDE = 'Ihr Steuervergleich'
        subjectEN = 'Your Tax Comparison'
        break
      default:
        return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const locale = (pdfData as { locale?: string }).locale || 'de'
    const isDE = locale === 'de'
    const firstName = fullName.split(' ')[0]

    await resend.emails.send({
      from: 'Petertil Tax <noreply@petertiltax.ch>',
      to: [email],
      subject: isDE ? subjectDE : subjectEN,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #102a43; padding: 24px; text-align: center;">
            <h1 style="color: #c49a2e; margin: 0; font-size: 20px;">Petertil Tax</h1>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <p style="color: #243b53; line-height: 1.6;">
              ${isDE ? `Guten Tag ${firstName},` : `Hello ${firstName},`}
            </p>
            <p style="color: #486581; line-height: 1.6;">
              ${isDE
                ? 'Anbei finden Sie Ihr Ergebnis als PDF.'
                : 'Please find your result attached as a PDF.'}
            </p>
            <p style="color: #486581; line-height: 1.6;">
              ${isDE
                ? 'Möchten Sie Ihre Steuererklärung professionell erstellen lassen? Registrieren Sie sich kostenlos:'
                : 'Would you like professional help with your tax declaration? Register for free:'}
            </p>
            <div style="margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://petertiltax.ch'}/auth/register"
                 style="display: inline-block; background: #243b53; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                ${isDE ? 'Jetzt registrieren' : 'Register now'}
              </a>
            </div>
          </div>
          <div style="padding: 16px 24px; background: #f0f4f8; text-align: center;">
            <p style="color: #829ab1; font-size: 12px; margin: 0;">
              petertiltax.ch | info@petertiltax.ch
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: buffer,
        },
      ],
    })

    // Save lead to database
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from('leads').insert({
        full_name: fullName,
        email,
        phone: phone || null,
        tool_type: toolType,
        form_data: pdfData,
        locale,
      })
    } catch (e) {
      console.error('Failed to save lead:', e)
      // Don't fail the request if lead save fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tool PDF send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
