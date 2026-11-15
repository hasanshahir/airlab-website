import React, { useEffect, useRef, useState } from 'react'
import { TextReveal } from './cascade-text'

interface TitleRevealProps {
  text?: string
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span'
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  waitForPreloader?: boolean
  hoverColor?: string
  direction?: 'up' | 'down'
}

/**
 * Combines initial scroll/preloader blur-fade entrance reveal with interactive
 * character-cascade hover interaction (`cascade-text.tsx` `TextReveal`) across
 * all page and section headings.
 */
export default function TitleReveal({
  text,
  children,
  as: Tag = 'h1',
  className = '',
  style,
  delay = 0,
  waitForPreloader = false,
  hoverColor = 'var(--accent-orange)',
  direction = 'up',
}: TitleRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)
  const [preloaderReady, setPreloaderReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    if (window.__PRELOADER_REVEALED__) return true
    if (!document.body.classList.contains('is-loading') && !waitForPreloader) {
      return true
    }
    return false
  })
  const [isTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  const rawString =
    typeof text === 'string'
      ? text
      : typeof children === 'string'
      ? children
      : ''

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
      entries => {
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

  if (!rawString) {
    return React.createElement(Tag, { className, style }, children)
  }

  const adaptiveStagger = Math.min(24, Math.max(10, Math.round(320 / Math.max(1, rawString.length))))

  return React.createElement(
    Tag,
    {
      ref: rootRef as React.Ref<HTMLHeadingElement>,
      className,
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
    <TextReveal
      as="span"
      text={rawString}
      staggerDelay={adaptiveStagger}
      duration={260}
      hoverColor={hoverColor}
      direction={direction}
      className="inline-block"
    />
  )
}
