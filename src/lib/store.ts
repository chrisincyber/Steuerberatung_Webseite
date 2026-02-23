import { create } from 'zustand'

interface AppState {
  cookieConsent: boolean | null
  setCookieConsent: (consent: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  cookieConsent: null,
  setCookieConsent: (consent) => {
    set({ cookieConsent: consent })
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', String(consent))
    }
  },
}))
