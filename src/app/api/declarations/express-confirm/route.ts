import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taxYearId } = await request.json()
    if (!taxYearId) {
      return NextResponse.json({ error: 'Missing taxYearId' }, { status: 400 })
    }

    // Verify ownership and express flag
    const { data: taxYear } = await supabase
      .from('tax_years')
      .select('id, user_id, express, express_confirmed_at, status')
      .eq('id', taxYearId)
      .single()

    if (!taxYear || taxYear.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!taxYear.express) {
      return NextResponse.json({ error: 'Not an express order' }, { status: 400 })
    }

    if (taxYear.express_confirmed_at) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })
    }

    // Set confirmed timestamp and move to in_bearbeitung
    const now = new Date().toISOString()
    await supabase
      .from('tax_years')
      .update({
        express_confirmed_at: now,
        status: 'in_bearbeitung',
      })
      .eq('id', taxYearId)

    return NextResponse.json({ confirmed: true, express_confirmed_at: now })
  } catch (error) {
    console.error('Express confirm error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
