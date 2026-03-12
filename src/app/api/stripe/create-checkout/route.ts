import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

export async function POST(request: Request) {
  try {
    const { price, year, selbstaendig, express, abo, partner_id } = await request.json()

    if (!price || !year || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Invalid price or year' }, { status: 400 })
    }

    // Check if user is logged in (optional)
    let userId: string | null = null
    let userEmail: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email ?? undefined
      }
    } catch {
      // Not logged in, that's fine
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = userId
      ? `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`
      : `${appUrl}/auth/register?session_id={CHECKOUT_SESSION_ID}`

    const stripe = getStripe()

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: `Steuererklärung ${year}`,
              description: [
                express ? 'Express-Bearbeitung' : null,
                abo ? 'Jahresabo (10% Rabatt)' : null,
              ].filter(Boolean).join(' · ') || undefined,
            },
            unit_amount: Math.round(price * 100), // CHF to Rappen
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: returnUrl,
      metadata: {
        year: String(year),
        selbstaendig: String(!!selbstaendig),
        express: String(!!express),
        abo: String(!!abo),
        price: String(price),
        ...(userId ? { user_id: userId } : {}),
        ...(partner_id ? { partner_id } : {}),
      },
    }

    // Pre-fill email for logged-in users
    if (userEmail) {
      sessionParams.customer_email = userEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('Stripe create-checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
