import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import airLabMark from '../assets/air-lab-mark.png'
import {
  LiquidGlassLogoReveal,
  preloadLiquidGlassLogo,
} from './ui/liquid-glass-logo-reveal'

declare global {
  interface Window {
    __PRELOADER_REVEALED__?: boolean
  }
}

// Pre-compute the 1024x1024 texture and Euclidean Signed Distance Field (SDF)
// for AIR Lab's logo mark as soon as the module loads.
if (typeof window !== 'undefined') {
  preloadLiquidGlassLogo(airLabMark).catch(() => {})
}

/**
 * Initial Website Load Liquid Glass Logo Reveal Preloader
 *
 * Applies the WebGL2 Liquid Glass Logo Reveal animation onto AIR Lab's official
 * logo mark (`src/assets/air-lab-mark.png`), running once when the user opens
 * the website for the first time:
 * - In animation: Milky droplet condenses, swells, lands with a radial surface
 *   ripple & soft shadow, and spreads into a rounded liquid-glass squircle tile
 *   that refracts the magnified AIR Lab mark at its bevel rim with Snell's law
 *   optics, corner pull/smear, 20-band chromatic dispersion (cyan & warm
 *   gold/orange/red fringes), double-bevel specular highlights, and a sweeping
 *   diagonal light sheen.
 * - Out animation: The liquid-glass tile expands slightly, narrows its bevel
 *   into corner arcs, and releases/dissolves off the bare AIR Lab mark as it
 *   settles to `finalScale`, holds briefly, and then blurs & fades out (`outro`)
 *   before dissolving the preloader overlay to reveal the page.
 */
export default function Preloader() {
  const location = useLocation()
  const isAdmin =
    location.pathname.includes('admin') ||
    (typeof window !== 'undefined' && window.location.hash.includes('admin'))

  const isAlreadyRevealed = () => {
    if (typeof window === 'undefined') return true
    return Boolean(window.__PRELOADER_REVEALED__)
  }

  const [visible, setVisible] = useState(() => !isAdmin && !isAlreadyRevealed())
  const [dissolving, setDissolving] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const finishReveal = useCallback(() => {
    clearTimers()
    window.__PRELOADER_REVEALED__ = true
    document.body.classList.remove('is-loading')
    window.dispatchEvent(new Event('preloader-reveal'))
    setDissolving(true)

    const doneId = window.setTimeout(() => {
      setVisible(false)
    }, 340)
    timersRef.current.push(doneId)
  }, [clearTimers])

  useEffect(() => {
    if (isAdmin || isAlreadyRevealed()) {
      setVisible(false)
      document.body.classList.remove('is-loading')
      window.__PRELOADER_REVEALED__ = true
      window.dispatchEvent(new Event('preloader-reveal'))
      return
    }

    const startSequence = () => {
      clearTimers()
      setVisible(true)
      setDissolving(false)
      setRunKey(prev => prev + 1)
      document.body.classList.add('is-loading')
      window.dispatchEvent(new Event('preloader-start'))

      // Failsafe: never trap the user if WebGL or RAF is throttled in background tab
      const failsafeId = window.setTimeout(() => {
        finishReveal()
      }, 6200)
      timersRef.current.push(failsafeId)
    }

    startSequence()

    const handleCustomTrigger = () => {
      window.__PRELOADER_REVEALED__ = false
      startSequence()
    }
    window.addEventListener('airlab-trigger-preloader', handleCustomTrigger)

    return () => {
      clearTimers()
      document.body.classList.remove('is-loading')
      window.removeEventListener('airlab-trigger-preloader', handleCustomTrigger)
    }
  }, [isAdmin, clearTimers, finishReveal])

  if (isAdmin || !visible) return null

  const dissolveMs = 320

  return (
    <div
      className="preloader"
      id="preloader"
      aria-hidden="true"
      style={{
        backgroundColor: '#e9e9eb',
        opacity: dissolving ? 0 : 1,
        pointerEvents: dissolving ? 'none' : 'auto',
        transition: dissolving
          ? `opacity ${dissolveMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
          : 'none',
      }}
    >
      <LiquidGlassLogoReveal
        key={runKey}
        logo={airLabMark}
        label="AIR Lab Logo Reveal"
        look="light"
        background="#e9e9eb"
        logoColor="#0e0062"
        logoScale={0.62}
        finalScale={0.8}
        hold={0.35}
        loop={false}
        playOutroOnEnd={true}
        tuning={{ startZoom: 2.3 }}
        onComplete={finishReveal}
        className="w-full h-full"
      />
    </div>
  )
}
