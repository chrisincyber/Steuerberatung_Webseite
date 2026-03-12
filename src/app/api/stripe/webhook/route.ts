import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
            express: metadata.express === 'true',
            metadata,
          })
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
