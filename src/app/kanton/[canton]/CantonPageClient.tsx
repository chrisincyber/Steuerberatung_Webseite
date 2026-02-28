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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-44 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium dark-text-secondary">
                Kanton {cantonName} ({data.code})
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold dark-text-primary leading-[1.1] tracking-tight">
              {ct.heroTitle.replace('{canton}', cantonName)}
            </h1>

            <p className="mt-6 text-lg sm:text-xl dark-text-secondary max-w-2xl leading-relaxed">
              {ct.heroSubtitle.replace('{canton}', cantonName)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/pricing"
                className="btn-white !px-8 !py-4 !text-base group"
              >
                {ct.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80H1440V40C1440 40 1320 0 1080 20C840 40 720 60 480 40C240 20 120 0 0 20V80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Deadline & Tax Info */}
      <section className="section-padding">
        <div className="container-narrow">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-10">
            {ct.deadlineTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-6 h-6 text-navy-700" />
              </div>
              <p className="text-sm text-navy-500 mb-1">{ct.deadlineLabel}</p>
              <p className="text-xl font-bold text-navy-900">{data.deadline}</p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
                <CalendarClock className="w-6 h-6 text-navy-700" />
              </div>
              <p className="text-sm text-navy-500 mb-1">{ct.extensionLabel}</p>
              <p className="text-xl font-bold text-navy-900">{data.extension}</p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-navy-700" />
              </div>
              <p className="text-sm text-navy-500 mb-1">{ct.taxMultiplierLabel}</p>
              <p className="text-xl font-bold text-navy-900">{(data.taxMultiplier * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-12">
            {ct.whyUs.title.replace('{canton}', cantonName)}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ct.whyUs.items.map((item, i) => {
              const Icon = whyUsIcons[i]
              return (
                <div key={i} className="card p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-trust-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-trust-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy-900 mb-1">{item.title}</h3>
                    <p className="text-navy-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl gradient-navy p-8 sm:p-12 lg:p-16">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold dark-text-primary mb-6">
                {ct.cta}
              </h2>
              <Link
                href="/pricing"
                className="btn-white !px-10 !py-4 !text-base group"
              >
                {ct.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Cantons */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-10">
            {ct.otherCantons}
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {cantons.map((c) => {
              const cSlug = cantonSlugs[c.code]
              const isCurrent = cSlug === slug
              return (
                <Link
                  key={c.code}
                  href={`/kanton/${cSlug}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
