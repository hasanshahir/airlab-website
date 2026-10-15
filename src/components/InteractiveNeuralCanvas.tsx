import { useEffect, useRef } from 'react'
import { useTheme, THEME_OPTIONS } from './ThemeProvider'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
  radius: number
  phase: number
  pulseSpeed: number
  energy: number
}

interface SynapticPulse {
  fromIndex: number
  toIndex: number
  progress: number
  speed: number
  color: string
}

export default function InteractiveNeuralCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { palette, isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Palette-derived colors
    const currentTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]
    const primaryColor = currentTheme.accent
    const secondaryColor = currentTheme.subAccent

    const hexToRgb = (hex: string) => {
      const sanitized = hex.replace('#', '')
      const bigint = parseInt(sanitized, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return { r, g, b }
    }

    const rgbPrimary = hexToRgb(primaryColor)
    const rgbSecondary = hexToRgb(secondaryColor)

    const mouse = {
      x: -9999,
      y: -9999,
      isHovering: false,
      radius: 220,
    }

    const resize = () => {
      const parent = canvas.parentElement || document.body
      width = parent.clientWidth
      height = parent.clientHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Spawn particles scaled to viewport size
    const particleDensity = width > 1200 ? 90 : width > 768 ? 65 : 40
    const particles: Particle[] = []

    for (let i = 0; i < particleDensity; i++) {
      const baseRadius = Math.random() * 2 + 1.2
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        baseRadius,
        radius: baseRadius,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        energy: Math.random(),
      })
    }

    // Synaptic pulses that travel along node connections
    const pulses: SynapticPulse[] = []
    const MAX_PULSES = 18

    // Pointer events
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.isHovering = true
    }

    const onMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
      mouse.isHovering = false
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Shockwave push on click
      particles.forEach(p => {
        const dx = p.x - clickX
        const dy = p.y - clickY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 300 && dist > 0) {
          const force = (300 - dist) / 15
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('click', onClick)

    const MAX_DISTANCE = width > 768 ? 140 : 100

    let tick = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      tick++

      // Maybe spawn a synaptic pulse
      if (tick % 24 === 0 && pulses.length < MAX_PULSES && particles.length > 5) {
        const i = Math.floor(Math.random() * particles.length)
        // Find a nearby node
        for (let j = 0; j < particles.length; j++) {
          if (i === j) continue
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DISTANCE) {
            pulses.push({
              fromIndex: i,
              toIndex: j,
              progress: 0,
              speed: 0.015 + Math.random() * 0.025,
              color: Math.random() > 0.5 ? primaryColor : secondaryColor,
            })
            break
          }
        }
      }

      // Update & Draw Synaptic Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MAX_DISTANCE) {
            const alpha = (1 - dist / MAX_DISTANCE) * (isDark ? 0.38 : 0.22)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, ${alpha})`
            ctx.lineWidth = (1 - dist / MAX_DISTANCE) * 1.5
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }

        // Mouse magnetic connection & interactive tension
        if (mouse.isHovering) {
          const mdx = p1.x - mouse.x
          const mdy = p1.y - mouse.y
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy)

          if (mDist < mouse.radius && mDist > 0) {
            // Gravitational pull toward mouse
            const pullForce = (mouse.radius - mDist) / mouse.radius
            p1.x -= (mdx / mDist) * pullForce * 1.8
            p1.y -= (mdy / mDist) * pullForce * 1.8

            // Glowing synaptic filament connecting to mouse
            const mouseAlpha = (1 - mDist / mouse.radius) * (isDark ? 0.65 : 0.45)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${rgbSecondary.r}, ${rgbSecondary.g}, ${rgbSecondary.b}, ${mouseAlpha})`
            ctx.lineWidth = (1 - mDist / mouse.radius) * 2.2
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      // Update & Draw Synaptic Pulses (packets flowing along lines)
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k]
        pulse.progress += pulse.speed

        if (pulse.progress >= 1) {
          pulses.splice(k, 1)
          continue
        }

        const pA = particles[pulse.fromIndex]
        const pB = particles[pulse.toIndex]

        if (!pA || !pB) {
          pulses.splice(k, 1)
          continue
        }

        const px = pA.x + (pB.x - pA.x) * pulse.progress
        const py = pA.y + (pB.y - pA.y) * pulse.progress

        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pulse.color
        ctx.shadowColor = pulse.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Update & Draw Nodes
      particles.forEach((p, idx) => {
        p.phase += p.pulseSpeed
        p.radius = p.baseRadius + Math.sin(p.phase) * 0.8

        p.x += p.vx
        p.y += p.vy

        // Dampen velocity back to normal if pushed by shockwave
        p.vx *= 0.985
        p.vy *= 0.985

        // Boundary bounce with slight padding
        if (p.x < 0) {
          p.x = 0
          p.vx = Math.abs(p.vx)
        } else if (p.x > width) {
          p.x = width
          p.vx = -Math.abs(p.vx)
        }

        if (p.y < 0) {
          p.y = 0
          p.vy = Math.abs(p.vy)
        } else if (p.y > height) {
          p.y = height
          p.vy = -Math.abs(p.vy)
        }

        // Draw node aura
        const nodeColor = idx % 3 === 0 ? rgbSecondary : rgbPrimary

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${isDark ? 0.9 : 0.8})`
        ctx.fill()

        // Outer glow on larger nodes
        if (p.baseRadius > 2.2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${isDark ? 0.15 : 0.08})`
          ctx.fill()
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('click', onClick)
      cancelAnimationFrame(animId)
    }
  }, [palette, isDark])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto z-0 ${className}`}
      style={{ touchAction: 'none' }}
    />
  )
}
