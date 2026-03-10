import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { Resend } from 'resend'
import { TaxCalculationPdf } from '@/lib/pdf/tax-calculation-pdf'
import type { TaxPdfData } from '@/lib/pdf/tax-calculation-pdf'

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, pdfData } = await request.json() as {
      fullName: string
      email: string
      phone: string
      pdfData: TaxPdfData
    }

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const buffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(TaxCalculationPdf, { data: pdfData }) as any
    )

    const resend = new Resend(process.env.RESEND_API_KEY)

    const isDE = pdfData.locale === 'de'
    const firstName = fullName.split(' ')[0]

    await resend.emails.send({
      from: 'Petertil Tax <noreply@petertiltax.ch>',
      to: [email],
      subject: isDE ? 'Ihre Steuerberechnung' : 'Your Tax Calculation',
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
                ? 'Anbei finden Sie Ihre Steuerberechnung als PDF.'
                : 'Please find your tax calculation attached as a PDF.'}
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
              Petertil Tax | Schweiz
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `steuerberechnung-${pdfData.form.taxYear}.pdf`,
          content: buffer,
        },
      ],
    })

    // Store the lead info if phone is provided (optional: for follow-up)
    if (phone) {
      console.log(`Tax PDF lead: ${fullName}, ${email}, ${phone}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
