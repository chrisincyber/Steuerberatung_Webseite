import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = getServiceClient()

    const { data: link } = await service
      .from('account_links')
      .select('id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ error: 'No active link found' }, { status: 404 })
    }

    await service
      .from('account_links')
      .delete()
      .eq('id', link.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unlink error:', err)
    return NextResponse.json({ error: 'Failed to unlink' }, { status: 500 })
  }
}
