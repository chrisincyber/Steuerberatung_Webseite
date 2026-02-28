'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
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
  Mail,
  Phone,
  User,
  Users,
  Armchair,
  Loader2,
  Home,
  Minus,
  Plus,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Personen = 'einzelperson' | 'ehepaar'
type Employment = 'unselbstaendig' | 'pensioniert' | 'selbstaendig' | 'gmbh_ag'
type Asset = 'wertschriften' | 'liegenschaft' | 'krypto' | 'keine'
type Docs = 'ja' | 'teilweise' | 'nein'
type Tier = 'basis' | 'erweitert' | 'komplex'
type StepId = 'personen' | 'employment' | 'buchhaltungBedarf' | 'assets' | 'ausland' | 'unterlagen' | 'kontaktformular' | 'result'

interface LiegenschaftDetail {
  selbstbewohnt: number
  vermietet: number
}

interface KontaktForm {
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface WizardState {
  personen: Personen | null
  employment: Employment[]
  buchhaltungBedarf: boolean | null
  assets: Asset[]
  wertschriftenOver10: boolean | null
  liegenschaftDetail: LiegenschaftDetail
  ausland: boolean | null
  unterlagen: Docs | null
  kontaktForm: KontaktForm
}

// Icons for employment options
const employmentIcons: Record<Employment, typeof Briefcase> = {
  unselbstaendig: Briefcase,
  pensioniert: Armchair,
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
  personen: null,
  employment: [],
  buchhaltungBedarf: null,
  assets: [],
  wertschriftenOver10: null,
  liegenschaftDetail: { selbstbewohnt: 0, vermietet: 0 },
  ausland: null,
  unterlagen: null,
  kontaktForm: { firstName: '', lastName: '', phone: '', email: '' },
}

// ---------------------------------------------------------------------------
// Rule Engine – derives tier from wizard state
// ---------------------------------------------------------------------------

// Returns the "highest" selected Employment for tier logic
// Priority: gmbh_ag > selbstaendig > unselbstaendig
function getEffectiveEmployment(selected: Employment[]): Employment | null {
  if (selected.includes('gmbh_ag')) return 'gmbh_ag'
  if (selected.includes('selbstaendig')) return 'selbstaendig'
  if (selected.includes('unselbstaendig') || selected.includes('pensioniert')) return 'unselbstaendig'
  return null
}

function calculateTier(state: WizardState): Tier {
  const emp = getEffectiveEmployment(state.employment)

  // GmbH/AG (without bookkeeping) → always Komplex
  if (emp === 'gmbh_ag') {
    return 'komplex'
  }

  // Selbständig (without bookkeeping) → min Erweitert, Komplex if Ausland
  if (emp === 'selbstaendig') {
    if (state.ausland === true) {
      return 'komplex'
    }
    return 'erweitert'
  }

  // Unselbständig: Foreign income/assets → Komplex
  if (state.ausland === true) {
    return 'komplex'
  }

  // Total Liegenschaften > 2 → Komplex
  const totalLiegenschaften = state.liegenschaftDetail.selbstbewohnt + state.liegenschaftDetail.vermietet
  if (state.assets.includes('liegenschaft') && totalLiegenschaften > 2) {
    return 'komplex'
  }

  const hasAssets = state.assets.length > 0 && !state.assets.includes('keine')

  // Unselbständig + assets → Erweitert (but Wertschriften ≤10 positions alone stays Basis)
  if (emp === 'unselbstaendig' && hasAssets) {
    const onlyWertschriften = state.assets.length === 1 && state.assets[0] === 'wertschriften'
    if (onlyWertschriften && state.wertschriftenOver10 === false) {
      return 'basis'
    }
    return 'erweitert'
  }

  // Unselbständig + no assets + no Ausland → Basis
  return 'basis'
}

// ---------------------------------------------------------------------------
// Step Sequence – dynamically compute applicable steps
// ---------------------------------------------------------------------------

function getSteps(state: WizardState): StepId[] {
  const steps: StepId[] = ['personen', 'employment']
  const emp = getEffectiveEmployment(state.employment)

  if (emp === 'selbstaendig' || emp === 'gmbh_ag') {
    steps.push('buchhaltungBedarf')

    // If they need bookkeeping → contact form path
    if (state.buchhaltungBedarf === true) {
      steps.push('kontaktformular')
      return steps
    }
  }

  // Normal questionnaire path (include assets when emp unknown for stable progress count)
  if (emp === null || emp === 'unselbstaendig' || (emp === 'selbstaendig' && state.buchhaltungBedarf === false)) {
    steps.push('assets')
  }

  // Remaining steps — always include for stable progress counter
  if (state.buchhaltungBedarf !== true) {
    steps.push('ausland', 'unterlagen', 'result')
  }

  return steps
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canAdvance(step: StepId, state: WizardState): boolean {
  switch (step) {
    case 'personen':
      return state.personen !== null
    case 'employment':
      return state.employment.length > 0
    case 'buchhaltungBedarf':
      return state.buchhaltungBedarf !== null
    case 'assets': {
      if (state.assets.length === 0) return false
      // If wertschriften selected, require over10 answer
      if (state.assets.includes('wertschriften') && state.wertschriftenOver10 === null) return false
      // If liegenschaft selected, require at least 1 property total
      if (state.assets.includes('liegenschaft')) {
        const total = state.liegenschaftDetail.selbstbewohnt + state.liegenschaftDetail.vermietet
        if (total < 1) return false
      }
      return true
    }
    case 'ausland':
      return state.ausland !== null
    case 'unterlagen':
      return state.unterlagen !== null
    case 'kontaktformular': {
      const f = state.kontaktForm
      return f.firstName.trim() !== '' && f.lastName.trim() !== '' && f.phone.replace(/\D/g, '').length >= 10 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
    }
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
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const pricingRouter = useRouter()
  const steps = useMemo(() => getSteps(state), [state])
  const currentStep = steps[stepIndex]
  const tier = useMemo(() => calculateTier(state), [state])

  // Map tier name → numeric + price for portal callback
  const tierNumeric = tier === 'basis' ? 1 : tier === 'erweitert' ? 2 : 3
  const tierPrice = tier === 'basis' ? 149 : tier === 'erweitert' ? 199 : null

  const handleOrderNow = useCallback(async () => {
    const params = new URLSearchParams({
      tier: String(tierNumeric),
      year: '2025',
      ...(tierPrice ? { price: String(tierPrice) } : {}),
    })

    const supabase = createClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        pricingRouter.push(`/dashboard?${params.toString()}`)
        return
      }
    }

    const redirectPath = `/dashboard?${params.toString()}`
    pricingRouter.push(`/auth/register?redirect=${encodeURIComponent(redirectPath)}`)
  }, [tierNumeric, tierPrice, pricingRouter])

  // Count only questionnaire steps (exclude result and kontaktformular for progress)
  const isQuestionnaireStep = currentStep !== 'result' && currentStep !== 'kontaktformular'
  const questionnaireSteps = steps.filter((s) => s !== 'result' && s !== 'kontaktformular')
  const questionnaireTotal = questionnaireSteps.length
  const questionnaireIndex = questionnaireSteps.indexOf(currentStep as typeof questionnaireSteps[number])

  // Analytics: track step views
  useEffect(() => {
    if (currentStep === 'result') {
      window.dataLayer?.push({ event: 'pricing_completed', tier: tier })
    } else if (currentStep === 'kontaktformular') {
      window.dataLayer?.push({ event: 'pricing_kontaktformular' })
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
    setFormSuccess(false)
    setFormSubmitting(false)
    setFormError(false)
  }, [])

  // State updaters
  const selectPersonen = useCallback(
    (val: Personen) => {
      setState({
        personen: val,
        employment: [],
        buchhaltungBedarf: null,
        assets: [],
        wertschriftenOver10: null,
        liegenschaftDetail: { selbstbewohnt: 0, vermietet: 0 },
        ausland: null,
        unterlagen: null,
        kontaktForm: { firstName: '', lastName: '', phone: '', email: '' },
      })
      setFormSuccess(false)
      // Auto-advance after selection
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(1) // always index 1 after personen
      }, 150)
    },
    [],
  )

  const toggleEmployment = useCallback((emp: Employment) => {
    setState((prev) => {
      const has = prev.employment.includes(emp)
      const newEmployment = has
        ? prev.employment.filter((e) => e !== emp)
        : [...prev.employment, emp]
      return {
        ...prev,
        employment: newEmployment,
        // Reset downstream when selection changes
        buchhaltungBedarf: null,
        assets: [],
        wertschriftenOver10: null,
        liegenschaftDetail: { selbstbewohnt: 0, vermietet: 0 },
        ausland: null,
        unterlagen: null,
        kontaktForm: { firstName: '', lastName: '', phone: '', email: '' },
      }
    })
    setFormSuccess(false)
  }, [])

  const selectBuchhaltungBedarf = useCallback(
    (val: boolean) => {
      setState((prev) => ({
        ...prev,
        buchhaltungBedarf: val,
        // Reset downstream state when changing this
        assets: [],
        wertschriftenOver10: null,
        liegenschaftDetail: { selbstbewohnt: 0, vermietet: 0 },
        ausland: null,
        unterlagen: null,
        kontaktForm: { firstName: '', lastName: '', phone: '', email: '' },
      }))
      setFormSuccess(false)
      setTimeout(() => {
        setDirection('forward')
        setAnimKey((k) => k + 1)
        setStepIndex(3) // always index 3 after buchhaltungBedarf (personen=0, employment=1, buchhaltung=2)
      }, 150)
    },
    [],
  )

  const toggleAsset = useCallback((asset: Asset) => {
    setState((prev) => {
      if (asset === 'keine') {
        return { ...prev, assets: ['keine'], wertschriftenOver10: null, liegenschaftDetail: { selbstbewohnt: 0, vermietet: 0 } }
      }
      const without = prev.assets.filter((a) => a !== 'keine' && a !== asset)
      const has = prev.assets.includes(asset)
      const newAssets = has ? without : [...without, asset]
      return {
        ...prev,
        assets: newAssets,
        wertschriftenOver10: asset === 'wertschriften' && has ? null : prev.wertschriftenOver10,
        liegenschaftDetail: asset === 'liegenschaft' && has ? { selbstbewohnt: 0, vermietet: 0 } : prev.liegenschaftDetail,
      }
    })
  }, [])

  const updateLiegenschaft = useCallback((field: keyof LiegenschaftDetail, value: number) => {
    setState((prev) => ({
      ...prev,
      liegenschaftDetail: { ...prev.liegenschaftDetail, [field]: value },
    }))
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

  const updateKontaktForm = useCallback((field: keyof KontaktForm, value: string) => {
    setState((prev) => ({
      ...prev,
      kontaktForm: { ...prev.kontaktForm, [field]: value },
    }))
  }, [])

  const submitKontaktForm = useCallback(async () => {
    if (formSubmitting) return
    setFormSubmitting(true)
    setFormError(false)
    try {
      const res = await fetch('/_api/bookkeeping-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: state.kontaktForm.firstName,
          lastName: state.kontaktForm.lastName,
          phone: state.kontaktForm.phone,
          email: state.kontaktForm.email,
          employment: getEffectiveEmployment(state.employment),
        }),
      })
      if (res.ok) {
        setFormSuccess(true)
      } else {
        setFormError(true)
      }
    } catch {
      setFormError(true)
    } finally {
      setFormSubmitting(false)
    }
  }, [formSubmitting, state.kontaktForm, state.employment])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (stepIndex > 0 && currentStep !== 'result' && currentStep !== 'kontaktformular') {
          goBack()
        }
      }
      if (e.key === 'Enter' && currentStep !== 'result' && currentStep !== 'personen' && currentStep !== 'kontaktformular') {
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
      <section className="gradient-hero pt-24 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
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
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-white/10 border border-white/20">
            <Clock className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/80">{t.pricing.urgency}</span>
          </div>
        </div>
      </section>

      {/* Wizard container */}
      <section ref={containerRef} className="section-padding -mt-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar (shown only for questionnaire steps) */}
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
            {/* ---- Step: Personen ---- */}
            {currentStep === 'personen' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.personen.question}</StepQuestion>
                <div className="grid gap-4 mt-8">
                  <OptionButton
                    selected={state.personen === 'einzelperson'}
                    onClick={() => selectPersonen('einzelperson')}
                    aria-label={t.pricing.steps.personen.options.einzelperson}
                  >
                    <User className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="text-lg font-medium">{t.pricing.steps.personen.options.einzelperson}</span>
                      <p className={`text-sm mt-0.5 ${state.personen === 'einzelperson' ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.personen.options.einzelpersonHint}
                      </p>
                    </div>
                  </OptionButton>
                  <OptionButton
                    selected={state.personen === 'ehepaar'}
                    onClick={() => selectPersonen('ehepaar')}
                    aria-label={t.pricing.steps.personen.options.ehepaar}
                  >
                    <Users className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="text-lg font-medium">{t.pricing.steps.personen.options.ehepaar}</span>
                      <p className={`text-sm mt-0.5 ${state.personen === 'ehepaar' ? 'text-white/70' : 'text-navy-500'}`}>
                        {t.pricing.steps.personen.options.ehepaarHint}
                      </p>
                    </div>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Step: Employment (Multi-Select) ---- */}
            {currentStep === 'employment' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.employment.question}</StepQuestion>
                <p className="text-navy-500 text-sm mt-2 mb-8">{t.pricing.steps.employment.multiHint}</p>
                <div className="grid gap-4">
                  {(Object.entries(t.pricing.steps.employment.options) as [Employment, string][]).map(
                    ([key, label]) => {
                      const Icon = employmentIcons[key]
                      return (
                        <OptionButton
                          key={key}
                          selected={state.employment.includes(key)}
                          onClick={() => toggleEmployment(key)}
                          aria-label={label}
                          aria-pressed={state.employment.includes(key)}
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
                  disabled={!canAdvance('employment', state)}
                  className="btn-white w-full mt-8 group disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t.common.next}
                >
                  {t.common.next}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </StepCard>
            )}

            {/* ---- Step: Buchhaltung Bedarf ---- */}
            {currentStep === 'buchhaltungBedarf' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.buchhaltungBedarf.question}</StepQuestion>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <OptionButton
                    selected={state.buchhaltungBedarf === true}
                    onClick={() => selectBuchhaltungBedarf(true)}
                    aria-label={t.pricing.steps.buchhaltungBedarf.options.ja}
                  >
                    <BookOpen className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.buchhaltungBedarf.options.ja}</span>
                  </OptionButton>
                  <OptionButton
                    selected={state.buchhaltungBedarf === false}
                    onClick={() => selectBuchhaltungBedarf(false)}
                    aria-label={t.pricing.steps.buchhaltungBedarf.options.nein}
                  >
                    <BookOpen className="w-6 h-6 shrink-0" />
                    <span className="text-lg font-medium">{t.pricing.steps.buchhaltungBedarf.options.nein}</span>
                  </OptionButton>
                </div>
              </StepCard>
            )}

            {/* ---- Step: Assets ---- */}
            {currentStep === 'assets' && (
              <StepCard>
                <StepQuestion>{t.pricing.steps.assets.question}</StepQuestion>
                <p className="text-navy-500 text-sm mt-2 mb-8">{t.pricing.steps.employment.multiHint}</p>
                <div className="grid gap-4">
                  {(Object.entries(t.pricing.steps.assets.options) as [Asset, string][]).map(
                    ([key, label]) => {
                      const Icon = assetIcons[key]
                      return (
                        <div key={key}>
                          <OptionButton
                            selected={state.assets.includes(key)}
                            onClick={() => toggleAsset(key)}
                            aria-label={label}
                            aria-pressed={state.assets.includes(key)}
                          >
                            <Icon className="w-6 h-6 shrink-0" />
                            <span className="text-lg font-medium">{label}</span>
                          </OptionButton>

                          {/* Wertschriften detail */}
                          {key === 'wertschriften' && state.assets.includes('wertschriften') && (
                            <div className="mt-3 ml-2 p-4 rounded-xl bg-navy-50 border border-navy-200">
                              <p className="text-sm font-medium text-navy-700 mb-3">
                                {t.pricing.steps.assets.wertschriften.over10}
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setState((prev) => ({ ...prev, wertschriftenOver10: true }))}
                                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                    state.wertschriftenOver10 === true
                                      ? 'border-navy-800 bg-navy-800 text-white'
                                      : 'border-navy-200 text-navy-700 hover:border-navy-400'
                                  }`}
                                >
                                  {t.pricing.steps.ausland.options.ja}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setState((prev) => ({ ...prev, wertschriftenOver10: false }))}
                                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                    state.wertschriftenOver10 === false
                                      ? 'border-navy-800 bg-navy-800 text-white'
                                      : 'border-navy-200 text-navy-700 hover:border-navy-400'
                                  }`}
                                >
                                  {t.pricing.steps.ausland.options.nein}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Liegenschaft detail rows */}
                          {key === 'liegenschaft' && state.assets.includes('liegenschaft') && (
                            <div className="mt-3 ml-2 space-y-3 p-4 rounded-xl bg-navy-50 border border-navy-200">
                              {/* Row 1: Selbstbewohnt */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Home className="w-4 h-4 text-navy-500 shrink-0" />
                                  <span className="text-sm font-medium text-navy-700 truncate">
                                    {t.pricing.steps.assets.liegenschaft.selbstbewohnt}
                                  </span>
                                </div>
                                <NumberStepper
                                  value={state.liegenschaftDetail.selbstbewohnt}
                                  min={0}
                                  max={5}
                                  onChange={(v) => updateLiegenschaft('selbstbewohnt', v)}
                                />
                              </div>
                              {/* Row 2: Vermietete Objekte */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Building2 className="w-4 h-4 text-navy-500 shrink-0" />
                                  <span className="text-sm font-medium text-navy-700 truncate">
                                    {t.pricing.steps.assets.liegenschaft.vermietet}
                                  </span>
                                </div>
                                <NumberStepper
                                  value={state.liegenschaftDetail.vermietet}
                                  min={0}
                                  max={3}
                                  onChange={(v) => updateLiegenschaft('vermietet', v)}
                                  showPlus={true}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    },
                  )}
                </div>
                {/* Continue button for multi-select */}
                <button
                  onClick={goNext}
                  disabled={!canAdvance('assets', state)}
                  className="btn-white w-full mt-8 group disabled:opacity-40 disabled:cursor-not-allowed"
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

            {/* ---- Step: Kontaktformular ---- */}
            {currentStep === 'kontaktformular' && (
              <div className="wizard-fade-up">
                <div className="card p-8 sm:p-10 lg:p-12">
                  {formSuccess ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-trust-50 border border-trust-200 mb-6">
                        <Check className="w-8 h-8 text-trust-600" />
                      </div>
                      <p className="text-lg font-medium text-navy-900">
                        {t.pricing.steps.kontaktformular.success}
                      </p>
                      <button
                        onClick={restart}
                        className="mt-8 inline-flex items-center gap-2 text-sm text-navy-400 hover:text-navy-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {t.pricing.result.restart}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Back button */}
                      <button
                        onClick={goBack}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors mb-6"
                        aria-label={t.common.back}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t.common.back}
                      </button>

                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900 text-center">
                        {t.pricing.steps.kontaktformular.heading}
                      </h2>
                      <p className="text-navy-500 text-sm mt-2 mb-8 text-center max-w-md mx-auto">
                        {t.pricing.steps.kontaktformular.description}
                      </p>

                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              {t.pricing.steps.kontaktformular.firstName}
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                              <input
                                type="text"
                                value={state.kontaktForm.firstName}
                                onChange={(e) => updateKontaktForm('firstName', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              {t.pricing.steps.kontaktformular.lastName}
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                              <input
                                type="text"
                                value={state.kontaktForm.lastName}
                                onChange={(e) => updateKontaktForm('lastName', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-1">
                            {t.pricing.steps.kontaktformular.phone}
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                            <input
                              type="tel"
                              value={state.kontaktForm.phone}
                              onChange={(e) => updateKontaktForm('phone', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-1">
                            {t.pricing.steps.kontaktformular.email}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                            <input
                              type="email"
                              value={state.kontaktForm.email}
                              onChange={(e) => updateKontaktForm('email', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <button
                          onClick={submitKontaktForm}
                          disabled={!canAdvance('kontaktformular', state) || formSubmitting}
                          className="btn-white w-full mt-4 group disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {formSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              {t.pricing.steps.kontaktformular.submit}
                              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                        {formError && (
                          <p className="text-red-600 text-sm text-center mt-3">
                            {t.pricing.steps.kontaktformular.error}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ---- Result Screen ---- */}
            {currentStep === 'result' && (
              <div className="wizard-fade-up">
                <div className="card p-8 sm:p-10 lg:p-12 text-center">
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
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
                    {t.pricing.result.heading}
                  </h2>

                  {/* Tier badge */}
                  <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-navy-50 border border-navy-200">
                    <Check className="w-5 h-5 text-navy-700" />
                    <span className="font-heading font-bold text-navy-900 text-lg">
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
                    <button
                      onClick={handleOrderNow}
                      className="btn-white group text-base !px-8 !py-4"
                    >
                      {t.pricing.result.ctaStart}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                      href="mailto:info@petertiltax.ch"
                      className="btn-secondary group text-base !px-8 !py-4"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {t.pricing.result.ctaConsult}
                    </a>
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
  showPlus,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  showPlus?: boolean
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-navy-200 text-navy-600 hover:bg-navy-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-navy-900">
        {value === max && showPlus ? `${value}+` : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-navy-200 text-navy-600 hover:bg-navy-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
