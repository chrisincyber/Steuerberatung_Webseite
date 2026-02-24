'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonDeadlines } from '@/lib/swiss-data'
import { Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react'

export default function DeadlinesPage() {
  const { t, locale } = useI18n()

  const deadlineData = cantonDeadlines.map(d => {
    const canton = cantons.find(c => c.code === d.code)!
    return {
      ...d,
      name: canton.name[locale],
    }
  })

  // Check if any deadline is within 30 days
  const now = new Date()
  const isUpcoming = (dateStr: string) => {
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      const diff = date.getTime() - now.getTime()
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
    }
    return false
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.deadlines.title}
          </h1>
          <p className="mt-4 text-xl dark-text-secondary max-w-2xl mx-auto">
            {t.deadlines.subtitle}
          </p>
        </div>
      </section>

      {/* Urgency banner */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="container-wide">
          <div className="flex items-center gap-3 p-4 bg-gold-50 rounded-xl border border-gold-200">
            <Clock className="w-5 h-5 text-gold-600 shrink-0" />
            <p className="text-sm font-medium text-gold-800">{t.deadlines.urgency}</p>
            <Link href="/auth/register" className="ml-auto text-sm font-semibold text-gold-700 hover:text-gold-800 whitespace-nowrap inline-flex items-center gap-1">
              {t.deadlines.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Deadline table */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="card overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">
                      {t.deadlines.canton}
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t.deadlines.deadline}
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t.deadlines.extension}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deadlineData.map((d, i) => {
                    const upcoming = isUpcoming(d.deadline)
                    return (
                      <tr
                        key={d.code}
                        className={`border-b border-navy-50 hover:bg-navy-50/30 transition-colors ${
                          upcoming ? 'bg-gold-50/50' : i % 2 === 0 ? '' : 'bg-navy-50/20'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              upcoming ? 'bg-gold-100 text-gold-700' : 'bg-navy-100 text-navy-700'
                            }`}>
                              {d.code}
                            </span>
                            <span className="text-sm font-medium text-navy-900">{d.name}</span>
                            {upcoming && (
                              <span className="text-xs font-medium text-gold-600 bg-gold-100 px-2 py-0.5 rounded-full">
                                {locale === 'de' ? 'Bald fällig' : 'Due soon'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${upcoming ? 'font-semibold text-gold-700' : 'text-navy-700'}`}>{d.deadline}</td>
                        <td className="px-6 py-4 text-sm text-navy-700">{d.extension}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-navy-100">
              {deadlineData.map((d) => {
                const upcoming = isUpcoming(d.deadline)
                return (
                  <div key={d.code} className={`p-4 ${upcoming ? 'bg-gold-50/50' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        upcoming ? 'bg-gold-100 text-gold-700' : 'bg-navy-100 text-navy-700'
                      }`}>
                        {d.code}
                      </span>
                      <span className="text-sm font-semibold text-navy-900">{d.name}</span>
                      {upcoming && (
                        <span className="text-xs font-medium text-gold-600 bg-gold-100 px-2 py-0.5 rounded-full">
                          {locale === 'de' ? 'Bald fällig' : 'Due soon'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm pl-11">
                      <div>
                        <div className="text-navy-500 text-xs">{t.deadlines.deadline}</div>
                        <div className={`font-medium ${upcoming ? 'text-gold-700' : 'text-navy-700'}`}>{d.deadline}</div>
                      </div>
                      <div>
                        <div className="text-navy-500 text-xs">{t.deadlines.extension}</div>
                        <div className="text-navy-700 font-medium">{d.extension}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 mt-6 p-4 bg-gold-50 rounded-xl border border-gold-200">
            <AlertCircle className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gold-800">{t.deadlines.note}</p>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link href="/auth/register" className="btn-gold !px-8 !py-4 group">
              {t.deadlines.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
