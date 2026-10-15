import { useEffect, useRef, useId } from 'react'
import { tsParticles, type Container } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { useTheme, THEME_OPTIONS } from './ThemeProvider'

interface TechParticlesProps {
  id?: string
  className?: string
  particleCount?: number
  interactive?: boolean
}

// Global flag to ensure loadSlim runs once
let slimLoaded = false

export default function TechParticles({
  id: customId,
  className = '',
  particleCount,
  interactive = true,
}: TechParticlesProps) {
  const generatedId = useId().replace(/:/g, '')
  const containerId = customId || `tsparticles-${generatedId}`
  const { palette, isDark } = useTheme()
  const domRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<Container | null>(null)

  // Get active theme accent color
  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]
  const primaryColor = activeTheme.accent

  useEffect(() => {
    let isMounted = true

    const initEngine = async () => {
      if (!slimLoaded) {
        await loadSlim(tsParticles)
        slimLoaded = true
      }

      if (!isMounted || !domRef.current) return

      // Destroy any prior instance before re-loading
      if (containerRef.current) {
        containerRef.current.destroy()
        containerRef.current = null
      }

      const count = particleCount || (window.innerWidth > 1200 ? 115 : window.innerWidth > 768 ? 75 : 45)

      const instance = await tsParticles.load({
        id: containerId,
        element: domRef.current,
        options: {
          fullScreen: { enable: false },
          fpsLimit: 120,
          background: { color: { value: 'transparent' } },
          particles: {
            number: {
              value: count,
              density: {
                enable: true,
                width: 1920,
                height: 1080,
              },
            },
            color: {
              value: isDark 
                ? ['#FFFFFF', '#38BDF8', '#F43F5E', '#FBBF24', '#C084FC', '#34D399']
                : ['#0F172A', '#1E293B', '#334155', '#E11D48', '#2563EB', '#4338CA'],
            },
            shape: {
              type: 'circle',
            },
            opacity: {
              value: { min: isDark ? 0.75 : 0.70, max: isDark ? 1.0 : 0.95 },
              animation: {
                enable: true,
                speed: 1.5,
                sync: false,
              },
            },
            size: {
              value: { min: 3.5, max: 6.2 },
            },
            links: {
              enable: true,
              distance: 175,
              color: isDark ? '#FFFFFF' : '#0F172A',
              opacity: isDark ? 0.65 : 0.52,
              width: 1.8,
              triangles: {
                enable: false,
              },
            },
            move: {
              enable: true,
              speed: 1.1,
              direction: 'none',
              random: true,
              straight: false,
              outModes: {
                default: 'bounce',
              },
            },
          },
          interactivity: {
            detectsOn: 'window',
            events: {
              onHover: {
                enable: interactive,
                mode: 'grab',
              },
              onClick: {
                enable: interactive,
                mode: 'push',
              },
              resize: {
                enable: true,
              },
            },
            modes: {
              grab: {
                distance: 240,
                links: {
                  opacity: 0.95,
                  color: isDark ? '#38BDF8' : '#0F172A',
                },
              },
              push: {
                quantity: 4,
              },
            },
          },
          detectRetina: true,
        },
      })

      if (isMounted) {
        containerRef.current = instance ?? null
      } else {
        instance?.destroy()
      }
    }

    initEngine()

    return () => {
      isMounted = false
      if (containerRef.current) {
        containerRef.current.destroy()
        containerRef.current = null
      }
    }
  }, [containerId, palette, isDark, primaryColor, particleCount, interactive])

  return (
    <div
      ref={domRef}
      id={containerId}
      className={`absolute inset-0 w-full h-full pointer-events-auto z-0 ${className}`}
      style={{ overflow: 'hidden' }}
    />
  )
}
