'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  FolderOpen,
  BookOpen,
  BarChart3,
  Shield,
  RotateCcw,
  Clock,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Employment = 'unselbstaendig' | 'selbstaendig' | 'gmbh_ag'
type Asset = 'wertschriften' | 'liegenschaft' | 'krypto' | 'keine'
type Docs = 'ja' | 'teilweise' | 'nein'
type Tier = 'basis' | 'erweitert' | 'komplex'
type StepId = 'employment' | 'assets' | 'ausland' | 'unterlagen' | 'buchhaltung' | 'result'

interface WizardState {
  employment: Employment | null
  assets: Asset[]
  ausland: boolean | null
  unterlagen: Docs | null
  buchhaltung: boolean | null
}

// Icons for employment options
const employmentIcons: Record<Employment, typeof Briefcase> = {
  unselbstaendig: Briefcase,
  selbstaendig: BarChart3,
  gmbh_ag: Building2,
}

// Icons for asset options
const assetIcons: Record<Asset, typeof BarChart3> = {
  wertschriften: BarChart3,
  liegenschaft: Building2,
  krypto: Globe,
  keine: Shield,
}

const INITIAL_STATE: WizardState = {
  employment: null,
  assets: [],
  ausland: null,
  unterlagen: null,
  buchhaltung: null,
}

// ---------------------------------------------------------------------------
// Rule Engine – derives tier from wizard state (no visible price math)
// ---------------------------------------------------------------------------

function calculateTier(state: WizardState): Tier {
  // Selbständig or GmbH/AG → Komplex
  if (state.employment === 'selbstaendig' || state.employment === 'gmbh_ag') {
    return 'komplex'
  }

  // Foreign income/assets → Komplex
  if (state.ausland === true) {
    return 'komplex'
  }

  const hasAssets = state.assets.length > 0 && !state.assets.includes('keine')

  // Unselbständig + assets (Wertschriften / Liegenschaft / Krypto) + no Ausland → Erweitert
  if (state.employment === 'unselbstaendig' && hasAssets) {
    return 'erweitert'
  }

  // Unselbständig + no assets + no Ausland → Basis
  return 'basis'
}

// ---------------------------------------------------------------------------
// Step Sequence – dynamically compute applicable steps
// ---------------------------------------------------------------------------

function getSteps(employment: Employment | null): StepId[] {
  const steps: StepId[] = ['employment']

  if (employment === 'unselbstaendig') {
    steps.push('assets')
  }

  steps.push('ausland', 'unterlagen')

  if (employment === 'selbstaendig') {
    steps.push('buchhaltung')
  }

  steps.push('result')
  return steps
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canAdvance(step: StepId, state: WizardState): boolean {
  switch (step) {
    case 'employment':
      return state.employment !== null
    case 'assets':
      return state.assets.length > 0
    case 'ausland':
      return state.ausland !== null
    case 'unterlagen':
      return state.unterlagen !== null
    case 'buchhaltung':
      return state.buchhaltung !== null
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

export default function PricingPage() {
  const { t } = useI18n()

  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = useMemo(() => getSteps(state.employment), [state.employment])
  const currentStep = steps[stepIndex]
  const totalSteps = steps.length
  const tier = useMemo(() => calculateTier(state), [state])

  // Analytics: track step views
  useEffect(() => {
    if (currentStep === 'result') {
      window.dataLayer?.push({ event: 'pricing_completed', tier: tier })
    } else {
      window.dataLayer?.push({ event: 'pricing_step', step: stepIndex + 1 })
    }
  }, [stepIndex, currentStep, tier])

  // Navigation helpers
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
  const selectEmployment = useCallback(
    (emp: Employment) => {
      setState({
        employment: emp,
        assets: [],
        ausland: null,
        unterlagen: null,
        buchhaltung: null,
      })
      // Auto-advance after selection
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(1) // always index 1 after employment
      }, 150)
    },
    [],
  )

  const toggleAsset = useCallback((asset: Asset) => {
    setState((prev) => {
      if (asset === 'keine') {
        return { ...prev, assets: ['keine'] }
      }
      const without = prev.assets.filter((a) => a !== 'keine' && a !== asset)
      const has = prev.assets.includes(asset)
      return { ...prev, assets: has ? without : [...without, asset] }
    })
  }, [])

  const selectAusland = useCallback(
    (val: boolean) => {
      setState((prev) => ({ ...prev, ausland: val }))
      setTimeout(() => goNext(), 150)
    },
    [goNext],
  )

  const selectUnterlagen = useCallback(
    (val: Docs) => {
      setState((prev) => ({ ...prev, unterlagen: val }))
      setTimeout(() => goNext(), 150)
    },
    [goNext],
  )

  const selectBuchhaltung = useCallback(
    (val: boolean) => {
      setState((prev) => ({ ...prev, buchhaltung: val }))
      setTimeout(() => goNext(), 150)
    },
    [goNext],
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (stepIndex > 0 && currentStep !== 'result') {
          goBack()
        }
      }
      if (e.key === 'Enter' && currentStep !== 'result' && currentStep !== 'employment') {
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

  // Show docs messy note?
  const showMessyDocsNote =
    currentStep === 'result' && (state.unterlagen === 'teilweise' || state.unterlagen === 'nein')

  // Animation class
  const animClass = direction === 'forward' ? 'wizard-forward' : 'wizard-backward'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Hero – compact */}
      <section className="gradient-hero pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t.pricing.title}
          </h1>
          <p className="mt-4 text-lg text-navy-200 max-w-xl mx-auto">
            {t.pricing.subtitle}
          </p>

          {/* Urgency banner */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-gold-500/20 border border-gold-400/30">
            <Clock className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-300">{t.pricing.urgency}</span>
          </div>
        </div>
      </section>

      {/* Wizard container */}
      <section ref={containerRef} className="section-padding -mt-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar (hidden on result) */}
          {currentStep !== 'result' && (
            <div className="mb-8" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={totalSteps - 1}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy-600">
                  {t.pricing.progress} {stepIndex + 1} {t.pricing.progressOf} {totalSteps - 1}
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
                  className="h-full bg-gold-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((stepIndex + 1) / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          <div key={animKey} className={animClass}>
            {/* ---- Step: Employment ---- */}
            {currentStep === 'employment' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.employment.question}</StepQuestion>
                <div className="grid gap-4 mt-8">
                  {(Object.entries(t.pricing.steps.employment.options) as [Employment, string][]).map(
                    ([key, label]) => {
                      const Icon = employmentIcons[key]
                      return (
                        <OptionButton
                          key={key}
                          selected={state.employment === key}
                          onClick={() => selectEmployment(key)}
                          aria-label={label}
                        >
                          <Icon className="w-6 h-6 shrink-0" />
                          <span className="text-lg font-medium">{label}</span>
                        </OptionButton>
                      )
                    },
                  )}
                </div>
              </StepCard>
            )}

            {/* ---- Step: Assets ---- */}
            {currentStep === 'assets' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.assets.question}</StepQuestion>
                <p className="text-navy-500 text-sm mt-2 mb-8">Mehrfachauswahl möglich</p>
                <div className="grid gap-4">
                  {(Object.entries(t.pricing.steps.assets.options) as [Asset, string][]).map(
                    ([key, label]) => {
                      const Icon = assetIcons[key]
                      return (
                        <OptionButton
                          key={key}
                          selected={state.assets.includes(key)}
                          onClick={() => toggleAsset(key)}
                          aria-label={label}
                          aria-pressed={state.assets.includes(key)}
                        >
                          <Icon className="w-6 h-6 shrink-0" />
                          <span className="text-lg font-medium">{label}</span>
                        </OptionButton>
                      )
                    },
                  )}
                </div>
                {/* Continue button for multi-select */}
                <button
                  onClick={goNext}
                  disabled={!canAdvance('assets', state)}
                  className="btn-gold w-full mt-8 group disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t.common.next}
                >
                  {t.common.next}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </StepCard>
            )}

            {/* ---- Step: Ausland ---- */}
            {currentStep === 'ausland' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.ausland.question}</StepQuestion>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <OptionButton
                    selected={state.ausland === true}
                    onClick={() => selectAusland(true)}
                    aria-label={t.pricing.steps.ausland.options.ja}
                  >
                    <Globe className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.ausland.options.ja}</span>
                  </OptionButton>
                  <OptionButton
                    selected={state.ausland === false}
                    onClick={() => selectAusland(false)}
                    aria-label={t.pricing.steps.ausland.options.nein}
                  >
                    <Shield className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.ausland.options.nein}</span>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Step: Unterlagen ---- */}
            {currentStep === 'unterlagen' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.unterlagen.question}</StepQuestion>
                <div className="grid gap-4 mt-8">
                  {(Object.entries(t.pricing.steps.unterlagen.options) as [Docs, string][]).map(
                    ([key, label]) => (
                      <OptionButton
                        key={key}
                        selected={state.unterlagen === key}
                        onClick={() => selectUnterlagen(key)}
                        aria-label={label}
                      >
                        <FolderOpen className="w-6 h-6 shrink-0" />
                        <span className="text-lg font-medium">{label}</span>
                      </OptionButton>
                    ),
                  )}
                </div>
              </StepCard>
            )}

            {/* ---- Step: Buchhaltung ---- */}
            {currentStep === 'buchhaltung' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.buchhaltung.question}</StepQuestion>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <OptionButton
                    selected={state.buchhaltung === true}
                    onClick={() => selectBuchhaltung(true)}
                    aria-label={t.pricing.steps.buchhaltung.options.ja}
                  >
                    <BookOpen className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.buchhaltung.options.ja}</span>
                  </OptionButton>
                  <OptionButton
                    selected={state.buchhaltung === false}
                    onClick={() => selectBuchhaltung(false)}
                    aria-label={t.pricing.steps.buchhaltung.options.nein}
                  >
                    <BookOpen className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.buchhaltung.options.nein}</span>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Result Screen ---- */}
            {currentStep === 'result' && (
              <div className="wizard-fade-up">
                <div className="card p-8 sm:p-10 lg:p-12 text-center">
                  {/* Heading */}
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
                    {t.pricing.result.heading}
                  </h2>

                  {/* Tier badge */}
                  <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-50 border border-gold-200">
                    <Check className="w-5 h-5 text-gold-600" />
                    <span className="font-heading font-bold text-gold-700 text-lg">
                      {t.pricing.tiers[tier].name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    <span className="text-4xl sm:text-5xl font-bold text-navy-900">
                      {t.pricing.tiers[tier].price}
                    </span>
                    <p className="text-navy-500 text-sm mt-1">
                      {t.pricing.tiers[tier].priceLabel}
                    </p>
                  </div>

                  {/* Fixed price badge for Basis & Erweitert */}
                  {(tier === 'basis' || tier === 'erweitert') && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-trust-50 border border-trust-200 text-trust-700 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      {t.pricing.result.fixedBadge}
                    </div>
                  )}

                  {/* Komplex note */}
                  {tier === 'komplex' && (
                    <p className="mt-4 text-navy-600 text-sm max-w-md mx-auto bg-navy-50 rounded-lg p-4 border border-navy-100">
                      {t.pricing.result.komplexNote}
                    </p>
                  )}

                  {/* Description */}
                  <p className="mt-6 text-navy-600 text-base max-w-md mx-auto">
                    {t.pricing.tiers[tier].description}
                  </p>

                  {/* Features list */}
                  <div className="mt-8 text-left max-w-sm mx-auto">
                    <p className="text-sm font-semibold text-navy-900 mb-4">
                      {t.pricing.result.included}
                    </p>
                    <ul className="space-y-3">
                      {t.pricing.tiers[tier].features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-trust-500 shrink-0 mt-0.5" />
                          <span className="text-navy-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Messy docs note */}
                  {showMessyDocsNote && (
                    <p className="mt-6 text-xs text-navy-500 italic max-w-sm mx-auto">
                      {t.pricing.result.messyDocsNote}
                    </p>
                  )}

                  {/* CTA buttons */}
                  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/auth/register"
                      className="btn-gold group text-base !px-8 !py-4"
                    >
                      {t.pricing.result.ctaStart}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn-secondary group text-base !px-8 !py-4"
                    >
                      {t.pricing.result.ctaConsult}
                    </Link>
                  </div>

                  {/* Restart */}
                  <button
                    onClick={restart}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-navy-400 hover:text-navy-600 transition-colors"
                    aria-label={t.pricing.result.restart}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t.pricing.result.restart}
                  </button>
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
      className={`flex items-center gap-4 w-full px-6 py-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 ${
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
