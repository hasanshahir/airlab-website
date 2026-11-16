import { useEffect, useState, type RefObject } from 'react'

/**
 * Latches to `true` the first time an element enters the viewport (and after
 * the initial page preloader completes when `waitForPreloader` is true).
 */
export function useFirstReveal(
  ref: RefObject<HTMLElement | null>,
  waitForPreloader = false
): boolean {
  const isRevealedSession = () => {
    if (typeof window === 'undefined') return true
    if (window.__PRELOADER_REVEALED__) return true
    try {
      return sessionStorage.getItem('airlab_preloader_revealed') === 'true'
    } catch {
      return false
    }
  }

  const [inView, setInView] = useState(false)
  const [preloaderReady, setPreloaderReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    if (isRevealedSession()) return true
    if (!document.body.classList.contains('is-loading') && !waitForPreloader) {
      return true
    }
    return false
  })

  useEffect(() => {
    const checkState = () => {
      if (isRevealedSession() && !document.body.classList.contains('is-loading')) {
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
    const fallback = window.setTimeout(() => setPreloaderReady(true), 6200)
    return () => {
      window.removeEventListener('preloader-start', onStart)
      window.removeEventListener('preloader-reveal', onReveal)
      window.clearTimeout(fallback)
    }
  }, [waitForPreloader])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return inView && preloaderReady
}
