import { useEffect, useRef } from 'react'

interface NeuralRayBurstProps {
  className?: string
  accentColor?: string
}

export default function NeuralRayBurst({
  className = '',
  accentColor = '#F04E1F',
}: NeuralRayBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio)
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(canvas)

    // Mouse coordinates (normalized -1 to 1)
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      targetMouseX = (x - 0.5) * 2
      targetMouseY = (y - 0.5) * 2
    }

    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', onMouseMove)
      parent.addEventListener('mouseleave', () => {
        targetMouseX = 0
        targetMouseY = 0
      })
    }

    // Particle / Ray system setup
    const RAY_COUNT = 90
    interface RayParticle {
      angle: number // Angle in radians
      speed: number
      distance: number // 0 to 1
      size: number
      alpha: number
      pulseSpeed: number
      color: string
    }

    const particles: RayParticle[] = []
    const colors = ['#FFFFFF', '#F04E1F', '#6B3FE6', '#C5B9CE', '#FAFAFB']

    for (let i = 0; i < RAY_COUNT; i++) {
      // Fan angle between 20 deg and 160 deg (downwards)
      const baseAngle = (Math.PI / 180) * (30 + Math.random() * 120)
      particles.push({
        angle: baseAngle,
        speed: 0.0015 + Math.random() * 0.0035,
        distance: Math.random(),
        size: Math.random() > 0.85 ? 2.5 : Math.random() > 0.5 ? 1.6 : 1.0,
        alpha: 0.2 + Math.random() * 0.8,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Static background beam lines
    const BEAM_LINES = 45
    const beamAngles: { angle: number; opacity: number; length: number }[] = []
    for (let i = 0; i < BEAM_LINES; i++) {
      beamAngles.push({
        angle: (Math.PI / 180) * (25 + (i / BEAM_LINES) * 130 + (Math.random() - 0.5) * 4),
        opacity: 0.06 + Math.random() * 0.16,
        length: 0.65 + Math.random() * 0.35,
      })
    }

    let time = 0

    const render = () => {
      time += 0.02
      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      ctx.clearRect(0, 0, width, height)

      // Focal origin (emanates from top center, tilting subtly with mouse)
      const originX = width * (0.5 + mouseX * 0.08)
      const originY = height * (0.05 + mouseY * 0.04)
      const maxRadius = Math.sqrt(width * width + height * height)

      // Draw faint radiant cone rays
      ctx.lineWidth = 1 * window.devicePixelRatio
      beamAngles.forEach(beam => {
        const angle = beam.angle + mouseX * 0.08
        const endX = originX + Math.cos(angle) * maxRadius * beam.length
        const endY = originY + Math.sin(angle) * maxRadius * beam.length

        const grad = ctx.createLinearGradient(originX, originY, endX, endY)
        grad.addColorStop(0, 'rgba(240, 78, 31, 0.40)')
        grad.addColorStop(0.15, `rgba(255, 255, 255, ${beam.opacity})`)
        grad.addColorStop(0.7, `rgba(107, 63, 230, ${beam.opacity * 0.3})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(originX, originY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      })

      // Draw moving radiant particles along trajectories
      particles.forEach(p => {
        p.distance += p.speed
        if (p.distance > 1) {
          p.distance = 0
          p.angle = (Math.PI / 180) * (30 + Math.random() * 120)
        }

        const currentAngle = p.angle + mouseX * 0.08
        const dist = p.distance * maxRadius * 0.95
        const px = originX + Math.cos(currentAngle) * dist
        const py = originY + Math.sin(currentAngle) * dist

        // Pulsing opacity
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + p.distance * 10)
        const currentAlpha = p.alpha * pulse * (1 - p.distance * 0.7)

        // Draw particle glow
        ctx.fillStyle = p.color === '#F04E1F' 
          ? `rgba(240, 78, 31, ${currentAlpha})` 
          : p.color === '#6B3FE6'
          ? `rgba(107, 63, 230, ${currentAlpha})`
          : `rgba(255, 255, 255, ${currentAlpha})`

        ctx.beginPath()
        ctx.arc(px, py, p.size * window.devicePixelRatio, 0, Math.PI * 2)
        ctx.fill()

        // Occasional connecting spark between close particles
        if (p.size > 2.0) {
          ctx.shadowColor = accentColor
          ctx.shadowBlur = 10 * window.devicePixelRatio
        } else {
          ctx.shadowBlur = 0
        }
      })

      // Central focal glow orb
      const focalGrad = ctx.createRadialGradient(
        originX, originY, 0,
        originX, originY, 80 * window.devicePixelRatio
      )
      focalGrad.addColorStop(0, 'rgba(240, 78, 31, 0.65)')
      focalGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)')
      focalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = focalGrad
      ctx.beginPath()
      ctx.arc(originX, originY, 80 * window.devicePixelRatio, 0, Math.PI * 2)
      ctx.fill()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      ro.disconnect()
      if (parent) {
        parent.removeEventListener('mousemove', onMouseMove)
      }
    }
  }, [accentColor])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none ${className}`}
    />
  )
}
