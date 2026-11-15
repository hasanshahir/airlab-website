import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    __PRELOADER_REVEALED__?: boolean
  }
}

<<<<<<< fix/projects-modal-and-sheet-data
const BOLD_CHARS = ['A', 'I', 'R', '\u00A0', 'L', 'a', 'b']
const LIGHT_CHARS = ['.', 'n', 'e', 'd', 'u', 'e', 't']

/**
 * Reverse-engineered Preloader & Page Reveal component from microdose.studio/about
 * (components.min.js + shared.min.js lines 373-403).
 *
 * Timeline:
 * 1. Locks body scroll (`body.is-loading`) and sets `.pl-char` to `{ opacity: 0, y: 12, filter: blur(6px) }`.
 * 2. Stagger-reveals `.pl-char` (`duration: 0.45s`, `stagger: 0.03s`, `delay: 0.2s`, `ease: cubic-bezier(0.43, 0.98, 0.87, 1)`).
 * 3. Dispatches `window.dispatchEvent(new Event('preloader-reveal'))` when characters finish appearing.
 * 4. After `0.6s` hold, characters blur-fade upward (`y: -12`, `duration: 0.3s`, `stagger: 0.02s`) while the
 *    curtain slides up (`translateY(-100%)`, `duration: 1.2s`, `ease: cubic-bezier(0, -0.18, 0, 1)`).
=======
interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  wobbleFreq: number
  wobbleAmp: number
  phase: number
}

const INITIAL_BUBBLES: Bubble[] = [
  { x: 115, y: 420, r: 4.2, speed: 2.4, wobbleFreq: 0.08, wobbleAmp: 6, phase: 0.4 },
  { x: 185, y: 445, r: 3.1, speed: 2.9, wobbleFreq: 0.11, wobbleAmp: 5, phase: 1.7 },
  { x: 255, y: 390, r: 4.8, speed: 2.2, wobbleFreq: 0.07, wobbleAmp: 7, phase: 3.1 },
  { x: 335, y: 430, r: 3.6, speed: 2.7, wobbleFreq: 0.09, wobbleAmp: 5, phase: 4.5 },
  { x: 380, y: 410, r: 2.8, speed: 3.1, wobbleFreq: 0.12, wobbleAmp: 4, phase: 2.2 },
  { x: 150, y: 380, r: 3.4, speed: 2.5, wobbleFreq: 0.1, wobbleAmp: 6, phase: 5.3 },
]

/**
 * Builds a smooth horizontal wave polygon path across viewBox [0..467, 0..467]
 * from a free-surface function y(x), closing around the bottom of the vessel.
 */
function buildWavePolygonPath(
  baseY: number,
  amp: number,
  phase1: number,
  phase2: number,
  tilt: number
): { areaPath: string; surfacePath: string } {
  const minX = -20
  const maxX = 487
  const segments = 16
  const step = (maxX - minX) / segments
  const pts: Array<{ x: number; y: number }> = []

  for (let i = 0; i <= segments; i++) {
    const x = minX + i * step
    const nx = (x - 233.5) / 233.5 // normalized [-1, 1]
    const wave1 = Math.sin(nx * Math.PI * 1.65 + phase1) * amp
    const wave2 = Math.cos(nx * Math.PI * 2.8 - phase2) * (amp * 0.42)
    // Concave meniscus rise near container walls
    const meniscus = Math.pow(Math.abs(nx), 2.4) * (amp * 0.35)
    const slosh = nx * tilt
    const y = baseY + wave1 + wave2 + slosh - meniscus
    pts.push({ x, y })
  }

  let surface = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const midX = ((p0.x + p1.x) / 2).toFixed(1)
    const midY = ((p0.y + p1.y) / 2).toFixed(1)
    surface += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${midX} ${midY}`
  }
  const last = pts[pts.length - 1]
  surface += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`

  const area = `${surface} L 495 500 L -25 500 Z`
  return { areaPath: area, surfacePath: surface }
}

/**
 * Physics-driven Fluid Pour Logo Preloader & Page Dissolve Reveal.
 * - Uses ONLY `src/assets/air-lab-mark.png` as a sculpted vessel container (zero text).
 * - Simulates liquid pouring into the logo container with spring-damper sloshing,
 *   dual-layer wave depth, specular meniscus crest, and buoyant micro-bubbles.
 * - When the container finishes filling, the entire screen dissolves smoothly
 *   into the page instead of sliding upward.
>>>>>>> local
 */
export default function Preloader() {
  const [visible, setVisible] = useState(true)
<<<<<<< fix/projects-modal-and-sheet-data
  const [phase, setPhase] = useState<'initial' | 'in' | 'out'>('initial')
  const [slidingUp, setSlidingUp] = useState(false)
  const [fadingCurtain, setFadingCurtain] = useState(false)
  const isTouchRef = useRef(false)

  useEffect(() => {
    isTouchRef.current =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    const runSequence = () => {
      setVisible(true)
      setPhase('initial')
      setSlidingUp(false)
      setFadingCurtain(false)
      window.__PRELOADER_REVEALED__ = false
      document.body.classList.add('is-loading')

      const totalChars = BOLD_CHARS.length + LIGHT_CHARS.length
      // Step 1: start char reveal on next frame (delay 200ms + stagger 30ms + duration 450ms)
      const startTimer = window.setTimeout(() => {
        setPhase('in')
      }, 40)

      const charsInDoneTime = 40 + 200 + (totalChars - 1) * 30 + 450

      // Step 2: dispatch preloader-reveal when chars complete
      const revealEventTimer = window.setTimeout(() => {
        window.__PRELOADER_REVEALED__ = true
        window.dispatchEvent(new Event('preloader-reveal'))
      }, charsInDoneTime)

      // Step 3: after 0.6s hold, slide curtain up & fade chars out upward
      const slideStartTime = charsInDoneTime + 600
      const slideTimer = window.setTimeout(() => {
        setPhase('out')
        setSlidingUp(true)
      }, slideStartTime)

      // Step 4: fade curtain opacity during the last 0.3s of the 1.2s slide
      const fadeTimer = window.setTimeout(() => {
        setFadingCurtain(true)
      }, slideStartTime + 900)

      // Step 5: cleanup & unmount after 1.2s slide completes
      const doneTimer = window.setTimeout(() => {
        document.body.classList.remove('is-loading')
        setVisible(false)
      }, slideStartTime + 1220)

      return () => {
        window.clearTimeout(startTimer)
        window.clearTimeout(revealEventTimer)
        window.clearTimeout(slideTimer)
        window.clearTimeout(fadeTimer)
        window.clearTimeout(doneTimer)
        document.body.classList.remove('is-loading')
      }
=======
  const [phase, setPhase] = useState<'pouring' | 'settled' | 'dissolving'>('pouring')
  const [isRouteTransition, setIsRouteTransition] = useState(false)

  const frontWaveRef = useRef<SVGPathElement | null>(null)
  const backWaveRef = useRef<SVGPathElement | null>(null)
  const meniscusRef = useRef<SVGPathElement | null>(null)
  const pourStreamLeftRef = useRef<SVGPathElement | null>(null)
  const pourStreamRightRef = useRef<SVGPathElement | null>(null)
  const bubbleRefs = useRef<Array<SVGCircleElement | null>>([])

  const runPourSequence = (fastMode: boolean) => {
    setIsRouteTransition(fastMode)
    setVisible(true)
    setPhase('pouring')
    window.__PRELOADER_REVEALED__ = false
    document.body.classList.add('is-loading')
    window.dispatchEvent(new Event('preloader-start'))

    const pourDuration = fastMode ? 680 : 1220
    const settleHold = fastMode ? 110 : 200
    const dissolveDuration = fastMode ? 480 : 680

    let rafId: number | null = null
    const startTime = performance.now()
    let lastTime = startTime
    let prevFill = 0

    // Spring-damper state for realistic liquid sloshing
    let tilt = 0
    let tiltVel = 0
    let phase1 = 0
    let phase2 = 0

    const bubbles = INITIAL_BUBBLES.map((b) => ({ ...b }))

    const animatePour = (now: number) => {
      const dt = Math.min(32, Math.max(8, now - lastTime)) / 16.667
      lastTime = now

      const elapsed = now - startTime
      const rawT = Math.min(1, Math.max(0, elapsed / pourDuration))

      // Natural fluid-fill curve: initial gravity drop, rapid basin fill, smooth top-off
      const fill =
        rawT < 0.12
          ? (rawT / 0.12) * 0.06
          : 0.06 +
            0.94 *
              (1 - Math.pow(1 - (rawT - 0.12) / 0.88, 2.15))

      const fillRate = (fill - prevFill) / Math.max(0.001, dt)
      prevFill = fill

      // Map fill [0..1] to SVG Y coordinate [455..-18]
      const baseY = 455 - fill * 473

      // Excite sloshing spring from pouring momentum and lateral channel geometry
      const channelImpulse =
        Math.sin(fill * Math.PI * 3.2) * fillRate * 420
      const springForce = -0.095 * tilt + channelImpulse
      tiltVel = (tiltVel + springForce * dt) * Math.pow(0.89, dt)
      tilt += tiltVel * dt

      // Wave amplitude builds during active pour and damps to 0 as vessel tops off
      const pourEnvelope =
        Math.sin(Math.min(1, rawT) * Math.PI) *
        (1 - Math.pow(rawT, 3.2))
      const amp = 3.5 + pourEnvelope * 19 + Math.min(8, Math.abs(tilt) * 0.25)

      phase1 += 0.155 * dt
      phase2 += 0.115 * dt

      const front = buildWavePolygonPath(baseY, amp, phase1, phase2, tilt)
      const back = buildWavePolygonPath(
        baseY - 5 * pourEnvelope,
        amp * 1.12,
        phase1 + 2.1,
        phase2 - 1.4,
        -tilt * 0.75
      )

      if (frontWaveRef.current) {
        frontWaveRef.current.setAttribute('d', front.areaPath)
      }
      if (backWaveRef.current) {
        backWaveRef.current.setAttribute('d', back.areaPath)
      }
      if (meniscusRef.current) {
        meniscusRef.current.setAttribute('d', front.surfacePath)
      }

      // Gravity-accelerated pouring streams from top into the rising surface
      const streamActive = rawT > 0.01 && rawT < 0.86
      if (pourStreamLeftRef.current && pourStreamRightRef.current) {
        if (streamActive) {
          const streamIn = Math.min(1, rawT / 0.09)
          const streamOut = Math.max(0, Math.min(1, (0.86 - rawT) / 0.14))
          const streamStrength = streamIn * streamOut
          const topY = -10
          const hitY = Math.min(445, baseY + 14) * streamIn
          const topW = 14 * streamStrength
          const botW = 5.5 * streamStrength // tapers as gravity accelerates stream
          const wobble = Math.sin(phase1 * 1.4) * 3.5 * streamStrength

          // Stream 1 feeds the left/arch channel of 'a' (x ≈ 196)
          const x1 = 196 + wobble
          const d1 = `M ${(x1 - topW).toFixed(1)} ${topY} L ${(x1 + topW).toFixed(1)} ${topY} L ${(x1 + botW).toFixed(1)} ${hitY.toFixed(1)} L ${(x1 - botW).toFixed(1)} ${hitY.toFixed(1)} Z`
          pourStreamLeftRef.current.setAttribute('d', d1)
          pourStreamLeftRef.current.style.opacity = streamStrength.toFixed(2)

          // Stream 2 feeds the right/stem channel (x ≈ 332)
          const x2 = 332 - wobble * 0.8
          const d2 = `M ${(x2 - topW * 0.85).toFixed(1)} ${topY} L ${(x2 + topW * 0.85).toFixed(1)} ${topY} L ${(x2 + botW * 0.85).toFixed(1)} ${hitY.toFixed(1)} L ${(x2 - botW * 0.85).toFixed(1)} ${hitY.toFixed(1)} Z`
          pourStreamRightRef.current.setAttribute('d', d2)
          pourStreamRightRef.current.style.opacity = (streamStrength * 0.9).toFixed(2)
        } else {
          pourStreamLeftRef.current.style.opacity = '0'
          pourStreamRightRef.current.style.opacity = '0'
        }
      }

      // Update buoyant micro-bubbles inside the poured liquid
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]
        const el = bubbleRefs.current[i]
        if (!el) continue
        b.y -= b.speed * dt
        b.phase += b.wobbleFreq * dt
        if (b.y < baseY + 12 || b.y < 30) {
          b.y = 435 + (i * 11) % 30
        }
        const bx = b.x + Math.sin(b.phase) * b.wobbleAmp
        const visibleInLiquid = b.y > baseY + 8 && rawT < 0.96
        el.setAttribute('cx', bx.toFixed(1))
        el.setAttribute('cy', b.y.toFixed(1))
        el.style.opacity = visibleInLiquid ? '0.45' : '0'
      }

      if (rawT < 1) {
        rafId = requestAnimationFrame(animatePour)
      }
    }

    rafId = requestAnimationFrame(animatePour)

    // Container filled -> settle pulse & trigger page title reveals
    const settleTimer = window.setTimeout(() => {
      setPhase('settled')
      window.__PRELOADER_REVEALED__ = true
      window.dispatchEvent(new Event('preloader-reveal'))
    }, pourDuration)

    // Dissolve screen smoothly after brief settle hold (no upward slide)
    const dissolveTimer = window.setTimeout(() => {
      setPhase('dissolving')
      document.body.classList.remove('is-loading')
    }, pourDuration + settleHold)

    // Unmount after dissolve finishes
    const doneTimer = window.setTimeout(() => {
      setVisible(false)
    }, pourDuration + settleHold + dissolveDuration + 30)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.clearTimeout(settleTimer)
      window.clearTimeout(dissolveTimer)
      window.clearTimeout(doneTimer)
      document.body.classList.remove('is-loading')
    }
  }

  // Initial website open reveal
  useEffect(() => {
    const cleanup = runPourSequence(false)
    const handleCustomTrigger = () => {
      runPourSequence(false)
>>>>>>> local
    }

    const cleanup = runSequence()

    const handleRetrigger = () => {
      runSequence()
    }
    window.addEventListener('airlab-trigger-preloader', handleRetrigger)

    return () => {
      cleanup()
      window.removeEventListener('airlab-trigger-preloader', handleRetrigger)
    }
  }, [])

<<<<<<< fix/projects-modal-and-sheet-data
  if (!visible) return null

  const isTouch = isTouchRef.current

  const getCharStyle = (index: number): React.CSSProperties => {
    if (phase === 'initial') {
      return {
        opacity: 0,
        transform: 'translateY(12px)',
        filter: isTouch ? 'none' : 'blur(6px)',
      }
    }
    if (phase === 'in') {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
        filter: isTouch ? 'none' : 'blur(0px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '450ms',
        transitionTimingFunction: 'cubic-bezier(0.43, 0.98, 0.87, 1)',
        transitionDelay: `${200 + index * 30}ms`,
      }
    }
    // phase === 'out'
    return {
      opacity: 0,
      transform: 'translateY(-12px)',
      filter: isTouch ? 'none' : 'blur(6px)',
      transitionProperty: 'opacity, transform, filter',
      transitionDuration: '300ms',
      transitionTimingFunction: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      transitionDelay: `${index * 20}ms`,
    }
  }
=======
  // Route change reveal
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname
      return runPourSequence(true)
    }
  }, [location.pathname])

  if (!visible) return null

  const dissolveMs = isRouteTransition ? 480 : 680
  const isDissolving = phase === 'dissolving'
  const isSettled = phase === 'settled'
>>>>>>> local

  return (
    <div
      className="preloader"
      id="preloader"
      aria-hidden="true"
      style={{
<<<<<<< fix/projects-modal-and-sheet-data
        transform: slidingUp ? 'translateY(-100%)' : 'translateY(0%)',
        opacity: fadingCurtain ? 0 : 1,
        transition: slidingUp
          ? 'transform 1200ms cubic-bezier(0, -0.18, 0, 1), opacity 300ms cubic-bezier(0.55, 0.085, 0.68, 0.53)'
=======
        opacity: isDissolving ? 0 : 1,
        filter: isDissolving ? 'blur(10px)' : 'blur(0px)',
        pointerEvents: isDissolving ? 'none' : 'auto',
        transition: isDissolving
          ? `opacity ${dissolveMs}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${dissolveMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
>>>>>>> local
          : 'none',
      }}
    >
      <div className="preloader-white" />
      <div className="preloader-bg">
        <div className="page-bg-gradient-wrap" />
        <div className="page-bg-pattern" />
      </div>
      <div className="preloader-content">
<<<<<<< fix/projects-modal-and-sheet-data
        <span className="preloader-logo" style={{ opacity: 1 }}>
          <span className="preloader-logo-bold">
            {BOLD_CHARS.map((ch, idx) => (
              <span
                key={`b-${idx}`}
                className="pl-char"
                style={getCharStyle(idx)}
              >
                {ch}
              </span>
            ))}
          </span>
          <span className="preloader-logo-light">
            {LIGHT_CHARS.map((ch, idx) => (
              <span
                key={`l-${idx}`}
                className="pl-char"
                style={getCharStyle(BOLD_CHARS.length + idx)}
              >
                {ch}
              </span>
            ))}
          </span>
        </span>
=======
        <div
          className="preloader-fluid-mark-wrap"
          style={{
            transform: isDissolving
              ? 'scale(1.06)'
              : isSettled
              ? 'scale(1.025)'
              : 'scale(1)',
            transition: isDissolving
              ? `transform ${dissolveMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg
            viewBox="0 0 467 467"
            className="preloader-fluid-svg"
            aria-hidden="true"
          >
            <defs>
              {/* Converts any opaque pixel of air-lab-mark.png into pure white for a 100% solid vessel mask */}
              <filter id="airlab-alpha-to-white" x="0%" y="0%" width="100%" height="100%">
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1
                          0 0 0 0 1
                          0 0 0 0 1
                          0 0 0 1 0"
                />
              </filter>

              {/* Soft liquid viscosity blur for pouring streams and wave surface */}
              <filter id="airlab-liquid-goo" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 16 -6"
                  result="goo"
                />
              </filter>

              {/* Exact Logo Container Mask: clips all poured liquid strictly inside the AIR Lab logo */}
              <mask id="airlab-vessel-mask">
                <rect width="467" height="467" fill="black" />
                <image
                  href={airLabMark}
                  width="467"
                  height="467"
                  preserveAspectRatio="xMidYMid meet"
                  filter="url(#airlab-alpha-to-white)"
                />
              </mask>

              {/* Dynamic front liquid volume mask (rising sloshing wave + pouring streams) */}
              <mask id="airlab-liquid-fill-mask">
                <rect width="467" height="467" fill="black" />
                <g filter="url(#airlab-liquid-goo)" fill="white">
                  <path ref={pourStreamLeftRef} d="M 0 0 Z" opacity="0" />
                  <path ref={pourStreamRightRef} d="M 0 0 Z" opacity="0" />
                  <path
                    ref={frontWaveRef}
                    d="M -20 467 L 487 467 L 487 500 L -20 500 Z"
                  />
                </g>
              </mask>

              {/* Gradients for back-wave depth & glowing meniscus surface tension */}
              <linearGradient id="airlab-backwave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9B6BFF" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#5C3EE8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#1D0B5E" stopOpacity="0.75" />
              </linearGradient>

              <linearGradient id="airlab-meniscus-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(251, 131, 232, 0.85)" />
                <stop offset="50%" stopColor="rgba(255, 220, 190, 0.95)" />
                <stop offset="100%" stopColor="rgba(130, 120, 255, 0.85)" />
              </linearGradient>
            </defs>

            {/* 1. Sculpted Empty Logo Container (always visible as the vessel being filled) */}
            <image
              href={airLabMark}
              width="467"
              height="467"
              preserveAspectRatio="xMidYMid meet"
              style={{
                opacity: 0.15,
                filter: 'grayscale(0.35) contrast(0.95)',
              }}
            />

            {/* 2. Poured Liquid Strictly Clipped Inside the Logo Container */}
            <g mask="url(#airlab-vessel-mask)">
              {/* Back sloshing wave for 3D fluid volume inside the translucent container */}
              <path
                ref={backWaveRef}
                d="M -20 467 L 487 467 L 487 500 L -20 500 Z"
                fill="url(#airlab-backwave-grad)"
              />

              {/* Primary Poured Liquid: Reveals the true full-color AIR Lab mark */}
              <g mask="url(#airlab-liquid-fill-mask)">
                <image
                  href={airLabMark}
                  width="467"
                  height="467"
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* Buoyant micro-bubbles rising through the poured liquid */}
                {INITIAL_BUBBLES.map((b, i) => (
                  <circle
                    key={i}
                    ref={(el) => {
                      bubbleRefs.current[i] = el
                    }}
                    cx={b.x}
                    cy={b.y}
                    r={b.r}
                    fill="rgba(255, 255, 255, 0.55)"
                    style={{ opacity: 0, mixBlendMode: 'overlay' }}
                  />
                ))}
              </g>

              {/* Glowing surface-tension meniscus along the sloshing wave crest */}
              <path
                ref={meniscusRef}
                d="M -20 467 L 487 467"
                fill="none"
                stroke="url(#airlab-meniscus-grad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{
                  opacity: phase === 'pouring' ? 0.85 : 0,
                  transition: 'opacity 220ms ease-out',
                  mixBlendMode: 'screen',
                }}
              />
            </g>
          </svg>
        </div>
>>>>>>> local
      </div>
    </div>
  )
}
