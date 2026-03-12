import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = getServiceClient()

    // Check if user is already linked
    const { data: existingLink } = await service
      .from('account_links')
      .select('id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle()

    if (existingLink) {
      return NextResponse.json({ error: 'Already linked to a partner' }, { status: 400 })
    }

    // Invalidate previous active PINs
    await service
      .from('link_pins')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    // Generate 6-digit PIN
    const pin = String(crypto.randomInt(100000, 999999))
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex')

    await service.from('link_pins').insert({
      user_id: user.id,
      pin_hash: pinHash,
    })

    return NextResponse.json({ pin })
  } catch (err) {
    console.error('Generate PIN error:', err)
    return NextResponse.json({ error: 'Failed to generate PIN' }, { status: 500 })
  }
}
