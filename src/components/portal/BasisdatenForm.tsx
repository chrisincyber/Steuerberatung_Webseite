'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { cantons } from '@/lib/swiss-data'
import type { Zivilstand, Religion, JobStatus, Profile } from '@/lib/types/portal'
import { ClipboardCheck } from 'lucide-react'

interface BasisdatenFormProps {
  taxYearId: string
  year: number
  profile: Profile
  onConfirmed: () => void
}

interface PersonFields {
  dob: string
  religion: Religion | ''
  job_status: JobStatus | ''
  company: string
  job_title: string
}

const emptyPerson: PersonFields = { dob: '', religion: '', job_status: '', company: '', job_title: '' }

export function BasisdatenForm({ taxYearId, year, profile, onConfirmed }: BasisdatenFormProps) {
  const { t, locale } = useI18n()

  const [zivilstand, setZivilstand] = useState<Zivilstand>('einzelperson')
  const [canton, setCanton] = useState(profile.address_canton || '')
  const [p1, setP1] = useState<PersonFields>({ ...emptyPerson })
  const [p2, setP2] = useState<PersonFields>({ ...emptyPerson })
  const [addressSame, setAddressSame] = useState(true)
  const [altStreet, setAltStreet] = useState('')
  const [altZip, setAltZip] = useState('')
  const [altCity, setAltCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const showCompany = (status: string) => status === 'angestellt' || status === 'selbstaendig'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    if (!supabase) { setError('Service unavailable'); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('tax_years')
      .update({
        zivilstand,
        canton,
        basisdaten_confirmed: true,
        address_is_same_as_on_file: addressSame,
        address_per_31dec_street: addressSame ? profile.address_street : altStreet,
        address_per_31dec_zip: addressSame ? profile.address_zip : altZip,
        address_per_31dec_city: addressSame ? profile.address_city : altCity,
        p1_dob: p1.dob || null,
        p1_religion: p1.religion || null,
        p1_job_status: p1.job_status || null,
        p1_company: p1.company || null,
        p1_job_title: p1.job_title || null,
        p2_dob: zivilstand === 'verheiratet' ? (p2.dob || null) : null,
        p2_religion: zivilstand === 'verheiratet' ? (p2.religion || null) : null,
        p2_job_status: zivilstand === 'verheiratet' ? (p2.job_status || null) : null,
        p2_company: zivilstand === 'verheiratet' ? (p2.company || null) : null,
        p2_job_title: zivilstand === 'verheiratet' ? (p2.job_title || null) : null,
      })
      .eq('id', taxYearId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onConfirmed()
  }

  const religionOptions = Object.entries(t.basisdaten.religionOptions) as [Religion, string][]
  const jobOptions = Object.entries(t.basisdaten.jobStatusOptions) as [JobStatus, string][]

  const renderPersonFields = (
    label: string,
    person: PersonFields,
    setPerson: (p: PersonFields) => void,
  ) => (
    <div className="card p-6 space-y-4">
      <h3 className="font-heading font-bold text-navy-900">{label}</h3>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">{t.basisdaten.dob}</label>
        <input
          type="date"
          value={person.dob}
          onChange={(e) => setPerson({ ...person, dob: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">{t.basisdaten.religion}</label>
        <select
          value={person.religion}
          onChange={(e) => setPerson({ ...person, religion: e.target.value as Religion })}
          className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none bg-white"
        >
          <option value="">–</option>
          {religionOptions.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">{t.basisdaten.jobStatus}</label>
        <select
          value={person.job_status}
          onChange={(e) => setPerson({ ...person, job_status: e.target.value as JobStatus })}
          className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none bg-white"
        >
          <option value="">–</option>
          {jobOptions.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {showCompany(person.job_status) && (
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t.basisdaten.company}</label>
          <input
            type="text"
            value={person.company}
            onChange={(e) => setPerson({ ...person, company: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">{t.basisdaten.jobTitle}</label>
        <input
          type="text"
          value={person.job_title}
          onChange={(e) => setPerson({ ...person, job_title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Banner */}
      <div className="card p-6 mb-6 bg-gold-50 border-gold-200">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-gold-600" />
          <div>
            <h2 className="font-heading text-lg font-bold text-navy-900">{t.basisdaten.title}</h2>
            <p className="text-sm text-navy-600">{t.basisdaten.deadline}{year}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Zivilstand */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-navy-900 mb-3">{t.basisdaten.zivilstand}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setZivilstand('einzelperson')}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                zivilstand === 'einzelperson'
                  ? 'border-navy-800 bg-navy-800 text-white'
                  : 'border-navy-200 text-navy-700 hover:border-navy-400'
              }`}
            >
              {t.basisdaten.einzelperson}
            </button>
            <button
              type="button"
              onClick={() => setZivilstand('verheiratet')}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                zivilstand === 'verheiratet'
                  ? 'border-navy-800 bg-navy-800 text-white'
                  : 'border-navy-200 text-navy-700 hover:border-navy-400'
              }`}
            >
              {t.basisdaten.verheiratet}
            </button>
          </div>
        </div>

        {/* Canton */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-navy-900 mb-3">{t.basisdaten.canton}</label>
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none bg-white"
          >
            <option value="">{t.basisdaten.cantonPlaceholder}</option>
            {cantons.map((c) => (
              <option key={c.code} value={c.code}>
                {locale === 'de' ? c.name.de : c.name.en}
              </option>
            ))}
          </select>
        </div>

        {/* Person 1 */}
        {renderPersonFields(t.basisdaten.person1, p1, setP1)}

        {/* Person 2 (if married) */}
        {zivilstand === 'verheiratet' && renderPersonFields(t.basisdaten.person2, p2, setP2)}

        {/* Address */}
        <div className="card p-6 space-y-4">
          <h3 className="font-heading font-bold text-navy-900">{t.basisdaten.address}{year}</h3>

          {profile.address_street && (
            <div className="p-3 bg-navy-50 rounded-xl text-sm text-navy-700">
              <p className="text-xs text-navy-500 mb-1">{t.basisdaten.addressOnFile}</p>
              <p>{profile.address_street}</p>
              <p>{profile.address_zip} {profile.address_city}</p>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={addressSame}
              onChange={(e) => setAddressSame(e.target.checked)}
              className="w-5 h-5 rounded border-navy-300 text-navy-800 focus:ring-navy-500"
            />
            <span className="text-sm text-navy-700">{t.basisdaten.addressConfirm}{year}</span>
          </label>

          {!addressSame && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-navy-700">{t.basisdaten.addressAlternative}</p>
              <input
                type="text"
                placeholder={t.basisdaten.street}
                value={altStreet}
                onChange={(e) => setAltStreet(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder={t.basisdaten.zip}
                  value={altZip}
                  onChange={(e) => setAltZip(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
                <input
                  type="text"
                  placeholder={t.basisdaten.city}
                  value={altCity}
                  onChange={(e) => setAltCity(e.target.value)}
                  className="col-span-2 px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !canton}
          className="btn-primary w-full !py-3 disabled:opacity-50"
        >
          {loading ? t.common.loading : t.basisdaten.confirm}
        </button>
      </form>
    </div>
  )
}
