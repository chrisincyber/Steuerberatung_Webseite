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
    const { price, year, selbstaendig, express, abo } = await request.json()

    if (!price || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const priceInRappen = Math.round(price * 100)
    if (priceInRappen <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Check if user is logged in (optional)
    let userId: string | undefined
    let userEmail: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email
      }
    } catch {
      // Not logged in, that's fine
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const successUrl = userId
      ? `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`
      : `${appUrl}/auth/register?session_id={CHECKOUT_SESSION_ID}`

    const productName = `Steuererklärung ${year}${express === true || express === 'true' ? ' (Express)' : ''}`

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: productName,
            },
            unit_amount: priceInRappen,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        year: String(year),
        selbstaendig: String(selbstaendig),
        express: String(express),
        abo: String(abo),
        price: String(price),
        ...(userId ? { user_id: userId } : {}),
      },
    }

    if (userEmail) {
      sessionParams.customer_email = userEmail
    }

    const session = await getStripe().checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe create-checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
