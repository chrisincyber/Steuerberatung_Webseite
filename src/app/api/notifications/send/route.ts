import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

type NotificationTemplate = 'welcome' | 'documents_received' | 'in_progress' | 'completed' | 'payment_reminder' | 'deadline_reminder' | 'custom'

const EMAIL_TEMPLATES: Record<NotificationTemplate, { subject: string; body: string }> = {
  welcome: {
    subject: 'Willkommen bei Steuerberatung Petertil',
    body: 'Vielen Dank für Ihre Registrierung! Laden Sie Ihre Steuerunterlagen in Ihrem Dashboard hoch, um loszulegen.',
  },
  documents_received: {
    subject: 'Ihre Dokumente sind eingegangen',
    body: 'Wir haben Ihre Unterlagen erhalten und beginnen mit der Bearbeitung Ihrer Steuererklärung.',
  },
  in_progress: {
    subject: 'Ihre Steuererklärung wird bearbeitet',
    body: 'Gute Neuigkeiten! Ihre Steuererklärung ist jetzt in Bearbeitung. Wir melden uns, sobald sie fertig ist.',
  },
  completed: {
    subject: 'Ihre Steuererklärung ist fertig!',
    body: 'Ihre Steuererklärung ist abgeschlossen und steht in Ihrem Dashboard zum Download bereit.',
  },
  payment_reminder: {
    subject: 'Zahlungserinnerung',
    body: 'Wir möchten Sie freundlich an die offene Rechnung für Ihre Steuererklärung erinnern.',
  },
  deadline_reminder: {
    subject: 'Steuerfrist-Erinnerung',
    body: 'Die Einreichfrist für Ihre Steuererklärung rückt näher. Kontaktieren Sie uns, falls Sie Hilfe benötigen.',
  },
  custom: {
    subject: '',
    body: '',
  },
}

const SMS_TEMPLATES: Record<NotificationTemplate, string> = {
  welcome: 'Willkommen bei Steuerberatung Petertil! Starten Sie jetzt unter steuerberatung-petertil.ch',
  documents_received: 'Ihre Dokumente sind eingegangen. Wir beginnen mit der Bearbeitung.',
  in_progress: 'Ihre Steuererklärung wird jetzt bearbeitet. Wir melden uns bald!',
  completed: 'Ihre Steuererklärung ist fertig! Laden Sie sie in Ihrem Dashboard herunter.',
  payment_reminder: 'Erinnerung: Offene Rechnung für Ihre Steuererklärung. Details im Dashboard.',
  deadline_reminder: 'Die Steuerfrist rückt näher! Kontaktieren Sie uns für Hilfe.',
  custom: '',
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientIds, template, channel, customSubject, customBody } = await request.json() as {
      clientIds: string[]
      template: NotificationTemplate
      channel: 'email' | 'sms' | 'both'
      customSubject?: string
      customBody?: string
    }

    const serviceClient = await createServiceRoleClient()

    // Fetch client profiles
    const { data: clients } = await serviceClient
      .from('profiles')
      .select('*')
      .in('id', clientIds)

    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: 'No clients found' }, { status: 404 })
    }

    const results: Array<{ clientId: string; email?: string; sms?: string }> = []

    for (const client of clients) {
      const result: { clientId: string; email?: string; sms?: string } = { clientId: client.id }

      // Send email
      if ((channel === 'email' || channel === 'both') && client.email) {
        const emailTemplate = EMAIL_TEMPLATES[template]
        const subject = template === 'custom' ? customSubject! : emailTemplate.subject
        const body = template === 'custom' ? customBody! : emailTemplate.body

        try {
          await getResend().emails.send({
            from: 'Steuerberatung Petertil <noreply@steuerberatung-petertil.ch>',
            to: [client.email],
            subject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #102a43; padding: 24px; text-align: center;">
                  <h1 style="color: #c49a2e; margin: 0; font-size: 20px;">Steuerberatung Petertil</h1>
                </div>
                <div style="padding: 32px 24px; background: #ffffff;">
                  <p style="color: #243b53; line-height: 1.6;">
                    ${client.first_name ? `Guten Tag ${client.first_name},` : 'Guten Tag,'}
                  </p>
                  <p style="color: #486581; line-height: 1.6;">${body}</p>
                  <div style="margin-top: 24px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="display: inline-block; background: #243b53; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      Zum Dashboard
                    </a>
                  </div>
                </div>
                <div style="padding: 16px 24px; background: #f0f4f8; text-align: center;">
                  <p style="color: #829ab1; font-size: 12px; margin: 0;">
                    Steuerberatung Petertil | Schweiz
                  </p>
                </div>
              </div>
            `,
          })
          result.email = 'sent'

          // Log notification
          await serviceClient.from('notifications').insert({
            client_id: client.id,
            type: 'email',
            template,
            subject,
            content: body,
            status: 'sent',
          })
        } catch (err) {
          result.email = 'failed'
          console.error(`Email to ${client.email} failed:`, err)
        }
      }

      // Send SMS
      if ((channel === 'sms' || channel === 'both') && client.phone) {
        const smsBody = template === 'custom'
          ? customBody!
          : SMS_TEMPLATES[template]

        try {
          await getTwilioClient().messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: client.phone,
          })
          result.sms = 'sent'

          await serviceClient.from('notifications').insert({
            client_id: client.id,
            type: 'sms',
            template,
            content: smsBody,
            status: 'sent',
          })
        } catch (err) {
          result.sms = 'failed'
          console.error(`SMS to ${client.phone} failed:`, err)
        }
      }

      results.push(result)
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
