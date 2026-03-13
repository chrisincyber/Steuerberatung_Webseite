import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

function buildOrderConfirmationEmail(opts: {
  year: number
  price: number
  isAbo: boolean
  express: boolean
  breakdown: { label: string; amount: string }[]
  appUrl: string
}) {
  const { year, price, isAbo, express, breakdown, appUrl } = opts
  const logoUrl = `${appUrl}/logo-dark.svg`

  const breakdownRows = breakdown
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; color: #334e68; font-size: 14px; border-bottom: 1px solid #f0f4f8;">${item.label}</td>
        <td style="padding: 10px 0; color: #243b53; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f4f8;">${item.amount}</td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
    <!-- Header -->
    <div style="background: #102a43; border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
      <img src="${logoUrl}" alt="Petertil Tax" style="height: 32px; margin-bottom: 16px;" />
      <h1 style="color: #c49a2e; margin: 0; font-size: 22px; font-weight: 700;">Auftragsbestätigung</h1>
      <p style="color: #9fb3c8; margin: 8px 0 0; font-size: 14px;">Steuererklärung ${year}</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 32px 24px;">
      <p style="color: #243b53; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Vielen Dank für Ihren Auftrag! Wir freuen uns, Ihre Steuererklärung ${year} für Sie zu erstellen.
      </p>

      <!-- Next Steps -->
      <div style="background: #f0f4f8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #243b53; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Nächste Schritte</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top; width: 32px;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #102a43; color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; line-height: 28px;">1</div>
            </td>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #243b53; font-size: 14px; font-weight: 600;">Konto erstellen & einloggen</p>
              <p style="margin: 4px 0 0; color: #627d98; font-size: 13px;">Falls noch nicht geschehen, registrieren Sie sich mit Ihrer E-Mail-Adresse.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #102a43; color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; line-height: 28px;">2</div>
            </td>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #243b53; font-size: 14px; font-weight: 600;">Dokumente hochladen</p>
              <p style="margin: 4px 0 0; color: #627d98; font-size: 13px;">Laden Sie Ihre Steuerbelege (Lohnausweis, Kontoauszüge etc.) im Dashboard hoch.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #102a43; color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; line-height: 28px;">3</div>
            </td>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #243b53; font-size: 14px; font-weight: 600;">Wir erledigen den Rest</p>
              <p style="margin: 4px 0 0; color: #627d98; font-size: 13px;">Sobald alle Unterlagen vorliegen, erstellen wir Ihre Steuererklärung${express ? ' im Express-Verfahren' : ''}. Sie werden per E-Mail benachrichtigt.</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background: #102a43; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;">Zum Dashboard</a>
      </div>

      <!-- Cost Overview -->
      <div style="border-top: 2px solid #f0f4f8; padding-top: 24px;">
        <h2 style="color: #243b53; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Kostenübersicht</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${breakdownRows}
          <tr>
            <td style="padding: 14px 0 0; color: #102a43; font-size: 16px; font-weight: 700; border-top: 2px solid #102a43;">Total</td>
            <td style="padding: 14px 0 0; color: #102a43; font-size: 20px; font-weight: 700; text-align: right; border-top: 2px solid #102a43;">CHF ${price.toFixed(2)}</td>
          </tr>
        </table>
        ${isAbo ? '<p style="color: #218048; font-size: 13px; margin: 8px 0 0;">Jahresabo aktiv — 10% Rabatt bereits abgezogen</p>' : ''}
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f0f4f8; border-radius: 0 0 16px 16px; padding: 24px; text-align: center;">
      <p style="color: #627d98; font-size: 12px; margin: 0 0 4px;">Petertil Tax · Steuerberatung</p>
      <p style="color: #9fb3c8; font-size: 12px; margin: 0;">
        <a href="${appUrl}" style="color: #9fb3c8; text-decoration: underline;">petertiltax.ch</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }

    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status !== 'paid') return NextResponse.json({ received: true })

      const metadata = session.metadata || {}
      const userId = metadata.user_id
      const year = parseInt(metadata.year, 10)
      const price = parseFloat(metadata.price)
      const isAbo = metadata.abo === 'true'
      const express = metadata.express === 'true'

      if (isNaN(year) || isNaN(price)) {
        console.error('Webhook: invalid metadata', metadata)
        return NextResponse.json({ received: true })
      }

      const supabase = getSupabaseAdmin()

      const partnerId = metadata.partner_id || null

      if (userId) {
        if (partnerId) {
          // Partner payment: update matching row
          await supabase
            .from('tax_years')
            .update({
              tier: 1,
              price,
              status: 'dokumente_hochladen',
              is_abo: isAbo || null,
              stripe_session_id: session.id,
            })
            .eq('user_id', userId)
            .eq('year', year)
            .eq('partner_id', partnerId)
        } else {
          // Logged-in user: upsert tax_year directly (backup for dashboard callback)
          await supabase
            .from('tax_years')
            .upsert({
              user_id: userId,
              year,
              tier: 1,
              price,
              status: 'dokumente_hochladen',
              is_abo: isAbo || null,
              stripe_session_id: session.id,
            }, { onConflict: 'user_id,year' })
        }
      } else {
        // Not logged in: store in pending_payments for later association
        const email = session.customer_details?.email || session.customer_email
        await supabase
          .from('pending_payments')
          .insert({
            stripe_session_id: session.id,
            email,
            year,
            price,
            is_abo: isAbo,
            express,
            metadata,
          })
      }

      // Send order confirmation email
      const customerEmail = session.customer_details?.email || session.customer_email
      if (customerEmail && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petertiltax.ch'

          // Build breakdown from metadata
          const breakdown: { label: string; amount: string }[] = []

          // We know the total price but not the full breakdown from metadata alone.
          // Reconstruct what we can:
          breakdown.push({ label: `Steuererklärung ${year}`, amount: `CHF ${price.toFixed(2)}` })

          if (express) {
            breakdown.push({ label: 'Inkl. Express-Bearbeitung', amount: '' })
          }
          if (isAbo) {
            breakdown.push({ label: 'Inkl. 10% Jahresabo-Rabatt', amount: '' })
          }

          await resend.emails.send({
            from: 'Petertil Tax <noreply@petertiltax.ch>',
            to: [customerEmail],
            subject: `Auftragsbestätigung – Steuererklärung ${year}`,
            html: buildOrderConfirmationEmail({
              year,
              price,
              isAbo,
              express,
              breakdown,
              appUrl,
            }),
          })
        } catch (emailError) {
          // Log but don't fail the webhook
          console.error('Failed to send order confirmation email:', emailError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
