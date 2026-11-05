import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemePalette = 'deep-violet' | 'soft-pastels'

export interface ThemeOption {
  id: ThemePalette
  name: string
  label: string
  accent: string
  subAccent: string
  tertiary: string
  description: string
  particleColors: string[]
  lineColor: string
  mouseLineColor: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'deep-violet',
    name: 'Deep Violet',
    label: 'Deep Violet',
    accent: '#7B2CBF',
    subAccent: '#10002B',
    tertiary: '#E0AAFF',
    description: 'Rich royal purple & midnight violet palette with high contrast against pure white',
    particleColors: [
      'rgba(123, 44, 191, ',
      'rgba(90, 24, 154, ',
      'rgba(157, 78, 221, ',
      'rgba(16, 0, 43, ',
      'rgba(199, 125, 255, ',
    ],
    lineColor: 'rgba(123, 44, 191, ',
    mouseLineColor: 'rgba(157, 78, 221, ',
  },
  {
    id: 'soft-pastels',
    name: 'Soft Pastels',
    label: 'Soft Pastels',
    accent: '#C042BA',
    subAccent: '#1A0B2E',
    tertiary: '#FFD6FF',
    description: 'Delicate orchid, lavender and periwinkle tones paired with crisp velvet ink on pure white',
    particleColors: [
      'rgba(192, 66, 186, ',
      'rgba(200, 182, 255, ',
      'rgba(184, 192, 255, ',
      'rgba(255, 214, 255, ',
      'rgba(187, 208, 255, ',
    ],
    lineColor: 'rgba(200, 182, 255, ',
    mouseLineColor: 'rgba(192, 66, 186, ',
  },
]

interface ThemeContextType {
  palette: ThemePalette
  setPalette: (palette: ThemePalette) => void
  activeTheme: ThemeOption
  isDark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'air_theme_palette_v3'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    if (typeof window === 'undefined') return 'deep-violet'
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePalette | null
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved
    }
    return 'deep-violet'
  })

  const [isDark, setIsDark] = useState<boolean>(false)

  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]

  useEffect(() => {
    const root = document.documentElement

    // Remove legacy and existing theme classes
    root.classList.remove(
      'theme-deep-violet',
      'theme-soft-pastels',
      'theme-green',
      'theme-blue',
      'theme-classic',
      'default'
    )

    // Apply active theme class and data-theme attribute
    root.classList.add(`theme-${palette}`)
    root.setAttribute('data-theme', palette)

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, palette)
    } catch {
      // Ignore private browsing storage errors
    }
  }, [palette])

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette)
  }

  const toggleDark = () => {
    setIsDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider
      value={{
        palette,
        setPalette,
        activeTheme,
        isDark,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
