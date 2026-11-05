import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react'

export interface CarouselSlide {
  id: string
  src: string
  alt: string
  title?: string
  subtitle?: string
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 'lab-workstation',
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping Laboratory',
    title: 'Research Laboratory',
    subtitle: 'Deep Learning & Neural Systems Cluster',
  },
  {
    id: 'team-collaboration',
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'Collaborative AI Research at NED CSIT',
    title: 'Collaborative Research',
    subtitle: 'Interdisciplinary Machine Learning Teams',
  },
  {
    id: 'gpu-rig',
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Autonomous Robotics & High Performance Compute',
    title: 'High Performance Compute',
    subtitle: 'TensorRT & Edge Accelerated GPU Nodes',
  },
  {
    id: 'fellows-workstation',
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'Research Fellows & Student Innovators',
    title: 'Frontier AI Fellowship',
    subtitle: 'Nurturing the Next Generation of AI Scientists',
  },
  {
    id: 'csit-entrance',
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT, NED University of Engineering & Technology',
    title: 'Academic Excellence',
    subtitle: 'Department of CSIT &bull; NED University',
  },
]

interface HeroSkewedCarouselProps {
  slides?: CarouselSlide[]
  autoPlayInterval?: number
  className?: string
}

export default function HeroSkewedCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 7000,
  className = '',
}: HeroSkewedCarouselProps) {
  // Continuous rotational slot position
  const [position, setPosition] = useState(0)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = slides.length

  // Track window width for responsive circle radius & spacing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024

  const radius = isMobile ? 540 : isTablet ? 720 : 860
  const angleStep = isMobile ? 32 : isTablet ? 29 : 27 // degrees per card slot

  const activeIndex = useMemo(() => {
    return ((position % total) + total) % total
  }, [position, total])

  const handleNext = useCallback(() => {
    setHoveredSlot(null)
    setPosition(prev => prev + 1)
  }, [])

  const handlePrev = useCallback(() => {
    setHoveredSlot(null)
    setPosition(prev => prev - 1)
  }, [])

  // Autoplay loop
  useEffect(() => {
    if (isHovered || isDragging || total <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isHovered, isDragging, total, autoPlayInterval, handleNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  // Drag Gesture Handling
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 35
    if (info.offset.x < -threshold || info.velocity.x < -300) {
      handleNext()
    } else if (info.offset.x > threshold || info.velocity.x > 300) {
      handlePrev()
    }
  }

  // Pre-render visible slots around current position
  const visibleSlots = useMemo(() => {
    const centerSlot = position
    const slots = []
    for (let k = centerSlot - 3; k <= centerSlot + 3; k++) {
      slots.push(k)
    }
    return slots
  }, [position])

  const scrollToExplore = () => {
    const el = document.getElementById('explore-anchor') || document.getElementById('about-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollBy({ top: 480, behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none flex flex-col items-center justify-center overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredSlot(null)
      }}
    >
      {/* ── 3D SPINNING INNER-CIRCLE STAGE WITH ZERO-WRAP FADE ── */}
      <div
        className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px] flex items-center justify-center overflow-hidden"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {visibleSlots.map((slot) => {
            const offset = slot - position // 0 is center, -1 is left, +1 is right
            const isCenter = offset === 0
            const absOffset = Math.abs(offset)

            // Strict visibility cutoff: beyond 1.8 slots, cards fade completely into nothing
            if (absOffset > 2.2) return null

            const slideIndex = ((slot % total) + total) % total
            const slide = slides[slideIndex]

            const isSideHovered = !isCenter && hoveredSlot === slot

            // ── Inner Part of a Circle Spinning Math ──
            const angleDeg = offset * angleStep
            const angleRad = (angleDeg * Math.PI) / 180

            const baseX = radius * Math.sin(angleRad)
            const baseZ = -radius * (1 - Math.cos(angleRad))
            const baseRotateY = -angleDeg
            const baseScale = isCenter ? 1.0 : Math.max(0.85, 0.96 - absOffset * 0.05)

            // ── "FADE INTO NOTHING & COME FROM NOTHING" OPACITY FORMULA ──
            // Center is 1.0, adjacent card (1.0) is 0.85, then rapidly dissolves to 0 as it exits
            let opacity = 0
            if (absOffset <= 0.2) {
              opacity = 1.0
            } else if (absOffset <= 1.0) {
              opacity = 1.0 - (absOffset - 0.2) * 0.18 // ~0.85 at offset 1
            } else if (absOffset <= 1.7) {
              // Rapid smooth dissolve to 0 at offset 1.7
              opacity = Math.max(0, 0.85 * (1 - (absOffset - 1.0) / 0.7))
            } else {
              opacity = 0
            }

            // 3D Hover Displacement on Side Cards Only
            const targetX = baseX + (isSideHovered ? (offset < 0 ? -12 : 12) : 0)
            const targetY = isSideHovered ? -16 : 0
            const targetZ = isSideHovered ? baseZ + 36 : baseZ
            const targetRotateY = isSideHovered ? baseRotateY * 0.75 : baseRotateY
            const targetScale = isSideHovered ? baseScale + 0.04 : baseScale

            const zIndex = isCenter ? 30 : Math.max(1, Math.round(20 - absOffset * 8))

            return (
              <motion.div
                key={`slot-${slot}`}
                onMouseEnter={() => {
                  if (!isCenter && opacity > 0.3) setHoveredSlot(slot)
                }}
                onMouseLeave={() => {
                  if (hoveredSlot === slot) setHoveredSlot(null)
                }}
                onClick={() => {
                  if (!isCenter && opacity > 0.3) {
                    setHoveredSlot(null)
                    setPosition(slot)
                  }
                }}
                animate={{
                  x: targetX,
                  y: targetY,
                  z: targetZ,
                  rotateY: targetRotateY,
                  scale: targetScale,
                  opacity,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1], // Buttery smooth ease-out (no acceleration hiccup)
                }}
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  pointerEvents: opacity < 0.2 ? 'none' : 'auto',
                }}
                className={`absolute w-[280px] sm:w-[370px] md:w-[430px] lg:w-[455px] h-[180px] sm:h-[235px] md:h-[270px] lg:h-[285px] rounded-none cursor-pointer overflow-hidden transition-colors duration-300 ${
                  isCenter
                    ? 'border-2 border-[var(--accent-orange)] shadow-2xl'
                    : isSideHovered
                    ? 'border-2 border-[var(--accent-orange)] shadow-xl'
                    : 'border border-[var(--accent-orange)]/60 hover:border-[var(--accent-orange)] shadow-lg'
                }`}
              >
                {/* 100% PURE RECTANGULAR PHOTOGRAPH WITH CRISP SOLID ORANGE OUTLINE */}
                <div className="w-full h-full relative overflow-hidden bg-[var(--surface-alt)] rounded-none">
                  <img
                    src={slide.src}
                    alt={slide.alt || 'AIR Lab'}
                    className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out hover:scale-103 rounded-none"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Soft edge fade masks on sides to ensure complete dissolve into nothingness */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--bg-page)] to-transparent z-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--bg-page)] to-transparent z-40" />
      </div>

      {/* ── BOTTOM CONTROLS: "Explore More" + Dashed Arrow Indicator ── */}
      <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 z-30">
        {/* Explore More Button with Circular Dashed Arrow */}
        <button
          type="button"
          onClick={scrollToExplore}
          className="group flex flex-col items-center gap-2 text-center text-xs sm:text-sm font-sans font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <span className="tracking-wide">Explore More</span>
          <div className="w-9 h-9 rounded-full border-2 border-dashed border-[var(--border-hairline-dark)] group-hover:border-[var(--accent-orange)] text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] flex items-center justify-center transition-all duration-300 group-hover:translate-y-1">
            <ArrowDown className="w-4 h-4" />
          </div>
        </button>

        {/* Minimalist Slide Navigation Controls */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-hairline)] shadow-xs">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-7 h-7 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-2xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setHoveredSlot(null)
                  const currentMod = ((position % total) + total) % total
                  let diff = i - currentMod
                  if (diff > total / 2) diff -= total
                  if (diff < -total / 2) diff += total
                  setPosition(prev => prev + diff)
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? 'w-5 bg-[var(--accent-orange)]'
                    : 'w-1.5 bg-[var(--border-hairline-dark)] hover:bg-[var(--accent-orange)]/50'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="w-7 h-7 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-2xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
