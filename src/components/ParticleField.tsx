import React, { useEffect, useRef } from 'react'

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

    // Reference palette: Vivid Red-Orange (#F04E1F), Electric Violet (#6B3FE6), Muted Mauve
    const colorPalette = [
      'rgba(240, 78, 31, ',    // Vivid red-orange #F04E1F
      'rgba(107, 63, 230, ',   // Electric violet #6B3FE6
      'rgba(197, 185, 206, ',  // Muted mauve #C5B9CE
      'rgba(240, 78, 31, ',    // Orange accent
      'rgba(107, 63, 230, ',   // Purple accent
    ]

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
      const count = isMobile ? 30 : 65

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: Math.random() * 1.5 + 1.6,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        })
      }
    }

    window.addEventListener('resize', resize)
    resize()

    const animate = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const mouse = mousePosRef.current

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        // Bounce off canvas edges
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse attraction physics
        if (mouse) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < 200 && dist > 1) {
            const force = (200 - dist) / 200
            p.x -= (dx / dist) * force * 1.3
            p.y -= (dy / dist) * force * 1.3
          }
        }

        // Draw particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color + '0.55)'
        ctx.fill()
      }

      // Draw particle-to-particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.22
            ctx.beginPath()
            ctx.strokeStyle = `rgba(107, 63, 230, ${alpha.toFixed(3)})`
            ctx.lineWidth = 0.8
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

          if (mDist < 180) {
            const alpha = (1 - mDist / 180) * 0.45
            ctx.beginPath()
            ctx.strokeStyle = `rgba(240, 78, 31, ${alpha.toFixed(3)})`
            ctx.lineWidth = 1.0
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

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
