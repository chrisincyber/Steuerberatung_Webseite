'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { Menu, X, Globe, ChevronDown, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import DeadlineBanner from '@/components/DeadlineBanner'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Header() {
  const { t, locale, toggleLocale } = useI18n()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const fetchUserAndRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      setUserRole(profile?.role ?? null)
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchUserAndRole(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserAndRole(session.user.id)
      else setUserRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
  }

  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/pricing', label: t.nav.pricing },
  ]

  const resourceLinks = [
    { href: '/deadlines', label: t.nav.deadlines },
    { href: '/faq', label: t.nav.faq },
    { href: '/kanton', label: t.nav.cantons },
    { href: '/steuertipps', label: t.nav.taxTips },
    { href: '/about', label: t.nav.about },
  ]

  const toolLinks = [
    { href: '/3a-rechner', label: t.nav.pillar3a },
    { href: '/abzugsrechner', label: t.nav.deductionFinder },
    { href: '/quellensteuer', label: t.nav.withholding },
    { href: '/checkliste', label: t.nav.taxChecklist },
    { href: '/steuerkarte', label: t.nav.taxMap },
    { href: '/steuervergleich', label: t.nav.taxCompare },
    { href: '/tax-calculator', label: t.nav.taxCalculator },
    { href: '/pk-einkauf', label: t.nav.pkEinkauf },
  ]

  // Pages with a dark hero background where we need white text/logo
  const darkHeroPages = ['/', '/about', '/pricing', '/faq', '/tax-calculator', '/deadlines', '/impressum', '/privacy', '/agb', '/kanton', '/abzugsrechner', '/3a-rechner', '/quellensteuer', '/steuervergleich', '/steuerkarte', '/checkliste', '/steuertipps', '/pk-einkauf']
  const hasDarkHero = darkHeroPages.some(p => p === '/' ? pathname === '/' : pathname.startsWith(p))
  const useDarkStyle = scrolled || !hasDarkHero

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isResourceActive = resourceLinks.some((link) => isActive(link.href)) || pathname.startsWith('/kanton')
  const isToolActive = toolLinks.some((link) => isActive(link.href))

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-navy-100'
          : 'bg-transparent'
      }`}
    >
      <DeadlineBanner />
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={useDarkStyle ? '/logo-dark.svg' : '/logo-white.svg'}
              alt="Petertil Tax"
              width={150}
              height={30}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useDarkStyle
                    ? isActive(link.href)
                      ? 'text-navy-900 bg-navy-100'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                    : isActive(link.href)
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div className="relative">
              <button
                onClick={() => { setToolsOpen(!toolsOpen); setResourcesOpen(false) }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useDarkStyle
                    ? isToolActive
                      ? 'text-navy-900 bg-navy-100'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                    : isToolActive
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.nav.tools}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-navy-100 py-2 z-50">
                    {toolLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                          isActive(link.href)
                            ? 'text-navy-900 bg-navy-50 font-medium'
                            : 'text-navy-700 hover:bg-navy-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Resources dropdown */}
            <div className="relative">
              <button
                onClick={() => { setResourcesOpen(!resourcesOpen); setToolsOpen(false) }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useDarkStyle
                    ? isResourceActive
                      ? 'text-navy-900 bg-navy-100'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                    : isResourceActive
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.nav.resources}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setResourcesOpen(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-navy-100 py-2 z-50">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setResourcesOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                          isActive(link.href)
                            ? 'text-navy-900 bg-navy-50 font-medium'
                            : 'text-navy-700 hover:bg-navy-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                useDarkStyle
                  ? 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{locale === 'de' ? 'EN' : 'DE'}</span>
            </button>

            {/* Auth buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    useDarkStyle
                      ? 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-navy-100 py-2 z-50">
                      {userRole === 'admin' ? (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-navy-50 font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/dashboard?view=client"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-navy-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {t.nav.clientDashboard}
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-navy-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {t.nav.dashboard}
                        </Link>
                      )}
                      <Link
                        href="/dashboard/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-navy-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t.nav.account}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.nav.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    useDarkStyle
                      ? 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.login}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                useDarkStyle
                  ? 'text-navy-600 hover:bg-navy-50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-navy-100 pb-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 pt-4">
              {/* Configurator (Pricing) */}
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/pricing')
                    ? 'text-navy-900 bg-navy-100'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                }`}
              >
                {t.nav.pricing}
              </Link>

              {/* Steuertools dropdown */}
              <button
                onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isToolActive
                    ? 'text-navy-900 bg-navy-100'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                }`}
              >
                {t.nav.tools}
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileToolsOpen && (
                <div className="flex flex-col gap-1 pl-4">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive(link.href)
                          ? 'text-navy-900 bg-navy-100 font-medium'
                          : 'text-navy-500 hover:text-navy-900 hover:bg-navy-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Login */}
              {!user && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
