import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemePalette = 'default'

export interface ThemeOption {
  id: ThemePalette
  name: string
  accent: string
  subAccent: string
  tertiary: string
  bgPreview: string
  description: string
  gradientText: string
  glows: {
    c1: string
    c2: string
    c3: string
    c4: string
  }
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    name: 'Cruzeon Industrial',
    accent: '#F04E1F',
    subAccent: '#6B3FE6',
    tertiary: '#C5B9CE',
    bgPreview: '#E3E0E6',
    description: 'Reference neo-grotesk industrial aesthetic: vivid red-orange, electric violet & soft lavender-gray',
    gradientText: 'linear-gradient(135deg, #F04E1F 0%, #6B3FE6 100%)',
    glows: {
      c1: 'rgba(240, 78, 31, 0.18)',
      c2: 'rgba(107, 63, 230, 0.14)',
      c3: 'rgba(197, 185, 206, 0.25)',
      c4: 'rgba(240, 78, 31, 0.10)',
    }
  }
]

interface ThemeContextType {
  palette: ThemePalette
  setPalette: (palette: ThemePalette) => void
  isDark: boolean
  toggleDark: () => void
  activeTheme: ThemeOption
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to Cruzeon Industrial in Light mode as in reference
  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    localStorage.removeItem('air_theme_aurora_v5')
    localStorage.removeItem('air_theme_palette')
    localStorage.removeItem('air_theme_mode')
    return 'default'
  })

  const [isDark, setIsDark] = useState<boolean>(false)

  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]

  useEffect(() => {
    const root = document.documentElement

    // Remove all previous theme classes
    THEME_OPTIONS.forEach(opt => {
      if (opt.id !== 'default') {
        root.classList.remove(opt.id)
      }
    })

    if (palette !== 'default') {
      root.classList.add(palette)
    }

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Set custom CSS variables for ambient background blurs
    root.style.setProperty('--glow-1', activeTheme.glows.c1)
    root.style.setProperty('--glow-2', activeTheme.glows.c2)
    root.style.setProperty('--glow-3', activeTheme.glows.c3)
    root.style.setProperty('--glow-4', activeTheme.glows.c4)
    root.style.setProperty('--accent-gradient', activeTheme.gradientText)
    root.style.setProperty('--theme-accent', activeTheme.accent)
    root.style.setProperty('--theme-subaccent', activeTheme.subAccent)

    localStorage.setItem('air_theme_palette', palette)
    localStorage.setItem('air_theme_mode', isDark ? 'dark' : 'light')
  }, [palette, isDark, activeTheme])

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette)
  }

  const toggleDark = () => {
    setIsDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ palette, setPalette, isDark, toggleDark, activeTheme }}>
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
