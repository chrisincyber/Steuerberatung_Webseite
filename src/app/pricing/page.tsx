'use client'

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Shield,
  RotateCcw,
  Clock,
  User,
  Users,
  GraduationCap,
  Home,
  Bitcoin,
  Baby,
  Briefcase,
  Zap,
  Minus,
  Plus,
  Repeat,
  Info,
  ChevronDown,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Personentyp = 'lehrling' | 'einzelperson' | 'ehepaar'
type StepId = 'personentyp' | 'zusatzleistungen' | 'selbstaendig' | 'bearbeitungszeit' | 'result'

type KryptoOption = 'none' | 'basic' | 'komplex'

interface WizardState {
  personentyp: Personentyp | null
  liegenschaften: number
  krypto: KryptoOption
  kinder: number
  selbstaendig: boolean | null
  express: boolean | null
  abo: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const INITIAL_STATE: WizardState = {
  personentyp: null,
  liegenschaften: 0,
  krypto: 'none',
  kinder: 0,
  selbstaendig: null,
  express: null,
  abo: false,
}

// ---------------------------------------------------------------------------
// Price Calculation
// ---------------------------------------------------------------------------

function calculatePrice(state: WizardState): {
  total: number
  aboTotal: number
  aboSavings: number
  breakdown: { label: string; amount: number }[]
} {
  const breakdown: { label: string; amount: number }[] = []

  // Basispreis
  const basePrice = state.personentyp === 'lehrling' ? 89
    : state.personentyp === 'ehepaar' ? 179 : 149
  breakdown.push({ label: 'Basispreis', amount: basePrice })

  // Liegenschaften
  if (state.liegenschaften > 0) {
    breakdown.push({ label: `${state.liegenschaften}× Liegenschaft`, amount: state.liegenschaften * 40 })
  }

  // Krypto
  if (state.krypto === 'basic') {
    breakdown.push({ label: 'Krypto Basic', amount: 60 })
  }

  // Kinder
  if (state.kinder > 0) {
    breakdown.push({ label: `${state.kinder}× Kind/Unterhalt`, amount: state.kinder * 20 })
  }

  // Express
  if (state.express) {
    breakdown.push({ label: 'Express-Bearbeitung', amount: 40 })
  }

  const total = breakdown.reduce((s, b) => s + b.amount, 0)
  const aboSavings = Math.round(total * 0.1)
  const aboTotal = total - aboSavings

  return { total, aboTotal, aboSavings, breakdown }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function getSteps(): StepId[] {
  return ['personentyp', 'zusatzleistungen', 'selbstaendig', 'bearbeitungszeit', 'result']
}

function canAdvance(step: StepId, state: WizardState): boolean {
  switch (step) {
    case 'personentyp':
      return state.personentyp !== null
    case 'zusatzleistungen':
      return true // always can advance, selections are optional
    case 'selbstaendig':
      return state.selbstaendig !== null
    case 'bearbeitungszeit':
      return state.express !== null
    default:
      return true
  }
}

// Declare dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PricingPageWrapper() {
  return (
    <Suspense>
      <PricingPage />
    </Suspense>
  )
}

export default PricingPageWrapper

function PricingPage() {
  const { t, locale } = useI18n()

  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const pricingRouter = useRouter()
  const pricingSearchParams = useSearchParams()
  const partnerIdParam = pricingSearchParams.get('partner_id') || null
  const yearParam = pricingSearchParams.get('year') || '2025'
  const steps = useMemo(() => getSteps(), [])
  const currentStep = steps[stepIndex]
  const { total, aboTotal, aboSavings, breakdown } = useMemo(() => calculatePrice(state), [state])

  const [orderLoading, setOrderLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const handleOrderNow = useCallback(async () => {
    const finalPrice = state.abo ? aboTotal : total

    // Selbständige: no Stripe, go to registration/dashboard directly
    if (state.selbstaendig) {
      const params = new URLSearchParams({
        year: yearParam,
        selbstaendig: 'true',
        ...(partnerIdParam ? { partner_id: partnerIdParam } : {}),
      })

      const supabase = createClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          pricingRouter.push(`/dashboard?${params.toString()}`)
          return
        }
      }

      pricingRouter.push(`/auth/register?redirect=${encodeURIComponent(`/dashboard?${params.toString()}`)}`)
      return
    }

    // All others: go through embedded Stripe Checkout
    setOrderLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: finalPrice,
          year: parseInt(yearParam, 10),
          selbstaendig: false,
          express: state.express === true,
          abo: state.abo,
          ...(partnerIdParam ? { partner_id: partnerIdParam } : {}),
        }),
      })

      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setShowCheckout(true)
      } else {
        console.error('No client secret returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setOrderLoading(false)
    }
  }, [total, aboTotal, state.selbstaendig, state.express, state.abo, pricingRouter, partnerIdParam, yearParam])

  const handleCancelCheckout = useCallback(() => {
    setShowCheckout(false)
    setClientSecret(null)
  }, [])

  // Progress: exclude result step
  const isQuestionnaireStep = currentStep !== 'result'
  const questionnaireSteps = steps.filter((s) => s !== 'result')
  const questionnaireTotal = questionnaireSteps.length
  const questionnaireIndex = questionnaireSteps.indexOf(currentStep as typeof questionnaireSteps[number])

  // Analytics
  useEffect(() => {
    if (currentStep === 'result') {
      window.dataLayer?.push({ event: 'pricing_completed', price: total })
    } else {
      window.dataLayer?.push({ event: 'pricing_step', step: stepIndex + 1 })
    }
  }, [stepIndex, currentStep, total])

  // Navigation
  const goNext = useCallback(() => {
    setDirection('forward')
    setAnimKey((k) => k + 1)
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const goBack = useCallback(() => {
    if (stepIndex === 0) return
    setDirection('backward')
    setAnimKey((k) => k + 1)
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }, [stepIndex])

  const restart = useCallback(() => {
    setState(INITIAL_STATE)
    setStepIndex(0)
    setDirection('forward')
    setAnimKey((k) => k + 1)
  }, [])

  // State updaters
  const selectPersonentyp = useCallback(
    (val: Personentyp) => {
      setState({
        ...INITIAL_STATE,
        personentyp: val,
      })
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(1)
      }, 150)
    },
    [],
  )

  const selectSelbstaendig = useCallback(
    (val: boolean) => {
      setState((prev) => ({ ...prev, selbstaendig: val }))
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(3) // bearbeitungszeit
      }, 150)
    },
    [],
  )

  const selectExpress = useCallback(
    (val: boolean) => {
      setState((prev) => ({ ...prev, express: val }))
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(4) // result
      }, 150)
    },
    [],
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (stepIndex > 0 && currentStep !== 'result') {
          goBack()
        }
      }
      if (e.key === 'Enter' && currentStep !== 'result' && currentStep !== 'personentyp') {
        if (canAdvance(currentStep, state)) {
          goNext()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [stepIndex, currentStep, state, goBack, goNext])

  // Scroll to top on step change
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stepIndex])

  const animClass = direction === 'forward' ? 'wizard-forward' : 'wizard-backward'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-14 lg:pt-36 lg:pb-18 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t.pricing.title}
          </h1>
          <p className="mt-3 text-lg text-navy-200 max-w-xl mx-auto">
            {t.pricing.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-trust-400" />
            <span className="text-sm font-semibold text-white">{t.pricing.transparentBadge}</span>
          </div>
        </div>
      </section>

      {/* Wizard container */}
      <section ref={containerRef} className="section-padding -mt-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          {isQuestionnaireStep && (
            <div className="mb-8" role="progressbar" aria-valuenow={questionnaireIndex + 1} aria-valuemin={1} aria-valuemax={questionnaireTotal}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy-600">
                  {t.pricing.progress} {questionnaireIndex + 1} {t.pricing.progressOf} {questionnaireTotal}
                </span>
                {stepIndex > 0 && (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors"
                    aria-label={t.common.back}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.common.back}
                  </button>
                )}
              </div>
              <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-navy-800 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((questionnaireIndex + 1) / questionnaireTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          <div key={animKey} className={animClass}>
            {/* ---- Step 1: Personentyp ---- */}
            {currentStep === 'personentyp' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.personentyp.question}</StepQuestion>
                <div className="grid gap-4 mt-8">
                  <OptionButton
                    selected={state.personentyp === 'lehrling'}
                    onClick={() => selectPersonentyp('lehrling')}
                    aria-label={t.pricing.steps.personentyp.options.lehrling}
                  >
                    <GraduationCap className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">{t.pricing.steps.personentyp.options.lehrling}</span>
                      <p className={`text-sm mt-0.5 ${state.personentyp === 'lehrling' ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.personentyp.options.lehrlingHint}
                      </p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${state.personentyp === 'lehrling' ? 'text-white' : 'text-navy-500'}`}>
                      CHF 89.-
                    </span>
                  </OptionButton>
                  <OptionButton
                    selected={state.personentyp === 'einzelperson'}
                    onClick={() => selectPersonentyp('einzelperson')}
                    aria-label={t.pricing.steps.personentyp.options.einzelperson}
                  >
                    <User className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">{t.pricing.steps.personentyp.options.einzelperson}</span>
                      <p className={`text-sm mt-0.5 ${state.personentyp === 'einzelperson' ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.personentyp.options.einzelpersonHint}
                      </p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${state.personentyp === 'einzelperson' ? 'text-white' : 'text-navy-500'}`}>
                      CHF 149.-
                    </span>
                  </OptionButton>
                  <OptionButton
                    selected={state.personentyp === 'ehepaar'}
                    onClick={() => selectPersonentyp('ehepaar')}
                    aria-label={t.pricing.steps.personentyp.options.ehepaar}
                  >
                    <Users className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">{t.pricing.steps.personentyp.options.ehepaar}</span>
                      <p className={`text-sm mt-0.5 ${state.personentyp === 'ehepaar' ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.personentyp.options.ehepaarHint}
                      </p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${state.personentyp === 'ehepaar' ? 'text-white' : 'text-navy-500'}`}>
                      CHF 179.-
                    </span>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Step 2: Zusatzleistungen ---- */}
            {currentStep === 'zusatzleistungen' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.zusatzleistungen.question}</StepQuestion>
                <p className="text-navy-500 text-sm mt-2 mb-8 text-center">{t.pricing.steps.zusatzleistungen.hint}</p>
                <div className="space-y-4">
                  {/* Liegenschaften */}
                  <div
                    className={`flex items-center gap-4 w-full px-6 py-5 rounded-xl border-2 transition-all duration-200 ${
                      state.liegenschaften > 0
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : 'border-navy-200 text-navy-700'
                    }`}
                  >
                    <Home className="w-6 h-6 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-medium">{t.pricing.steps.zusatzleistungen.options.liegenschaften}</span>
                      <p className={`text-sm mt-0.5 ${state.liegenschaften > 0 ? 'text-white/70' : 'text-navy-500'}`}>
                        CHF 40.- {t.pricing.steps.zusatzleistungen.perUnit}
                      </p>
                    </div>
                    <NumberStepper
                      value={state.liegenschaften}
                      min={0}
                      max={10}
                      onChange={(v) => setState((prev) => ({ ...prev, liegenschaften: v }))}
                      inverted={state.liegenschaften > 0}
                    />
                  </div>

                  {/* Krypto Dropdown */}
                  <div
                    className={`flex items-center gap-4 w-full px-6 py-5 rounded-xl border-2 transition-all duration-200 ${
                      state.krypto !== 'none'
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : 'border-navy-200 text-navy-700'
                    }`}
                  >
                    <Bitcoin className="w-6 h-6 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-medium">{t.pricing.steps.zusatzleistungen.options.kryptoLabel}</span>
                      {state.krypto !== 'none' && (
                        <p className="text-sm mt-0.5 text-white/70">
                          {state.krypto === 'basic'
                            ? t.pricing.steps.zusatzleistungen.options.kryptoBasicHint
                            : t.pricing.steps.zusatzleistungen.options.kryptoKomplexHint}
                        </p>
                      )}
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={state.krypto}
                        onChange={(e) => setState((prev) => ({ ...prev, krypto: e.target.value as KryptoOption }))}
                        className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 ${
                          state.krypto !== 'none'
                            ? 'bg-white/20 text-white border border-white/20'
                            : 'bg-navy-50 text-navy-700 border border-navy-200'
                        }`}
                      >
                        <option value="none">{t.pricing.steps.zusatzleistungen.options.kryptoNone}</option>
                        <option value="basic">{t.pricing.steps.zusatzleistungen.options.kryptoBasic} – CHF 60.-</option>
                        <option value="komplex">{t.pricing.steps.zusatzleistungen.options.kryptoKomplex} – {t.pricing.steps.zusatzleistungen.nachAufwand}</option>
                      </select>
                      <ChevronDown className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                        state.krypto !== 'none' ? 'text-white/70' : 'text-navy-400'
                      }`} />
                    </div>
                  </div>

                  {/* Kinder */}
                  <div
                    className={`flex items-center gap-4 w-full px-6 py-5 rounded-xl border-2 transition-all duration-200 ${
                      state.kinder > 0
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : 'border-navy-200 text-navy-700'
                    }`}
                  >
                    <Baby className="w-6 h-6 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-medium">{t.pricing.steps.zusatzleistungen.options.kinder}</span>
                      <p className={`text-sm mt-0.5 ${state.kinder > 0 ? 'text-white/70' : 'text-navy-500'}`}>
                        CHF 20.- {t.pricing.steps.zusatzleistungen.perChild}
                      </p>
                    </div>
                    <NumberStepper
                      value={state.kinder}
                      min={0}
                      max={10}
                      onChange={(v) => setState((prev) => ({ ...prev, kinder: v }))}
                      inverted={state.kinder > 0}
                    />
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={goNext}
                  className="btn-white w-full mt-8 group"
                  aria-label={t.common.next}
                >
                  {state.liegenschaften === 0 && state.krypto === 'none' && state.kinder === 0
                    ? t.pricing.steps.zusatzleistungen.noneButton
                    : t.common.next}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </StepCard>
            )}

            {/* ---- Step 3: Selbständig ---- */}
            {currentStep === 'selbstaendig' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.selbstaendig.question}</StepQuestion>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <OptionButton
                    selected={state.selbstaendig === false}
                    onClick={() => selectSelbstaendig(false)}
                    aria-label={t.pricing.steps.selbstaendig.options.nein}
                  >
                    <span className="text-lg font-medium">{t.pricing.steps.selbstaendig.options.nein}</span>
                  </OptionButton>
                  <OptionButton
                    selected={state.selbstaendig === true}
                    onClick={() => selectSelbstaendig(true)}
                    aria-label={t.pricing.steps.selbstaendig.options.ja}
                  >
                    <Briefcase className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.selbstaendig.options.ja}</span>
                  </OptionButton>
                </div>
                {state.selbstaendig === true && (
                  <div className="mt-6 p-4 rounded-xl bg-navy-50 border border-navy-200">
                    <p className="text-sm text-navy-600">
                      {t.pricing.steps.selbstaendig.disclaimer}
                    </p>
                  </div>
                )}
              </StepCard>
            )}

            {/* ---- Step 4: Bearbeitungszeit ---- */}
            {currentStep === 'bearbeitungszeit' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.bearbeitungszeit.question}</StepQuestion>
                <div className="grid gap-4 mt-8">
                  <OptionButton
                    selected={state.express === false}
                    onClick={() => selectExpress(false)}
                    aria-label={t.pricing.steps.bearbeitungszeit.options.standard}
                  >
                    <Clock className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">{t.pricing.steps.bearbeitungszeit.options.standard}</span>
                      <p className={`text-sm mt-0.5 ${state.express === false ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.bearbeitungszeit.standardHint}
                      </p>
                    </div>
                    <span className={`text-lg font-bold shrink-0 ${state.express === false ? 'text-white' : 'text-navy-500'}`}>
                      CHF 0.-
                    </span>
                  </OptionButton>
                  <OptionButton
                    selected={state.express === true}
                    onClick={() => selectExpress(true)}
                    aria-label={t.pricing.steps.bearbeitungszeit.options.express}
                  >
                    <Zap className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">{t.pricing.steps.bearbeitungszeit.options.express}</span>
                      <p className={`text-sm mt-0.5 ${state.express === true ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.bearbeitungszeit.expressHint}
                      </p>
                    </div>
                    <span className={`text-lg font-bold shrink-0 ${state.express === true ? 'text-white' : 'text-navy-900'}`}>
                      + CHF 40.-
                    </span>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Result Screen ---- */}
            {currentStep === 'result' && (
              <div className="wizard-fade-up">
                <div className="card p-8 sm:p-10 lg:p-12">
                  {/* Back button */}
                  <div className="text-left mb-4">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors"
                      aria-label={t.common.back}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t.common.back}
                    </button>
                  </div>

                  {/* Heading */}
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 text-center">
                    {t.pricing.result.heading}
                  </h2>

                  {/* Breakdown table */}
                  <div className="mt-8 max-w-md mx-auto">
                    <div className="space-y-3">
                      {breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-navy-100 last:border-b-0">
                          <span className="text-navy-700 text-sm">{item.label}</span>
                          <span className="text-navy-900 font-medium text-sm">CHF {item.amount}.-</span>
                        </div>
                      ))}
                      {state.krypto === 'komplex' && (
                        <div className="flex items-center justify-between py-2 border-b border-navy-100">
                          <span className="text-navy-700 text-sm">{t.pricing.result.kryptoKomplexLine}</span>
                          <span className="text-navy-500 font-medium text-sm italic">{t.pricing.result.nachAufwand}</span>
                        </div>
                      )}
                      {state.selbstaendig && (
                        <div className="flex items-center justify-between py-2 border-b border-navy-100">
                          <span className="text-navy-700 text-sm">{t.pricing.result.selbstaendigLine}</span>
                          <span className="text-navy-500 font-medium text-sm italic">{t.pricing.result.selbstaendigPrice}</span>
                        </div>
                      )}
                      {state.abo && (
                        <div className="flex items-center justify-between py-2 border-b border-navy-100">
                          <span className="text-trust-700 text-sm font-medium">{t.pricing.result.aboDiscount}</span>
                          <span className="text-trust-700 font-medium text-sm">− CHF {aboSavings}.-</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t-2 border-navy-800 flex items-center justify-between">
                      <span className="font-heading font-bold text-navy-900 text-lg">{t.pricing.result.total}</span>
                      <span className="font-heading font-bold text-navy-900 text-3xl sm:text-4xl">
                        CHF {state.abo ? aboTotal : total}.-
                      </span>
                    </div>
                  </div>

                  {/* Abo Toggle */}
                  <div className="mt-8 max-w-md mx-auto">
                    <div className="flex rounded-xl border-2 border-navy-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setState((prev) => ({ ...prev, abo: false }))}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          !state.abo
                            ? 'bg-navy-800 text-white'
                            : 'bg-white text-navy-600 hover:bg-navy-50'
                        }`}
                      >
                        {t.pricing.result.aboToggleEinmalig}
                      </button>
                      <button
                        type="button"
                        onClick={() => setState((prev) => ({ ...prev, abo: true }))}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          state.abo
                            ? 'bg-navy-800 text-white'
                            : 'bg-white text-navy-600 hover:bg-navy-50'
                        }`}
                      >
                        <Repeat className="w-4 h-4" />
                        {t.pricing.result.aboToggleAbo}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          state.abo ? 'bg-trust-400 text-white' : 'bg-trust-100 text-trust-700'
                        }`}>
                          {t.pricing.result.aboSavingsBadge}
                        </span>
                      </button>
                    </div>

                    {/* Abo note */}
                    {state.abo && (
                      <div className="mt-4 p-4 rounded-xl bg-trust-50 border border-trust-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-trust-500 shrink-0" />
                          <span className="text-sm font-medium text-trust-700">{t.pricing.result.aboNote.title}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-trust-600 ml-6">
                          {t.pricing.result.aboNote.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="shrink-0">·</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Fixed price badge */}
                  <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-trust-50 border border-trust-200 text-trust-700 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      {t.pricing.result.fixedBadge}
                    </div>
                  </div>

                  {/* Included hints */}
                  <div className="mt-8 flex justify-center">
                    <ul className="space-y-3 inline-block">
                      {t.pricing.result.included.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-trust-500 shrink-0 mt-0.5" />
                          <span className="text-navy-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selbständig disclaimer */}
                  {state.selbstaendig && (
                    <div className="mt-6 p-4 rounded-xl bg-navy-50 border border-navy-200 max-w-md mx-auto">
                      <p className="text-sm text-navy-600 text-center">
                        {t.pricing.result.selbstaendigNote}
                      </p>
                    </div>
                  )}

                  {/* Krypto komplex disclaimer */}
                  {state.krypto === 'komplex' && (
                    <div className="mt-6 p-4 rounded-xl bg-navy-50 border border-navy-200 max-w-md mx-auto">
                      <p className="text-sm text-navy-600 text-center">
                        {t.pricing.result.kryptoKomplexNote}
                      </p>
                    </div>
                  )}

                  {/* CTA / Embedded Checkout */}
                  {showCheckout && clientSecret ? (
                    <div className="mt-10">
                      <button
                        onClick={handleCancelCheckout}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t.common.back}
                      </button>
                      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                        <EmbeddedCheckout />
                      </EmbeddedCheckoutProvider>
                    </div>
                  ) : (
                    <div className="mt-10 flex justify-center">
                      <button
                        onClick={handleOrderNow}
                        disabled={orderLoading}
                        className="btn-white group text-base !px-8 !py-4 disabled:opacity-50"
                      >
                        {orderLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t.pricing.paymentLoading}
                          </span>
                        ) : (
                          <>
                            {t.pricing.cta}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Restart */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={restart}
                      className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-navy-600 transition-colors"
                      aria-label={t.pricing.result.restart}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t.pricing.result.restart}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-navy-300 text-center">
                    {locale === 'de' ? 'Mit Abschluss durch Zahlung akzeptieren Sie unsere ' : 'By completing payment you accept our '}
                    <Link href="/privacy" className="underline hover:text-navy-500">
                      {locale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
                    </Link>
                    {' & '}
                    <Link href="/agb" className="underline hover:text-navy-500">
                      {locale === 'de' ? 'AGB' : 'Terms of Service'}
                    </Link>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card p-8 sm:p-10" role="group">
      {children}
    </div>
  )
}

function StepQuestion({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900 text-center">
      {children}
    </h2>
  )
}

function OptionButton({
  selected,
  onClick,
  children,
  ...rest
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 ${
        selected
          ? 'border-navy-800 bg-navy-800 text-white shadow-md'
          : 'border-navy-200 text-navy-700 hover:border-navy-400 hover:bg-navy-50'
      }`}
      {...rest}
    >
      {children}
    </button>
  )
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
  inverted,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  inverted?: boolean
}) {
  const borderColor = inverted ? 'border-white/30' : 'border-navy-200'
  const textColor = inverted ? 'text-white' : 'text-navy-600'
  const hoverBg = inverted ? 'hover:bg-white/10' : 'hover:bg-navy-100'

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        disabled={value <= min}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border ${borderColor} ${textColor} ${hoverBg} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={`w-8 text-center text-sm font-semibold ${inverted ? 'text-white' : 'text-navy-900'}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        disabled={value >= max}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border ${borderColor} ${textColor} ${hoverBg} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
