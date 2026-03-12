import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const CLIENT_BASELINE = 150
const DECLARATION_BASELINE = 900

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [profilesResult, taxYearsResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('tax_years')
        .select('*', { count: 'exact', head: true })
        .not('stripe_session_id', 'is', null),
    ])

    const clients = (profilesResult.count ?? 0) + CLIENT_BASELINE
    const declarations = (taxYearsResult.count ?? 0) + DECLARATION_BASELINE

    return NextResponse.json(
      { clients, declarations },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        },
      }
    )
  } catch {
    return NextResponse.json(
      { clients: CLIENT_BASELINE, declarations: DECLARATION_BASELINE },
      { status: 200 }
    )
  }
}
