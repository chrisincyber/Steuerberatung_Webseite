import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync profile with auth user data (handles Google OAuth names/email)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const meta = user.user_metadata ?? {}
          const firstName = meta.first_name || meta.given_name || ''
          const lastName = meta.last_name || meta.family_name || ''

          const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // Update profile: fill in missing names and keep email in sync
          const updates: Record<string, string> = {}
          if (user.email) updates.email = user.email

          const { data: profile } = await serviceClient
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()

          if (!profile?.first_name && firstName) updates.first_name = firstName
          if (!profile?.last_name && lastName) updates.last_name = lastName

          if (Object.keys(updates).length > 0) {
            await serviceClient
              .from('profiles')
              .update(updates)
              .eq('id', user.id)
          }
        }
      } catch (err) {
        // Non-blocking: profile sync failed, user can still proceed
        console.error('Profile sync error:', err)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
