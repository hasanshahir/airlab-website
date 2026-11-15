import React, { useMemo, useRef, useState } from 'react'
import { useFirstReveal } from '../../lib/useFirstReveal'

export interface BlurRevealProps {
  text?: string
  children?: React.ReactNode
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote'
  className?: string
  style?: React.CSSProperties
  delay?: number
  duration?: number
  mode?: 'word' | 'char'
  waitForPreloader?: boolean
}

function tokenizeWords(text: string) {
  const parts = text.split(/(\s+)/)
  const units: Array<{ isSpace: boolean; value: string; index: number }> = []
  let unitIndex = 0

  for (const part of parts) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      units.push({ isSpace: true, value: part, index: -1 })
    } else {
      units.push({ isSpace: false, value: part, index: unitIndex++ })
    }
  }
  return { units, total: unitIndex }
}

function tokenizeChars(text: string) {
  const parts = text.split(/(\s+)/)
  const groups: Array<{
    isSpace: boolean
    chars: Array<{ char: string; index: number }>
  }> = []
  let charIndex = 0

  for (const part of parts) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      charIndex += 1
      groups.push({ isSpace: true, chars: [] })
    } else {
      const chars = Array.from(part).map((char, offset) => ({
        char,
        index: charIndex + offset,
      }))
      charIndex += chars.length
      groups.push({ isSpace: false, chars })
    }
  }
  return { groups, total: charIndex }
}

/**
 * Progressive left-to-right optical blur reveal triggered the first time text enters view.
 */
export function BlurReveal({
  text,
  children,
  as: Tag = 'p',
  className = '',
  style,
  delay = 0,
  duration = 520,
  mode = 'word',
  waitForPreloader = false,
}: BlurRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const isRevealed = useFirstReveal(rootRef, waitForPreloader)
  const [prefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const rawString =
    typeof text === 'string'
      ? text
      : typeof children === 'string'
      ? children
      : ''

  const wordData = useMemo(
    () => (mode === 'word' && rawString ? tokenizeWords(rawString) : null),
    [mode, rawString]
  )

  const charData = useMemo(
    () => (mode === 'char' && rawString ? tokenizeChars(rawString) : null),
    [mode, rawString]
  )

  if (!rawString) {
    return React.createElement(Tag, { className, style }, children)
  }

  const baseDelayMs = Math.round(delay * 1000)

  if (prefersReducedMotion) {
    return React.createElement(Tag, { ref: rootRef, className, style }, rawString)
  }

  const totalUnits = mode === 'char' ? charData?.total ?? 1 : wordData?.total ?? 1
  const staggerMs =
    mode === 'char'
      ? Math.min(26, Math.max(10, Math.round(420 / Math.max(1, totalUnits))))
      : Math.min(34, Math.max(12, Math.round(460 / Math.max(1, totalUnits))))

  const unitStyle = (idx: number): React.CSSProperties => ({
    opacity: isRevealed ? 1 : 0,
    filter: isRevealed ? 'blur(0px)' : 'blur(10px)',
    transform: isRevealed ? 'translateY(0px)' : 'translateY(6px)',
    transitionProperty: 'opacity, filter, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDelay: isRevealed ? `${baseDelayMs + idx * staggerMs}ms` : '0ms',
  })

  if (mode === 'char' && charData) {
    return React.createElement(
      Tag,
      { ref: rootRef, className, style, 'aria-label': rawString },
      charData.groups.map((group, gIdx) =>
        group.isSpace ? (
          <React.Fragment key={`sp-${gIdx}`}> </React.Fragment>
        ) : (
          <span
            key={`wg-${gIdx}`}
            className="inline-block whitespace-nowrap"
            aria-hidden="true"
          >
            {group.chars.map(({ char, index }) => (
              <span
                key={index}
                className="inline-block will-change-[filter,opacity,transform]"
                style={unitStyle(index)}
              >
                {char}
              </span>
            ))}
          </span>
        )
      )
    )
  }

  return React.createElement(
    Tag,
    { ref: rootRef, className, style, 'aria-label': rawString },
    wordData?.units.map((unit, uIdx) =>
      unit.isSpace ? (
        <React.Fragment key={`sp-${uIdx}`}> </React.Fragment>
      ) : (
        <span
          key={`wd-${uIdx}`}
          className="inline-block will-change-[filter,opacity,transform]"
          style={unitStyle(unit.index)}
          aria-hidden="true"
        >
          {unit.value}
        </span>
      )
    )
  )
}

export default BlurReveal
