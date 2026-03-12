import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

    const { partnerId, action } = await request.json()
    if (!partnerId || !['link', 'unlink'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const service = getServiceClient()

    // Verify the partner record matches this user's email and is unclaimed
    const { data: profile } = await service
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const { data: partner } = await service
      .from('konkubinat_partners')
      .select('*')
      .eq('id', partnerId)
      .is('claimed_by_user_id', null)
      .single()

    if (!partner || !profile?.email || partner.email?.toLowerCase() !== profile.email.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot claim this partner record' }, { status: 403 })
    }

    if (partner.primary_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot claim your own partner record' }, { status: 400 })
    }

    // Mark partner as claimed
    await service
      .from('konkubinat_partners')
      .update({ claimed_by_user_id: user.id })
      .eq('id', partnerId)

    // Transfer partner's tax years to the claiming user
    // These are tax_years rows where user_id = primary_user and partner_id = this partner
    await service
      .from('tax_years')
      .update({ user_id: user.id, partner_id: null })
      .eq('user_id', partner.primary_user_id)
      .eq('partner_id', partnerId)

    // Transfer any documents associated with those tax years
    // (documents reference tax_year_id so they follow automatically,
    //  but user_id on documents may need updating)
    const { data: transferredYears } = await service
      .from('tax_years')
      .select('id')
      .eq('user_id', user.id)

    if (transferredYears) {
      const yearIds = transferredYears.map((ty: { id: string }) => ty.id)
      if (yearIds.length > 0) {
        await service
          .from('portal_documents')
          .update({ user_id: user.id })
          .in('tax_year_id', yearIds)
          .eq('user_id', partner.primary_user_id)
      }
    }

    if (action === 'link') {
      // Create account link
      const [userA, userB] = [user.id, partner.primary_user_id].sort()

      // Check if already linked
      const { data: existingLink } = await service
        .from('account_links')
        .select('id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .maybeSingle()

      if (!existingLink) {
        await service.from('account_links').insert({
          user_a_id: userA,
          user_b_id: userB,
          user_a_share_visible: true,
          user_b_share_visible: true,
          originated_from: 'claim',
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Claim error:', err)
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }
}
