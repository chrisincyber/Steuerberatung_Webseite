import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = getServiceClient()

    // Get user's email
    const { data: profile } = await service
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ claimable: false })
    }

    // Check if this email matches any unclaimed konkubinat partner
    const { data: partner } = await service
      .from('konkubinat_partners')
      .select('id, primary_user_id, first_name, last_name')
      .eq('email', profile.email.toLowerCase())
      .is('claimed_by_user_id', null)
      .maybeSingle()

    if (!partner || partner.primary_user_id === user.id) {
      return NextResponse.json({ claimable: false })
    }

    // Get primary user info
    const { data: primaryProfile } = await service
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', partner.primary_user_id)
      .single()

    return NextResponse.json({
      claimable: true,
      partnerId: partner.id,
      primaryUserId: partner.primary_user_id,
      primaryUserName: primaryProfile
        ? `${primaryProfile.first_name} ${primaryProfile.last_name}`
        : 'Unknown',
    })
  } catch (err) {
    console.error('Check claimable error:', err)
    return NextResponse.json({ error: 'Failed to check' }, { status: 500 })
  }
}
