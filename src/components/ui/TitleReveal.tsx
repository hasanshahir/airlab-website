import React, { useEffect, useRef, useState } from 'react'

interface TitleRevealProps {
  text?: string
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span'
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  waitForPreloader?: boolean
}

const FALLOFF = [1, 0.7, 0.4, 0.15]
const RADIUS = 3

/**
 * Reverse-engineered Big Title Reveal Animation from microdose.studio
 * (about.html lines 518-575, index.html lines 912-1114).
 *
 * Features:
 * 1. Splits heading text into `.title-reveal-word` and `.title-reveal-char` spans.
 * 2. Animates container blur-fade-in (`blur(8px) -> blur(0px)`, `y: 16 -> 0`, `800ms`, `cubic-bezier(0.43, 0.98, 0.87, 1)`).
 * 3. Staggers every character from `{ opacity: 0, y: 8, filter: blur(6px) }` to `{ opacity: 1, y: 0, filter: blur(0px) }`
 *    with `duration: 450ms`, `stagger: 20ms` (`0.02s`), `ease: cubic-bezier(0.43, 0.98, 0.87, 1)`.
 * 4.Coordinates with the Preloader (`preloader-reveal` event) when visible during initial load.
 * 5. Includes Microdose's desktop hover proximity character weight wave (`FALLOFF = [1, 0.7, 0.4, 0.15]`).
 */
export default function TitleReveal({
  text,
  children,
  as: Tag = 'h1',
  className = '',
  style,
  delay = 0,
  stagger = 0.018,
  waitForPreloader = false,
}: TitleRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [inView, setInView] = useState(false)
  const [preloaderReady, setPreloaderReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    if (window.__PRELOADER_REVEALED__) return true
    if (!document.body.classList.contains('is-loading') && !waitForPreloader) {
      return true
    }
    return false
  })
  const [isTouch, setIsTouch] = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const rawString =
    typeof text === 'string'
      ? text
      : typeof children === 'string'
      ? children
      : ''

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const checkState = () => {
      if (window.__PRELOADER_REVEALED__ && !document.body.classList.contains('is-loading')) {
        setPreloaderReady(true)
      } else if (waitForPreloader || document.body.classList.contains('is-loading')) {
        setPreloaderReady(false)
      }
    }
    checkState()

    const onStart = () => {
      if (waitForPreloader) setPreloaderReady(false)
    }
    const onReveal = () => setPreloaderReady(true)

    window.addEventListener('preloader-start', onStart)
    window.addEventListener('preloader-reveal', onReveal)
    const fallback = window.setTimeout(() => setPreloaderReady(true), 2200)
    return () => {
      window.removeEventListener('preloader-start', onStart)
      window.removeEventListener('preloader-reveal', onReveal)
      window.clearTimeout(fallback)
    }
  }, [waitForPreloader])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isRevealed = inView && preloaderReady

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch || !isRevealed) return
    const mouseX = e.clientX
    const mouseY = e.clientY
    let closest = -1
    let minDist = Infinity

    for (let i = 0; i < charRefs.current.length; i++) {
      const ch = charRefs.current[i]
      if (!ch) continue
      const rect = ch.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.hypot(mouseX - cx, mouseY - cy)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    }
    if (closest !== -1 && minDist < 120) {
      setHoverIdx(closest)
    } else {
      setHoverIdx(null)
    }
  }

  const handleMouseLeave = () => {
    if (!isTouch) setHoverIdx(null)
  }

  if (!rawString) {
    return React.createElement(Tag, { className }, children)
  }

  const words = rawString.split(' ')
  let globalCharIndex = 0

  return React.createElement(
    Tag,
    {
      ref: rootRef as React.Ref<HTMLHeadingElement>,
      className,
      'aria-label': rawString,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        ...style,
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0px)' : 'translateY(14px)',
        filter: isTouch
          ? 'none'
          : isRevealed
          ? 'blur(0px)'
          : 'blur(8px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '800ms',
        transitionTimingFunction: 'cubic-bezier(0.43, 0.98, 0.87, 1)',
        transitionDelay: `${Math.round(delay * 1000)}ms`,
      },
    },
    words.map((word, wIdx) => {
      const chars = Array.from(word)
      return (
        <React.Fragment key={wIdx}>
          <span className="title-reveal-word" aria-hidden="true">
            {chars.map((ch, cIdx) => {
              const charIndex = globalCharIndex++
              const charDelayMs = Math.round((delay + charIndex * stagger) * 1000)

              let weightFactor = 0
              if (hoverIdx !== null) {
                const dist = Math.abs(charIndex - hoverIdx)
                if (dist <= RADIUS) {
                  weightFactor = FALLOFF[dist] ?? 0
                }
              }

              return (
                <span
                  key={cIdx}
                  ref={(el) => {
                    charRefs.current[charIndex] = el
                  }}
                  className="title-reveal-char"
                  style={{
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed
                      ? weightFactor > 0
                        ? `translateY(${(-1.5 * weightFactor).toFixed(2)}px)`
                        : 'translateY(0px)'
                      : 'translateY(8px)',
                    filter: isTouch
                      ? 'none'
                      : isRevealed
                      ? 'blur(0px)'
                      : 'blur(6px)',
                    fontVariationSettings:
                      weightFactor > 0
                        ? `"wght" ${Math.round(600 + 150 * weightFactor)}`
                        : undefined,
                    transitionProperty: 'opacity, transform, filter, font-variation-settings',
                    transitionDuration: hoverIdx !== null ? '220ms' : '450ms',
                    transitionTimingFunction:
                      hoverIdx !== null
                        ? 'cubic-bezier(0.8, 0.1, 0.21, 0.72)'
                        : 'cubic-bezier(0.43, 0.98, 0.87, 1)',
                    transitionDelay:
                      hoverIdx !== null ? '0ms' : `${charDelayMs}ms`,
                  }}
                >
                  {ch}
                </span>
              )
            })}
          </span>
          {wIdx < words.length - 1 ? ' ' : null}
        </React.Fragment>
      )
    })
  )
}
