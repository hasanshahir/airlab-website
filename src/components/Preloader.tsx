import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import airLabMark from '../assets/air-lab-mark.png'

declare global {
  interface Window {
    __PRELOADER_REVEALED__?: boolean
  }
}

/**
 * Continuous centerline path in the 467x467 coordinate space of `src/assets/air-lab-mark.png`:
 * 1. Right leg of 'a': (412, 435) -> (343, 285) -> (242, 170)
 * 2. Top arch of 'a': curves through (206, 98) -> (158, 155)
 * 3. Left leg of 'a': (158, 155) -> (60, 340)
 * 4. Bottom U-bend of 'a': curves through (62, 412) -> (131, 418) -> (204, 365)
 * 5. Diagonal stem of 'i': (204, 365) -> (342, 120)
 */
const RIBBON_MASK_PATH =
  'M 412 435 L 343 285 L 242 170 C 222 132 190 100 158 155 L 60 340 C 38 388 85 432 135 415 C 168 404 190 385 204 365 L 342 120'

const RIBBON_PATH_LENGTH = 1180

/**
 * Fluid Logo-Only Page Reveal & Preloader Component
 * Uses ONLY the official repository logo (`src/assets/air-lab-mark.png`) with zero text.
 *
 * Animates both on initial website open and on page/route reveals:
 * - Liquid SVG mask traces the exact ribbon geometry of `air-lab-mark.png`
 * - Elastic dot bloom at (387, 48)
 * - Fluid gradient sheen masked strictly inside the logo's alpha channel
 * - Smooth upward curtain reveal (`cubic-bezier(0, -0.18, 0, 1)`)
 */
export default function Preloader() {
  const location = useLocation()
  const prevPathnameRef = useRef<string>(location.pathname)
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<'initial' | 'drawing' | 'exiting'>('initial')
  const [slidingUp, setSlidingUp] = useState(false)
  const [fadingCurtain, setFadingCurtain] = useState(false)
  const [isRouteTransition, setIsRouteTransition] = useState(false)

  const runRevealSequence = (fastMode: boolean) => {
    setIsRouteTransition(fastMode)
    setVisible(true)
    setPhase('initial')
    setSlidingUp(false)
    setFadingCurtain(false)
    window.__PRELOADER_REVEALED__ = false
    document.body.classList.add('is-loading')
    window.dispatchEvent(new Event('preloader-start'))

    const drawDuration = fastMode ? 520 : 880
    const holdDuration = fastMode ? 140 : 280
    const curtainDuration = fastMode ? 720 : 1050

    const startTimer = window.setTimeout(() => {
      setPhase('drawing')
    }, 30)

    const revealEventTime = 30 + drawDuration
    const revealEventTimer = window.setTimeout(() => {
      window.__PRELOADER_REVEALED__ = true
      window.dispatchEvent(new Event('preloader-reveal'))
    }, revealEventTime)

    const slideStartTime = revealEventTime + holdDuration
    const slideTimer = window.setTimeout(() => {
      setPhase('exiting')
      setSlidingUp(true)
    }, slideStartTime)

    const fadeTimer = window.setTimeout(() => {
      setFadingCurtain(true)
    }, slideStartTime + Math.round(curtainDuration * 0.72))

    const doneTimer = window.setTimeout(() => {
      document.body.classList.remove('is-loading')
      setVisible(false)
    }, slideStartTime + curtainDuration + 20)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(revealEventTimer)
      window.clearTimeout(slideTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(doneTimer)
      document.body.classList.remove('is-loading')
    }
  }

  // Initial website load reveal
  useEffect(() => {
    const cleanup = runRevealSequence(false)
    const handleCustomTrigger = () => {
      runRevealSequence(false)
    }
    window.addEventListener('airlab-trigger-preloader', handleCustomTrigger)
    return () => {
      cleanup()
      window.removeEventListener('airlab-trigger-preloader', handleCustomTrigger)
    }
  }, [])

  // Page / route change reveal
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname
      return runRevealSequence(true)
    }
  }, [location.pathname])

  if (!visible) return null

  const drawMs = isRouteTransition ? 520 : 880
  const dotDelayMs = isRouteTransition ? 280 : 520
  const curtainMs = isRouteTransition ? 720 : 1050

  return (
    <div
      className="preloader"
      id="preloader"
      aria-hidden="true"
      style={{
        transform: slidingUp ? 'translateY(-100%)' : 'translateY(0%)',
        opacity: fadingCurtain ? 0 : 1,
        transition: slidingUp
          ? `transform ${curtainMs}ms cubic-bezier(0, -0.18, 0, 1), opacity 260ms cubic-bezier(0.55, 0.085, 0.68, 0.53)`
          : 'none',
      }}
    >
      <div className="preloader-white" />
      <div className="preloader-bg">
        <div className="page-bg-gradient-wrap" />
        <div className="page-bg-pattern" />
      </div>

      <div className="preloader-content">
        <div
          className="preloader-fluid-mark-wrap"
          style={{
            transform:
              phase === 'initial'
                ? 'scale(0.84) translateY(14px)'
                : phase === 'drawing'
                ? 'scale(1) translateY(0px)'
                : 'scale(0.92) translateY(-18px)',
            opacity: phase === 'exiting' ? 0 : 1,
            filter:
              phase === 'initial'
                ? 'blur(6px)'
                : phase === 'drawing'
                ? 'blur(0px)'
                : 'blur(4px)',
            transition:
              phase === 'exiting'
                ? 'transform 340ms cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 280ms ease-in, filter 280ms ease-in'
                : `transform ${drawMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out, filter 420ms ease-out`,
          }}
        >
          <svg
            viewBox="0 0 467 467"
            className="preloader-fluid-svg"
            aria-hidden="true"
          >
            <defs>
              {/* Soft liquid edge filter for the reveal mask */}
              <filter id="airlab-fluid-soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>

              {/* Mask that traces the exact ribbon geometry of air-lab-mark.png */}
              <mask id="airlab-ribbon-reveal-mask">
                <rect width="467" height="467" fill="black" />
                <path
                  d={RIBBON_MASK_PATH}
                  fill="none"
                  stroke="white"
                  strokeWidth="92"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#airlab-fluid-soft)"
                  style={{
                    strokeDasharray: RIBBON_PATH_LENGTH,
                    strokeDashoffset:
                      phase === 'initial' ? RIBBON_PATH_LENGTH : 0,
                    transition:
                      phase === 'initial'
                        ? 'none'
                        : `stroke-dashoffset ${drawMs}ms cubic-bezier(0.43, 0.98, 0.87, 1)`,
                  }}
                />
                {/* Top-right dot of the 'i' at (387, 48) */}
                <circle
                  cx="387"
                  cy="48"
                  r="42"
                  fill="white"
                  style={{
                    transformOrigin: '387px 48px',
                    transform:
                      phase === 'initial' ? 'scale(0)' : 'scale(1)',
                    transition:
                      phase === 'initial'
                        ? 'none'
                        : `transform 460ms cubic-bezier(0.34, 1.56, 0.64, 1) ${dotDelayMs}ms`,
                  }}
                />
              </mask>

              {/* Alpha mask from the actual repository logo image for the liquid sheen */}
              <mask id="airlab-logo-alpha-mask">
                <image
                  href={airLabMark}
                  width="467"
                  height="467"
                  preserveAspectRatio="xMidYMid meet"
                />
              </mask>

              {/* Liquid gradient wave that sweeps across the logo as it draws */}
              <linearGradient
                id="airlab-liquid-sheen"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(251, 131, 232, 0)" />
                <stop offset="35%" stopColor="rgba(251, 131, 232, 0.55)" />
                <stop offset="55%" stopColor="rgba(254, 179, 136, 0.65)" />
                <stop offset="75%" stopColor="rgba(97, 96, 230, 0.55)" />
                <stop offset="100%" stopColor="rgba(97, 96, 230, 0)" />
              </linearGradient>
            </defs>

            {/* Actual GitHub Repository Logo (`src/assets/air-lab-mark.png`) revealed fluidly */}
            <g mask="url(#airlab-ribbon-reveal-mask)">
              <image
                href={airLabMark}
                width="467"
                height="467"
                preserveAspectRatio="xMidYMid meet"
              />

              {/* Fluid iridescent sheen sweeping through the logo ribbon */}
              <g mask="url(#airlab-logo-alpha-mask)">
                <rect
                  x="-467"
                  y="-467"
                  width="1401"
                  height="1401"
                  fill="url(#airlab-liquid-sheen)"
                  style={{
                    mixBlendMode: 'screen',
                    transform:
                      phase === 'initial'
                        ? 'translate3d(-35%, 35%, 0)'
                        : 'translate3d(35%, -35%, 0)',
                    transition:
                      phase === 'initial'
                        ? 'none'
                        : `transform ${drawMs + 180}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
