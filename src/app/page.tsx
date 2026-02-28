'use client'

import { useState, useEffect, useRef } from 'react'
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
  Check,
  Quote,
  Server,
} from 'lucide-react'

function useTypewriter(words: readonly string[], typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(words[0])
      return
    }

    const currentWord = words[wordIndex]

    if (!isDeleting && displayText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
      return
    }

    const timeout = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? currentWord.substring(0, displayText.length - 1)
          : currentWord.substring(0, displayText.length + 1)
      )
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration, prefersReducedMotion])

  return { displayText, prefersReducedMotion }
}

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

function SectionWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`${inView ? 'animate-section-in' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

export default function HomePage() {
  const { t } = useI18n()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const { displayText, prefersReducedMotion } = useTypewriter(t.hero.titleRotatingWords)
  const declarations = useCountUp(1000)

  return (
    <>
      {/* ============ HERO SECTION ============ */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-navy-700/20 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl animate-float-slow" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-48 lg:pb-36">
          <div className="max-w-3xl">
            <div className="animate-hero-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium dark-text-secondary">
                {t.hero.trustBadge}
              </span>
            </div>

            <h1 className="animate-hero-2 font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold dark-text-primary leading-[1.1] tracking-tight">
              {t.hero.title}
              <br />
              <span className="text-gradient">
                {t.hero.titleAccent}
                <span className="inline">
                  {displayText}
                  {!prefersReducedMotion && <span className="typewriter-cursor">|</span>}
                </span>
              </span>
            </h1>

            <p className="animate-hero-3 mt-6 text-lg sm:text-xl dark-text-secondary max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="animate-hero-3 flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/pricing"
                className="btn-white !px-8 !py-4 !text-base group"
              >
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stat counters with badge containers */}
            <div className="animate-hero-4 flex flex-wrap gap-3 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3.5 py-2 border border-white/10">
                <span className="text-sm font-semibold text-white">Seit 2018</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3.5 py-2 border border-white/10 flex items-center gap-1.5">
                <span ref={declarations.ref} className="text-sm font-semibold text-white">
                  {declarations.count.toLocaleString('de-CH')}{declarations.count >= 1000 ? '+' : ''}
                </span>
                <span className="text-sm dark-text-secondary">Steuererklärungen</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3.5 py-2 border border-white/10">
                <span className="text-sm font-semibold text-white">Schweizer Datenschutz</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80H1440V40C1440 40 1320 0 1080 20C840 40 720 60 480 40C240 20 120 0 0 20V80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ============ SOCIAL PROOF BAR ============ */}
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

      {/* ============ TRUST BADGES ============ */}
      <section className="section-padding">
        <SectionWrapper>
          <div className="container-wide">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, ...t.trustBadges.swissPrivacy },
                { icon: Lock, ...t.trustBadges.sslEncrypted },
                { icon: Server, ...t.trustBadges.swissServer },
              ].map((item, i) => (
                <div key={i} className="glass-card !bg-trust-50/60 !border-trust-200/40 p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-trust-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-trust-600" />
                  </div>
                  <h3 className="font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-navy-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

      {/* ============ PROBLEM / PAIN SECTION ============ */}
      <section className="section-padding">
        <SectionWrapper>
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
        </SectionWrapper>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="section-padding bg-navy-50/50">
        <SectionWrapper>
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
        </SectionWrapper>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="so-gehts" className="section-padding scroll-mt-20">
        <SectionWrapper>
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
        </SectionWrapper>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

      {/* ============ DASHBOARD MOCKUP (replaces portal feature cards) ============ */}
      <section className="section-padding bg-navy-50/50">
        <SectionWrapper>
          <div className="container-wide">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-sm font-semibold mb-4">
                {t.dashboardPreview.badge}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
                {t.dashboardPreview.title}
              </h2>
              <p className="mt-4 text-navy-600 text-lg max-w-2xl mx-auto">
                {t.dashboardPreview.subtitle}
              </p>
            </div>

            {/* Browser window mockup */}
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-navy-200 shadow-xl overflow-hidden bg-white">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 px-4 py-3 bg-navy-50 border-b border-navy-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-navy-200 text-sm text-navy-400 max-w-xs w-full">
                      <Lock className="w-3.5 h-3.5 text-trust-500" />
                      <span>portal.petertiltax.ch</span>
                    </div>
                  </div>
                  <div className="w-[54px]" /> {/* Spacer for symmetry */}
                </div>

                {/* Dashboard content */}
                <div className="p-6 sm:p-8">
                  {/* Stat cards row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-navy-50 p-4">
                      <div className="w-16 h-3 bg-navy-200 rounded mb-2" />
                      <div className="w-10 h-6 bg-navy-300 rounded" />
                    </div>
                    <div className="rounded-xl bg-trust-50 p-4">
                      <div className="w-16 h-3 bg-trust-200 rounded mb-2" />
                      <div className="w-10 h-6 bg-trust-300 rounded" />
                    </div>
                    <div className="rounded-xl bg-gold-50 p-4">
                      <div className="w-16 h-3 bg-gold-200 rounded mb-2" />
                      <div className="w-10 h-6 bg-gold-300 rounded" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                    {/* Document list */}
                    <div className="sm:col-span-3 rounded-xl border border-navy-100 p-4">
                      <div className="w-24 h-3 bg-navy-200 rounded mb-4" />
                      {[
                        { status: 'bg-trust-400', width: 'w-32' },
                        { status: 'bg-gold-400', width: 'w-28' },
                        { status: 'bg-navy-300', width: 'w-36' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-navy-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-navy-100" />
                            <div className={`h-3 ${doc.width} bg-navy-200 rounded`} />
                          </div>
                          <div className={`w-16 h-5 ${doc.status} rounded-full opacity-60`} />
                        </div>
                      ))}
                    </div>

                    {/* Chat preview */}
                    <div className="sm:col-span-2 rounded-xl border border-navy-100 p-4">
                      <div className="w-20 h-3 bg-navy-200 rounded mb-4" />
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="w-3/4 h-8 bg-navy-100 rounded-xl rounded-br-sm" />
                        </div>
                        <div className="flex justify-start">
                          <div className="w-2/3 h-12 bg-navy-800 rounded-xl rounded-bl-sm opacity-20" />
                        </div>
                        <div className="flex justify-end">
                          <div className="w-1/2 h-8 bg-navy-100 rounded-xl rounded-br-sm" />
                        </div>
                      </div>
                      <div className="mt-4 h-9 rounded-lg border border-navy-200 bg-navy-50/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
              {t.dashboardPreview.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-trust-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-trust-600" />
                  </div>
                  <span className="text-navy-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

      {/* ============ TESTIMONIALS (restyled) ============ */}
      <section className="section-padding bg-navy-50/30">
        <SectionWrapper>
          <div className="container-wide">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-sm font-semibold">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                5.0 von 5.0
              </span>
            </div>
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
                {t.testimonials.title}
              </h2>
              <p className="mt-4 text-navy-600 text-lg">
                {t.testimonials.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {t.testimonials.items.map((review, i) => (
                <div key={i} className="review-card relative">
                  {/* Decorative quote */}
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-navy-100" />

                  {/* Stars */}
                  <div className="flex items-center gap-1.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-gold-400 text-gold-400" />
                    ))}
                    <span className="text-sm font-semibold text-navy-700 ml-2">5.0</span>
                  </div>

                  {/* Review text */}
                  <p className="text-navy-800 text-base leading-relaxed mb-6 relative z-10">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="border-t border-navy-100 pt-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-navy-900">{review.name}</div>
                        <div className="text-xs text-navy-500">{review.location} &middot; {review.context}</div>
                      </div>
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
        </SectionWrapper>
      </section>

      {/* ============ GUARANTEE SECTION ============ */}
      <section className="section-padding">
        <SectionWrapper>
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
        </SectionWrapper>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

      {/* ============ FAQ PREVIEW ============ */}
      <section className="section-padding bg-navy-50/50">
        <SectionWrapper>
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
                      className={`w-5 h-5 text-navy-400 shrink-0 ml-4 transition-transform duration-300 ${
                        openFaqIndex === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: openFaqIndex === i ? '1fr' : '0fr',
                      opacity: openFaqIndex === i ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                        <p className="text-navy-600 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
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
        </SectionWrapper>
      </section>

      {/* ============ FINAL CTA ============ */}
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
