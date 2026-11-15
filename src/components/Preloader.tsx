import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    __PRELOADER_REVEALED__?: boolean
  }
}

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
 */
export default function Preloader() {
  const [visible, setVisible] = useState(true)
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

  return (
    <div
      className="preloader"
      id="preloader"
      aria-hidden="true"
      style={{
        transform: slidingUp ? 'translateY(-100%)' : 'translateY(0%)',
        opacity: fadingCurtain ? 0 : 1,
        transition: slidingUp
          ? 'transform 1200ms cubic-bezier(0, -0.18, 0, 1), opacity 300ms cubic-bezier(0.55, 0.085, 0.68, 0.53)'
          : 'none',
      }}
    >
      <div className="preloader-white" />
      <div className="preloader-bg">
        <div className="page-bg-gradient-wrap" />
        <div className="page-bg-pattern" />
      </div>
      <div className="preloader-content">
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
      </div>
    </div>
  )
}
