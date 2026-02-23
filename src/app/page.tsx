'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import {
  ArrowRight,
  Upload,
  FileCheck,
  PartyPopper,
  Monitor,
  Zap,
  Award,
  Wallet,
  Star,
  Gift,
  ChevronRight,
  Shield,
} from 'lucide-react'

export default function HomePage() {
  const { t, locale } = useI18n()

  return (
    <>
      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-navy-700/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-44 lg:pb-32">
          <div className="max-w-3xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Shield className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium text-navy-200">
                {locale === 'de' ? 'Geprüfter Schweizer Finanzplaner' : 'Certified Swiss Financial Planner'}
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              {t.hero.title}
              <br />
              <span className="text-gradient">{t.hero.titleAccent}</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-navy-200 max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/auth/register"
                className="btn-gold !px-8 !py-4 !text-base group"
              >
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-navy-300">{locale === 'de' ? 'Zufriedene Kunden' : 'Satisfied Clients'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1&apos;000+</div>
                <div className="text-sm text-navy-300">{locale === 'de' ? 'Steuererklärungen' : 'Tax Declarations'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">26</div>
                <div className="text-sm text-navy-300">{locale === 'de' ? 'Kantone abgedeckt' : 'Cantons Covered'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80H1440V40C1440 40 1320 0 1080 20C840 40 720 60 480 40C240 20 120 0 0 20V80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.values.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Monitor, ...t.values.digital },
              { icon: Zap, ...t.values.fast },
              { icon: Award, ...t.values.qualified },
              { icon: Wallet, ...t.values.affordable },
            ].map((item, i) => (
              <div key={i} className="card p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-navy-100 transition-colors">
                  <item.icon className="w-7 h-7 text-navy-700" />
                </div>
                <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">{item.title}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.howItWorks.title}
            </h2>
            <p className="mt-4 text-navy-600 text-lg max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Upload, step: '01', ...t.howItWorks.step1 },
              { icon: FileCheck, step: '02', ...t.howItWorks.step2 },
              { icon: PartyPopper, step: '03', ...t.howItWorks.step3 },
            ].map((item, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-14 left-[60%] right-[-40%] h-[2px] bg-navy-200">
                    <ChevronRight className="absolute -right-3 -top-[7px] w-4 h-4 text-navy-300" />
                  </div>
                )}
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-28 h-28 rounded-3xl bg-white shadow-sm border border-navy-100 flex items-center justify-center mx-auto group hover:shadow-md transition-shadow">
                      <item.icon className="w-12 h-12 text-navy-700" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-navy text-white text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-navy-900 mt-6 mb-3">{item.title}</h3>
                  <p className="text-navy-600 text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/auth/register" className="btn-primary !px-8 !py-4 group">
              {t.hero.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.testimonials.title}
            </h2>
            <p className="mt-4 text-navy-600 text-lg">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Sarah M.',
                location: 'Zürich',
                text: locale === 'de'
                  ? '\"Unkompliziert und professionell. Meine Steuererklärung war schneller fertig als erwartet. Sehr empfehlenswert!\"'
                  : '\"Uncomplicated and professional. My tax declaration was completed faster than expected. Highly recommended!\"',
              },
              {
                name: 'Thomas K.',
                location: 'Bern',
                text: locale === 'de'
                  ? '\"Endlich ein Service, der wirklich digital funktioniert. Alles online, keine unnötigen Termine. Top!\"'
                  : '\"Finally a service that truly works digitally. Everything online, no unnecessary appointments. Top!\"',
              },
              {
                name: 'Laura B.',
                location: 'Basel',
                text: locale === 'de'
                  ? '\"Faire Preise und kompetente Beratung. Ich habe sogar mehr Abzüge erhalten als in den Vorjahren. Danke!\"'
                  : '\"Fair prices and competent advice. I even received more deductions than in previous years. Thank you!\"',
              },
            ].map((review, i) => (
              <div key={i} className="card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-navy-700 text-sm leading-relaxed mb-6">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-navy-700">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy-900">{review.name}</div>
                    <div className="text-xs text-navy-500">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl gradient-navy p-8 sm:p-12 lg:p-16">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="w-20 h-20 rounded-2xl bg-gold-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-10 h-10 text-gold-400" />
              </div>
              <div className="text-center lg:text-left flex-1">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t.referral.title}
                </h2>
                <p className="text-xl font-semibold text-gold-400 mb-3">
                  {t.referral.subtitle}
                </p>
                <p className="text-navy-200 max-w-lg">
                  {t.referral.description}
                </p>
              </div>
              <Link
                href="/auth/register"
                className="btn-gold !px-8 !py-4 shrink-0 group"
              >
                {t.referral.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
