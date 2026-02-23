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

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
            {t.deadlines.title}
          </h1>
          <p className="mt-4 text-xl text-navy-200 max-w-2xl mx-auto">
            {t.deadlines.subtitle}
          </p>
        </div>
      </section>

      {/* Deadline table */}
      <section className="section-padding">
        <div className="container-wide">
          {/* Mobile-friendly cards + Desktop table */}
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
                  {deadlineData.map((d, i) => (
                    <tr
                      key={d.code}
                      className={`border-b border-navy-50 hover:bg-navy-50/30 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-navy-50/20'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-700">
                            {d.code}
                          </span>
                          <span className="text-sm font-medium text-navy-900">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-700">{d.deadline}</td>
                      <td className="px-6 py-4 text-sm text-navy-700">{d.extension}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-navy-100">
              {deadlineData.map((d) => (
                <div key={d.code} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-700">
                      {d.code}
                    </span>
                    <span className="text-sm font-semibold text-navy-900">{d.name}</span>
                  </div>
                  <div className="flex justify-between text-sm pl-11">
                    <div>
                      <div className="text-navy-500 text-xs">{t.deadlines.deadline}</div>
                      <div className="text-navy-700 font-medium">{d.deadline}</div>
                    </div>
                    <div>
                      <div className="text-navy-500 text-xs">{t.deadlines.extension}</div>
                      <div className="text-navy-700 font-medium">{d.extension}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 mt-6 p-4 bg-gold-50 rounded-xl border border-gold-200">
            <AlertCircle className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gold-800">{t.deadlines.note}</p>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link href="/auth/register" className="btn-primary !px-8 !py-4 group">
              {t.hero.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
