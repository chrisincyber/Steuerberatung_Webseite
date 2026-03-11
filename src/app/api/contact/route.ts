import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, source } = await request.json() as {
      name: string
      email: string
      phone?: string
      message?: string
      source?: string
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Petertil Tax <noreply@petertiltax.ch>',
      to: ['info@petertiltax.ch'],
      replyTo: email,
      subject: `Steuerberatung Anfrage${source ? ` — ${source}` : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #102a43; padding: 24px; text-align: center;">
            <h1 style="color: #c49a2e; margin: 0; font-size: 20px;">Neue Beratungsanfrage</h1>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #486581; font-weight: bold;">Name:</td><td style="padding: 8px 0; color: #243b53;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #486581; font-weight: bold;">E-Mail:</td><td style="padding: 8px 0; color: #243b53;">${email}</td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #486581; font-weight: bold;">Telefon:</td><td style="padding: 8px 0; color: #243b53;">${phone}</td></tr>` : ''}
              ${source ? `<tr><td style="padding: 8px 0; color: #486581; font-weight: bold;">Quelle:</td><td style="padding: 8px 0; color: #243b53;">${source}</td></tr>` : ''}
            </table>
            ${message ? `<div style="margin-top: 16px; padding: 16px; background: #f0f4f8; border-radius: 8px;"><p style="color: #486581; font-weight: bold; margin: 0 0 8px;">Nachricht:</p><p style="color: #243b53; margin: 0; white-space: pre-wrap;">${message}</p></div>` : ''}
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
