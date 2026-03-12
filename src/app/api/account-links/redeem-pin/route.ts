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

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, pin } = await request.json()
    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 })
    }

    const service = getServiceClient()

    // Check if current user is already linked
    const { data: existingLink } = await service
      .from('account_links')
      .select('id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle()

    if (existingLink) {
      return NextResponse.json({ error: 'You are already linked to a partner' }, { status: 400 })
    }

    // Look up the target user by email
    const { data: targetProfile } = await service
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: 'Invalid PIN or email' }, { status: 400 })
    }

    if (targetProfile.id === user.id) {
      return NextResponse.json({ error: 'Cannot link to yourself' }, { status: 400 })
    }

    // Check if target is already linked
    const { data: targetLink } = await service
      .from('account_links')
      .select('id')
      .or(`user_a_id.eq.${targetProfile.id},user_b_id.eq.${targetProfile.id}`)
      .maybeSingle()

    if (targetLink) {
      return NextResponse.json({ error: 'Invalid PIN or email' }, { status: 400 })
    }

    // Find active PIN for target user
    const { data: pinRow } = await service
      .from('link_pins')
      .select('*')
      .eq('user_id', targetProfile.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 5)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!pinRow) {
      return NextResponse.json({ error: 'Invalid PIN or email' }, { status: 400 })
    }

    // Verify PIN
    const pinHash = crypto.createHash('sha256').update(String(pin)).digest('hex')

    if (pinHash !== pinRow.pin_hash) {
      // Increment attempts
      await service
        .from('link_pins')
        .update({ attempts: pinRow.attempts + 1 })
        .eq('id', pinRow.id)

      return NextResponse.json({ error: 'Invalid PIN or email' }, { status: 400 })
    }

    // PIN is correct — mark used and create link
    await service
      .from('link_pins')
      .update({ used: true })
      .eq('id', pinRow.id)

    // Always store with alphabetically smaller UUID as user_a for consistency
    const [userA, userB] = [user.id, targetProfile.id].sort()

    await service.from('account_links').insert({
      user_a_id: userA,
      user_b_id: userB,
      user_a_share_visible: true,
      user_b_share_visible: true,
      originated_from: 'pin',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Redeem PIN error:', err)
    return NextResponse.json({ error: 'Failed to redeem PIN' }, { status: 500 })
  }
}
