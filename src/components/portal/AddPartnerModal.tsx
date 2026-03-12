'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { TaxYearStatus } from '@/lib/types/portal'
import { X, Loader2 } from 'lucide-react'

interface AddPartnerModalProps {
  userId: string
  onClose: () => void
  onAdded: () => void
}

export function AddPartnerModal({ userId, onClose, onAdded }: AddPartnerModalProps) {
  const { t } = useI18n()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    if (!supabase) { setError('Service unavailable'); setLoading(false); return }

    // 1. Insert partner
    const { data: partner, error: insertError } = await supabase
      .from('konkubinat_partners')
      .insert({
        primary_user_id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birthday: birthday || null,
        phone: phone || null,
        email: email || null,
      })
      .select()
      .single()

    if (insertError || !partner) {
      setError(insertError?.message || 'Failed to add partner')
      setLoading(false)
      return
    }

    // 2. Update profile zivilstand to konkubinat
    await supabase
      .from('profiles')
      .update({ zivilstand: 'konkubinat' })
      .eq('id', userId)

    // 3. Auto-create partner tax years for all open years
    const { data: openYears } = await supabase
      .from('open_tax_years')
      .select('year')

    if (openYears && openYears.length > 0) {
      await supabase.from('tax_years').insert(
        openYears.map((oy: { year: number }) => ({
          user_id: userId,
          year: oy.year,
          partner_id: partner.id,
          status: 'preis_berechnen' as TaxYearStatus,
          archived: false,
        }))
      )
    }

    setLoading(false)
    onAdded()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-navy-100">
          <h2 className="font-heading text-lg font-bold text-navy-900">
            {t.dashboard.partner.addPartner}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.dashboard.partner.firstName} *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.dashboard.partner.lastName} *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.dashboard.partner.birthday}
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.dashboard.partner.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.dashboard.partner.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="btn-primary w-full !py-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.dashboard.partner.addPartner}
          </button>
        </form>
      </div>
    </div>
  )
}
