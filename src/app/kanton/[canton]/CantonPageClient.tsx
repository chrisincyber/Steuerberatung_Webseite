'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonSlugs, getCantonBySlug } from '@/lib/swiss-data'
import {
  ArrowRight,
  Shield,
  CalendarDays,
  CalendarClock,
  TrendingUp,
  MapPin,
  CreditCard,
  User,
  Laptop,
} from 'lucide-react'

export default function CantonPageClient({ slug }: { slug: string }) {
  const { t, locale } = useI18n()
  const data = getCantonBySlug(slug)

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-navy-600">Kanton nicht gefunden.</p>
      </div>
    )
  }

  const cantonName = data.name[locale]
  const ct = t.cantonPage

  const whyUsIcons = [MapPin, CreditCard, User, Laptop]

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-40 lg:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5">
              <Shield className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm font-medium dark-text-secondary">
                Kanton {cantonName} ({data.code})
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold dark-text-primary leading-[1.1] tracking-tight">
              {ct.heroTitle.replace('{canton}', cantonName)}
            </h1>

            <p className="mt-3 text-lg dark-text-secondary max-w-2xl leading-relaxed">
              {ct.heroSubtitle.replace('{canton}', cantonName)}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/pricing"
                className="btn-white !px-6 !py-3 !text-sm group"
              >
                {ct.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0H1440V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Deadline & Tax Info */}
      <section className="py-10 lg:py-14">
        <div className="container-narrow">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900 text-center mb-6">
            {ct.deadlineTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-5 h-5 text-navy-700" />
              </div>
              <p className="text-xs text-navy-500 mb-1">{ct.deadlineLabel}</p>
              <p className="text-lg font-bold text-navy-900">{data.deadline}</p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
                <CalendarClock className="w-5 h-5 text-navy-700" />
              </div>
              <p className="text-xs text-navy-500 mb-1">{ct.extensionLabel}</p>
              <p className="text-lg font-bold text-navy-900">{data.extension}</p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-navy-700" />
              </div>
              <p className="text-xs text-navy-500 mb-1">{ct.taxMultiplierLabel}</p>
              <p className="text-lg font-bold text-navy-900">{(data.taxMultiplier * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-4">
        <Link
          href="/pricing"
          className="btn-primary !px-6 !py-3 !text-sm group inline-flex items-center"
        >
          {ct.cta}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Why Us */}
      <section className="py-10 lg:py-14 bg-navy-50/50">
        <div className="container-wide">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900 text-center mb-8">
            {ct.whyUs.title.replace('{canton}', cantonName)}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {ct.whyUs.items.map((item, i) => {
              const Icon = whyUsIcons[i]
              return (
                <div key={i} className="card p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-trust-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-trust-600" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-navy-900 mb-0.5">{item.title}</h3>
                    <p className="text-navy-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {ct.cta}
              </h2>
              <Link
                href="/pricing"
                className="btn-white !px-8 !py-3 !text-sm group"
              >
                {ct.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Cantons */}
      <section className="py-10 lg:py-14 bg-navy-50/50">
        <div className="container-wide">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900 text-center mb-6">
            {ct.otherCantons}
          </h2>

          <div className="flex flex-wrap justify-center gap-2">
            {cantons.map((c) => {
              const cSlug = cantonSlugs[c.code]
              const isCurrent = cSlug === slug
              return (
                <Link
                  key={c.code}
                  href={`/kanton/${cSlug}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-navy-800 text-white'
                      : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-100 hover:border-navy-300'
                  }`}
                >
                  {c.name[locale]}
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
