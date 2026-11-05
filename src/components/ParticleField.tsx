import React, { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

interface ParticleNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const { activeTheme } = useTheme()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mousePosRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let animationFrameId: number
    let particles: ParticleNode[] = []

    const colorPalette = activeTheme.particleColors
    const nodeLineColor = activeTheme.lineColor
    const mouseLineColor = activeTheme.mouseLineColor

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const isMobile = width < 768
      const count = isMobile ? 38 : 78

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: Math.random() * 1.8 + 1.8,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const mouse = mousePosRef.current

      // Update and draw particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        // Wrap around boundaries
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Gentle mouse interaction (flee / drift)
        if (mouse) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < 130 && dist > 0) {
            const force = (130 - dist) / 130
            p.x += (dx / dist) * force * 1.6
            p.y += (dy / dist) * force * 1.6
          }
        }

        // Outer node glow / disc
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0.65)`
        ctx.fill()

        // Inner solid core for sharp visibility on pure white canvas
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 0.55, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0.95)`
        ctx.fill()
      }

      // Draw particle-to-particle connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < 145) {
            const alpha = (1 - dist / 145) * 0.32
            ctx.beginPath()
            ctx.strokeStyle = `${nodeLineColor}${alpha.toFixed(3)})`
            ctx.lineWidth = 1.05
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Draw interactive connection line to mouse cursor
        if (mouse) {
          const mdx = particles[i].x - mouse.x
          const mdy = particles[i].y - mouse.y
          const mDist = Math.hypot(mdx, mdy)

          if (mDist < 190) {
            const alpha = (1 - mDist / 190) * 0.52
            ctx.beginPath()
            ctx.strokeStyle = `${mouseLineColor}${alpha.toFixed(3)})`
            ctx.lineWidth = 1.35
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      ctx.restore()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [activeTheme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none block"
      style={{
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  )
}

export default ParticleField
