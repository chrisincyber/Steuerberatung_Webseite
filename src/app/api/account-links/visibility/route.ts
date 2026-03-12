import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { visible } = await request.json()
    if (typeof visible !== 'boolean') {
      return NextResponse.json({ error: 'visible must be boolean' }, { status: 400 })
    }

    const service = getServiceClient()

    // Find link
    const { data: link } = await service
      .from('account_links')
      .select('*')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ error: 'No active link found' }, { status: 404 })
    }

    // Update the correct visibility column
    const column = link.user_a_id === user.id ? 'user_a_share_visible' : 'user_b_share_visible'

    await service
      .from('account_links')
      .update({ [column]: visible })
      .eq('id', link.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Visibility update error:', err)
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 })
  }
}
