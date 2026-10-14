import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  radius: number
  color: string
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let w = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
    let h = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight

    const mouse = { x: -2000, y: -2000 }
    const COLORS = ['#1A6BFF', '#FF4D4F', '#FFAB00', '#7C3AED']

    const onResize = () => {
      if (!canvas.parentElement) return
      w = canvas.width = canvas.parentElement.clientWidth
      h = canvas.height = canvas.parentElement.clientHeight
    }
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -2000; mouse.y = -2000 }

    window.addEventListener('resize', onResize)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    const count = Math.min(75, Math.floor((w * h) / 14000))
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(26,107,255,${(1 - d / 130) * 0.18})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      // Particles
      particles.forEach(p => {
        // Mouse magnetic pull
        const mdx = mouse.x - p.x
        const mdy = mouse.y - p.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < 160 && md > 0) {
          const f = (160 - md) / 160
          p.x += (mdx / md) * f * 1.8
          p.y += (mdy / md) * f * 1.8
        }

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
    />
  )
}
