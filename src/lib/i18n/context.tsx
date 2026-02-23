'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { translations, type Locale } from './translations'

type Translations = (typeof translations)[Locale]

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && (saved === 'de' || saved === 'en')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'de' ? 'en' : 'de')
  }, [locale, setLocale])

  const t = translations[locale]

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
