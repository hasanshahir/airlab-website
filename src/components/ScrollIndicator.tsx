import { useEffect, useRef } from 'react'

const TICK_COUNT = 35
const MAJOR_EVERY = 5
const VELOCITY_SCALE = 0.3
const VELOCITY_DECAY = 0.92
const LERP_FACTOR = 0.12
const TICK_SPACING = 8

// Tick width ranges (px)
const MINOR_MIN_W = 14
const MINOR_MAX_W = 30
const MAJOR_MIN_W = 22
const MAJOR_MAX_W = 30

// How many ticks around the active position are affected
const BASE_RADIUS = 2
const MAX_RADIUS = 8

const COLORS_LIGHT_BG = {
  tick: 'rgba(12, 21, 42, 0.34)',
  major: 'rgba(12, 21, 42, 0.56)',
  r: 12,
  g: 21,
  b: 42, // #0C152A
  activeA: 1.0,
  edgeA: 0.45,
}

const COLORS_DARK_BG = {
  tick: 'rgba(255, 255, 255, 0.4)',
  major: 'rgba(255, 255, 255, 0.65)',
  r: 255,
  g: 255,
  b: 255,
  activeA: 1.0,
  edgeA: 0.48,
}

/**
 * Reverse-engineered Right-Side Page Loading / Scroll Progress Indicator
 * from microdose.studio (shared.min.js lines 108-195 & index.html lines 1600-1753).
 */
export default function ScrollIndicator() {
  const containerRef = useRef<HTMLDivElement>(null)
  const tickRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const trackHeight = (TICK_COUNT - 1) * TICK_SPACING
    container.style.height = `${trackHeight}px`

    const isMajor: boolean[] = []
    const tickWidths: number[] = []
    for (let i = 0; i < TICK_COUNT; i++) {
      const major = i % MAJOR_EVERY === 0
      isMajor.push(major)
      tickWidths.push(major ? MAJOR_MIN_W : MINOR_MIN_W)
    }

    let lastScrollY = window.scrollY
    let lastTime = performance.now()
    let smoothVelocity = 0
    let currentRadius = BASE_RADIUS
    let currentProgress = 0
    let rafId: number | null = null

    function getScrollProgress() {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return 0
      return Math.min(1, Math.max(0, window.scrollY / scrollHeight))
    }

    function lerp(current: number, target: number, factor: number) {
      return current + (target - current) * factor
    }

    function checkDarkOverlap(): boolean {
      if (!container) return false
      const rect = container.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const darkSections = document.querySelectorAll(
        '[data-nav-theme="dark"], .bg-\\[var\\(--ink-dark\\)\\]'
      )
      for (let s = 0; s < darkSections.length; s++) {
        const sr = darkSections[s].getBoundingClientRect()
        if (sr.top < midY && sr.bottom > midY) return true
      }
      return false
    }

    function update() {
      const now = performance.now()
      let dt = now - lastTime
      if (dt < 1) dt = 16

      const currentScrollY = window.scrollY
      const velocity = Math.abs(currentScrollY - lastScrollY) / dt

      smoothVelocity =
        smoothVelocity * VELOCITY_DECAY + velocity * (1 - VELOCITY_DECAY)

      const progress = getScrollProgress()
      currentProgress = lerp(currentProgress, progress, LERP_FACTOR)

      const isOnDark = checkDarkOverlap()
      if (containerRef.current) {
        containerRef.current.classList.toggle('is-dark', isOnDark)
      }
      const colors = isOnDark ? COLORS_DARK_BG : COLORS_LIGHT_BG

      // Active tick index (fractional)
      const activeIndex = currentProgress * (TICK_COUNT - 1)

      // Radius grows with scroll velocity
      const velocityBonus = smoothVelocity * VELOCITY_SCALE * 100
      let targetRadius = BASE_RADIUS + velocityBonus * 0.08
      targetRadius = Math.min(MAX_RADIUS, Math.max(BASE_RADIUS, targetRadius))
      currentRadius = lerp(currentRadius, targetRadius, LERP_FACTOR)

      for (let i = 0; i < TICK_COUNT; i++) {
        const tickEl = tickRefs.current[i]
        if (!tickEl) continue

        const dist = Math.abs(i - activeIndex)
        const major = isMajor[i]
        const minW = major ? MAJOR_MIN_W : MINOR_MIN_W
        const maxW = major ? MAJOR_MAX_W : MINOR_MAX_W

        let targetW: number
        let influence = 0
        if (dist <= currentRadius) {
          influence = 1 - dist / currentRadius
          // Smoothstep curve: 3t^2 - 2t^3
          influence = influence * influence * (3 - 2 * influence)
          targetW = minW + (maxW - minW) * influence
        } else {
          targetW = minW
        }

        tickWidths[i] = lerp(tickWidths[i], targetW, LERP_FACTOR)
        tickEl.style.width = `${tickWidths[i].toFixed(1)}px`

        if (influence > 0.05) {
          const alpha =
            colors.edgeA + (colors.activeA - colors.edgeA) * influence
          tickEl.style.background = `rgba(${colors.r},${colors.g},${colors.b},${alpha.toFixed(2)})`
          tickEl.style.height = influence > 0.45 ? '2px' : '1.5px'
        } else {
          tickEl.style.background = major ? colors.major : colors.tick
          tickEl.style.height = '1.5px'
        }
      }

      lastScrollY = currentScrollY
      lastTime = now

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="scroll-indicator" ref={containerRef} aria-hidden="true">
      <div className="scroll-indicator-track">
        {Array.from({ length: TICK_COUNT }, (_, i) => {
          const major = i % MAJOR_EVERY === 0
          return (
            <div
              key={i}
              ref={(el) => {
                tickRefs.current[i] = el
              }}
              className={major ? 'scroll-tick-major' : 'scroll-tick'}
            />
          )
        })}
      </div>
    </div>
  )
}
