import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  })
}

const PRICES: Record<string, number> = {
  basic: 9900,    // CHF 99.00 in cents
  standard: 14900, // CHF 149.00
  premium: 22400,  // CHF 224.00 (midpoint of 199-249)
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, declarationId, referralCode } = await request.json()
    const price = PRICES[tier]

    if (!price) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Check referral code discount
    let discount = 0
    if (referralCode) {
      const { data: referral } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', referralCode)
        .eq('active', true)
        .single()

      if (referral) {
        discount = referral.discount_amount * 100 // Convert to cents
      }
    }

    const finalPrice = Math.max(price - discount, 0)

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: `Steuererklärung – ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
              description: 'Tax Declaration Service',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        declarationId: declarationId || '',
        tier,
        referralCode: referralCode || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
