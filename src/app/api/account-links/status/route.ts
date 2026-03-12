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

    // Find link
    const { data: link } = await service
      .from('account_links')
      .select('*')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ linked: false })
    }

    // Determine partner
    const partnerId = link.user_a_id === user.id ? link.user_b_id : link.user_a_id
    const myShareVisible = link.user_a_id === user.id ? link.user_a_share_visible : link.user_b_share_visible
    const partnerShareVisible = link.user_a_id === user.id ? link.user_b_share_visible : link.user_a_share_visible

    // Fetch partner profile
    const { data: partnerProfile } = await service
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', partnerId)
      .single()

    return NextResponse.json({
      linked: true,
      linkId: link.id,
      myShareVisible,
      partnerShareVisible,
      partner: partnerProfile,
    })
  } catch (err) {
    console.error('Link status error:', err)
    return NextResponse.json({ error: 'Failed to fetch link status' }, { status: 500 })
  }
}
