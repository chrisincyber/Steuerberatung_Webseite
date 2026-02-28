import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { taxYearId, amount, message } = await request.json()

    if (!taxYearId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Update tax year with offer
    const { data: taxYear, error: updateError } = await supabase
      .from('tax_years')
      .update({
        offer_amount: amount,
        offer_message: message || null,
        status: 'angebot_gesendet',
      })
      .eq('id', taxYearId)
      .select('*, user:profiles!tax_years_user_id_fkey(*)')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send email notification to client
    const clientProfile = taxYear?.user
    if (clientProfile?.email && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Petertil Tax <noreply@petertiltax.ch>',
          to: clientProfile.email,
          subject: `Ihr persönliches Angebot – Steuerjahr ${taxYear.year}`,
          html: `
            <h2>Ihr persönliches Angebot</h2>
            <p>Guten Tag ${clientProfile.first_name},</p>
            <p>Wir haben Ihr persönliches Angebot für das Steuerjahr ${taxYear.year} erstellt:</p>
            <p style="font-size: 24px; font-weight: bold;">CHF ${amount}</p>
            ${message ? `<p>${message}</p>` : ''}
            <p>Bitte loggen Sie sich in Ihr Kundenportal ein, um das Angebot anzunehmen oder abzulehnen.</p>
            <p>Mit freundlichen Grüssen,<br/>Christian Petertil</p>
          `,
        })
      } catch {
        // Email sending failed, but offer was saved - continue
        console.error('Failed to send offer email')
      }
    }

    return NextResponse.json({ success: true, taxYear })
  } catch (error) {
    console.error('Send offer error:', error)
    return NextResponse.json({ error: 'Failed to send offer' }, { status: 500 })
  }
}
