'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import {
  ArrowRight,
  Upload,
  FileCheck,
  PartyPopper,
  Inbox,
  Clock,
  UserCheck,
  CreditCard,
  Star,
  ChevronRight,
  Shield,
  ShieldCheck,
  Lock,
  MapPin,
  User,
  ChevronDown,
  AlertCircle,
  FileText,
  MessageCircle,
  Download,
  BarChart3,
} from 'lucide-react'

export default function HomePage() {
  const { t } = useI18n()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <>
      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-navy-700/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-44 lg:pb-32">
          <div className="max-w-3xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium dark-text-secondary">
                {t.hero.trustBadge}
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold dark-text-primary leading-[1.1] tracking-tight">
              {t.hero.title}
              <br />
              <span className="text-gradient">{t.hero.titleAccent}</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl dark-text-secondary max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/pricing"
                className="btn-white !px-8 !py-4 !text-base group"
              >
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#so-gehts"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                {t.hero.ctaSecondary}
              </a>
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

      {/* Social Proof Bar */}
      <section className="py-6 border-b border-navy-100">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-navy-600">
              <FileText className="w-5 h-5 text-navy-400" />
              <span className="text-sm font-medium">{t.socialProof.declarations}</span>
            </div>
            <div className="flex items-center gap-2 text-navy-600">
              <MapPin className="w-5 h-5 text-navy-400" />
              <span className="text-sm font-medium">{t.socialProof.cantons}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Pain Section */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.problem.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {t.problem.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-navy-50 border border-navy-100">
                <AlertCircle className="w-5 h-5 text-navy-400 shrink-0 mt-0.5" />
                <span className="text-navy-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-xl font-heading font-semibold text-navy-900">
            {t.problem.transition}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.benefits.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Inbox, ...t.benefits.noPaperwork },
              { icon: Clock, ...t.benefits.fast },
              { icon: UserCheck, ...t.benefits.experts },
              { icon: CreditCard, ...t.benefits.transparent },
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
      <section id="so-gehts" className="section-padding scroll-mt-20">
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
            <Link href="/pricing" className="btn-primary !px-8 !py-4 group">
              {t.howItWorks.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Client Portal */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.portal.title}
            </h2>
            <p className="mt-4 text-navy-600 text-lg max-w-2xl mx-auto">
              {t.portal.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: MessageCircle, ...t.portal.chat },
              { icon: Upload, ...t.portal.documents },
              { icon: BarChart3, ...t.portal.status },
              { icon: Download, ...t.portal.download },
            ].map((item, i) => (
              <div key={i} className="card p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-navy-800 flex items-center justify-center mx-auto mb-5 group-hover:bg-navy-700 transition-colors">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">{item.title}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
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
            {t.testimonials.items.map((review, i) => (
              <div key={i} className="card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-navy-800 text-navy-800" />
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
                    <div className="text-xs text-navy-500">{review.location} &middot; {review.context}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing" className="btn-primary !px-8 !py-4 group">
              {t.hero.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.guarantee.title}
            </h2>
            <p className="mt-4 text-navy-600 text-lg">
              {t.guarantee.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, ...t.guarantee.items[0] },
              { icon: Lock, ...t.guarantee.items[1] },
              { icon: MapPin, ...t.guarantee.items[2] },
              { icon: User, ...t.guarantee.items[3] },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-trust-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-trust-600" />
                </div>
                <h3 className="font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-navy-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {t.faqPreview.title}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faqPreview.items.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-navy-50/50 transition-colors"
                >
                  <span className="font-semibold text-navy-900">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-navy-400 shrink-0 ml-4 transition-transform duration-200 ${
                      openFaqIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                    <p className="text-navy-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-navy-700 font-medium hover:text-navy-900 transition-colors inline-flex items-center gap-1">
              {t.faqPreview.linkText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl gradient-navy p-8 sm:p-12 lg:p-16">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold dark-text-primary mb-4">
                {t.finalCta.title}
              </h2>
              <p className="dark-text-secondary text-lg mb-8">
                {t.finalCta.subtitle}
              </p>
              <Link
                href="/pricing"
                className="btn-white !px-10 !py-4 !text-base group"
              >
                {t.finalCta.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
