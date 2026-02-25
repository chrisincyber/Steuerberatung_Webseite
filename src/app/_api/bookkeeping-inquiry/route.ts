import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, phone, email, employment } = await request.json() as {
      firstName: string
      lastName: string
      phone: string
      email: string
      employment: string
    }

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const employmentLabel = employment === 'selbstaendig' ? 'Selbständig' : 'GmbH / AG'

    await getResend().emails.send({
      from: 'Petertil Tax <noreply@petertiltax.ch>',
      to: ['info@petertiltax.ch'],
      subject: `Buchhaltungsanfrage von ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #102a43; padding: 24px; text-align: center;">
            <h1 style="color: #c49a2e; margin: 0; font-size: 20px;">Petertil Tax</h1>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <h2 style="color: #243b53; margin: 0 0 16px;">Neue Buchhaltungsanfrage</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #486581; font-weight: 600;">Vorname:</td>
                <td style="padding: 8px 0; color: #243b53;">${firstName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #486581; font-weight: 600;">Nachname:</td>
                <td style="padding: 8px 0; color: #243b53;">${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #486581; font-weight: 600;">Telefon:</td>
                <td style="padding: 8px 0; color: #243b53;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #486581; font-weight: 600;">E-Mail:</td>
                <td style="padding: 8px 0; color: #243b53;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #486581; font-weight: 600;">Situation:</td>
                <td style="padding: 8px 0; color: #243b53;">${employmentLabel}</td>
              </tr>
            </table>
            <p style="color: #486581; margin-top: 24px; font-size: 14px;">
              Bitte innert 48 Stunden kontaktieren.
            </p>
          </div>
          <div style="padding: 16px 24px; background: #f0f4f8; text-align: center;">
            <p style="color: #829ab1; font-size: 12px; margin: 0;">
              Petertil Tax | Schweiz
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bookkeeping inquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to send inquiry' },
      { status: 500 },
    )
  }
}
