import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemePalette = 'green' | 'blue' | 'classic'

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
    id: 'green',
    name: 'Fresh Greens',
    label: 'Green',
    accent: '#2D6A4F',
    subAccent: '#081C15',
    tertiary: '#D8F3DC',
    description: 'Vibrant organic greens: obsidian forest ink, rich pine, and luminous mint highlights',
    particleColors: [
      'rgba(45, 106, 79, ',
      'rgba(82, 183, 136, ',
      'rgba(27, 67, 50, ',
      'rgba(8, 28, 21, ',
      'rgba(216, 243, 220, ',
    ],
    lineColor: 'rgba(45, 106, 79, ',
    mouseLineColor: 'rgba(82, 183, 136, ',
  },
  {
    id: 'blue',
    name: 'Deep Sea Blue',
    label: 'Blue',
    accent: '#0353A4',
    subAccent: '#001233',
    tertiary: '#DCE6F2',
    description: 'Deep maritime oceanic: abyssal navy, royal sapphire, and cool steel slate',
    particleColors: [
      'rgba(3, 83, 164, ',
      'rgba(4, 102, 200, ',
      'rgba(2, 62, 125, ',
      'rgba(0, 18, 51, ',
      'rgba(151, 157, 172, ',
    ],
    lineColor: 'rgba(2, 62, 125, ',
    mouseLineColor: 'rgba(4, 102, 200, ',
  },
  {
    id: 'classic',
    name: 'Classic Terracotta',
    label: 'Classic',
    accent: '#D9531E',
    subAccent: '#0A3235',
    tertiary: '#F2EFEA',
    description: 'Concept B signature aesthetic: deep pine teal-black, warm stone, and terracotta orange',
    particleColors: [
      'rgba(217, 83, 30, ',
      'rgba(10, 50, 53, ',
      'rgba(107, 63, 230, ',
      'rgba(197, 185, 206, ',
      'rgba(217, 83, 30, ',
    ],
    lineColor: 'rgba(10, 50, 53, ',
    mouseLineColor: 'rgba(217, 83, 30, ',
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

const STORAGE_KEY = 'air_theme_active_palette'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    if (typeof window === 'undefined') return 'green'
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePalette | null
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved
    }
    return 'green'
  })

  const [isDark, setIsDark] = useState<boolean>(false)

  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]

  useEffect(() => {
    const root = document.documentElement

    // Remove legacy and existing theme classes
    root.classList.remove('theme-green', 'theme-blue', 'theme-classic', 'default')

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
