'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { searchCities, type TaxCity } from '@/lib/estv-tax'

export function useMunicipalitySearch() {
  const [municipalities, setMunicipalities] = useState<TaxCity[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((term: string, year?: number) => {
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (term.length < 2) {
      setMunicipalities([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(term, year)
      setMunicipalities(results)
      setSearchLoading(false)
    }, 300)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return { municipalities, showDropdown, setShowDropdown, searchLoading, dropdownRef, handleSearch }
}
