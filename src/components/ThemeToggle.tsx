import React from 'react'
import { motion } from 'framer-motion'
import { useTheme, THEME_OPTIONS } from './ThemeProvider'
import type { ThemePalette } from './ThemeProvider'

interface ThemeToggleProps {
  compact?: boolean
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const { palette, setPalette } = useTheme()

  if (compact) {
    // Quick cycling button for compact screens
    const currentIndex = THEME_OPTIONS.findIndex(t => t.id === palette)
    const nextTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length]
    const currentTheme = THEME_OPTIONS[currentIndex] || THEME_OPTIONS[0]

    return (
      <button
        type="button"
        onClick={() => setPalette(nextTheme.id)}
        className={`inline-flex items-center gap-2 h-9 px-3 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98] ${className}`}
        title={`Current theme: ${currentTheme.name}. Tap to switch to ${nextTheme.name}`}
        aria-label={`Current theme: ${currentTheme.name}. Tap to switch to ${nextTheme.name}`}
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-white/60 shadow-xs"
          style={{ backgroundColor: currentTheme.accent }}
        />
        <span className="font-medium">{currentTheme.label}</span>
      </button>
    )
  }

  // Full segmented pill control showing all 3 color themes
  return (
    <div
      role="radiogroup"
      aria-label="Color Theme Switcher"
      className={`inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs ${className}`}
    >
      {THEME_OPTIONS.map(opt => {
        const isActive = palette === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPalette(opt.id as ThemePalette)}
            className={`relative px-3 py-1 rounded-full text-[12px] font-semibold transition-colors duration-180 flex items-center gap-1.5 cursor-pointer select-none ${
              isActive
                ? 'text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="activeThemePillIndicator"
                className="absolute inset-0 rounded-full bg-[var(--accent-orange)] shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span
              className="relative z-10 w-2 h-2 rounded-full shrink-0 shadow-2xs transition-transform"
              style={{
                backgroundColor: opt.accent,
                boxShadow: isActive ? '0 0 0 1.5px rgba(255,255,255,0.7)' : 'none',
              }}
            />
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle

