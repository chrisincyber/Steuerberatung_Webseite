import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  })
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}

      // New pricing flow: create tax_year from checkout metadata
      if (metadata.year && metadata.price) {
        const year = parseInt(metadata.year, 10)
        const price = parseFloat(metadata.price)
        const isSelbstaendig = metadata.selbstaendig === 'true'
        const isAbo = metadata.abo === 'true'

        if (metadata.user_id) {
          // Logged-in user: create tax_year directly (backup for dashboard callback)
          await supabase
            .from('tax_years')
            .upsert({
              user_id: metadata.user_id,
              year,
              tier: 1,
              price,
              status: isSelbstaendig ? 'angebot_ausstehend' : 'dokumente_hochladen',
              is_abo: isAbo || null,
              stripe_session_id: session.id,
            }, { onConflict: 'user_id,year' })
        } else {
          // New user (not yet registered): store as pending payment
          const customerEmail = session.customer_details?.email || session.customer_email
          await supabase
            .from('pending_payments')
            .insert({
              stripe_session_id: session.id,
              email: customerEmail,
              year,
              price,
              selbstaendig: isSelbstaendig,
              express: metadata.express === 'true',
              abo: isAbo,
              payment_intent_id: session.payment_intent as string,
            })
        }
      }

      // Legacy flow: update invoice status
      const { declarationId, referralCode } = metadata
      if (declarationId) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            payment_method: 'stripe',
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq('declaration_id', declarationId)
      }

      // Update referral code usage
      if (referralCode) {
        await supabase.rpc('increment_referral_usage', { code: referralCode })
      }

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
