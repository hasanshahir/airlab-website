import { useState, useEffect, useRef, useCallback } from 'react'
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
    id: 'lab-workstation-1',
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping Laboratory',
    title: 'Research Laboratory',
    subtitle: 'Deep Learning & Neural Systems Cluster',
  },
  {
    id: 'gpu-rig-1',
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'High Performance Neural Computing Rig',
    title: 'Deep Learning Compute',
    subtitle: 'TensorRT & Edge Accelerated GPU Nodes',
  },
  {
    id: 'collaboration-2',
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Interdisciplinary Student Collaboration & ML Pipelines',
    title: 'Collaborative Research',
    subtitle: 'Interdisciplinary Machine Learning Teams',
  },
  {
    id: 'fellows-workstation-2',
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'AIR Lab Research Fellows Station',
    title: 'Frontier AI Fellowship',
    subtitle: 'Nurturing the Next Generation of AI Scientists',
  },
  {
    id: 'csit-entrance',
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT & AIR Lab Entrance',
    title: 'Academic Excellence',
    subtitle: 'Department of CSIT • NED University',
  },
]

interface HeroSkewedCarouselProps {
  slides?: CarouselSlide[]
  autoPlayInterval?: number
  className?: string
}

export default function HeroSkewedCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 4000, // 4 seconds for a brisk, engaging showcase across all 5 images
  className = '',
}: HeroSkewedCarouselProps) {
  // Current active slide index (0 to slides.length - 1)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredOffset, setHoveredOffset] = useState<-1 | 1 | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = slides.length

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024

  // Card spacing & depth
  const cardSpacing = isMobile ? 290 : isTablet ? 375 : 445
  const baseDepth = isMobile ? 48 : isTablet ? 62 : 72
  const yawAngle = isMobile ? 18 : isTablet ? 20 : 21

  const handleNext = useCallback(() => {
    setHoveredOffset(null)
    setActiveIndex(prev => (prev + 1) % total)
  }, [total])

  const handlePrev = useCallback(() => {
    setHoveredOffset(null)
    setActiveIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Autoplay through all 5 images sequentially
  useEffect(() => {
    if (isDragging || total <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isDragging, total, autoPlayInterval, handleNext])

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

  // Calculate circular offset relative to activeIndex (-2, -1, 0, 1, 2)
  const getSlideOffset = (index: number) => {
    let diff = index - activeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

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
      onMouseLeave={() => setHoveredOffset(null)}
    >
      {/* ── 3D INNER-CIRCLE STAGE: EXACTLY 3 CARDS VISIBLE, SMOOTH PERSISTENT NODES ── */}
      <div
        className="relative w-full h-[195px] sm:h-[245px] md:h-[285px] lg:h-[315px] flex items-center justify-center overflow-hidden"
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
          {slides.map((slide, index) => {
            const offset = getSlideOffset(index)
            const isCenter = offset === 0
            const isLeft = offset === -1
            const isRight = offset === 1
            const isVisible = isCenter || isLeft || isRight
            const isHidden = !isVisible // offset is -2, 2 or beyond (0% opacity in buffer)

            const isSideHovered =
              (isLeft && hoveredOffset === -1) || (isRight && hoveredOffset === 1)

            // Coordinates in 3D circular space
            const baseX = offset * cardSpacing
            const baseZ = -Math.abs(offset) * baseDepth
            const baseRotateY = -offset * yawAngle
            const baseScale = isCenter ? 1.0 : isVisible ? 0.94 : 0.84

            // Opacity: ONLY the 3 active cards are visible; buffer cards are strictly 0
            const targetOpacity = isCenter ? 1.0 : isVisible ? 0.88 : 0

            // 3D Hover Displacement on Side Cards Only
            const targetX = baseX + (isSideHovered ? (offset < 0 ? -12 : 12) : 0)
            const targetY = isSideHovered ? -14 : 0
            const targetZ = isSideHovered ? baseZ + 36 : baseZ
            const targetRotateY = isSideHovered ? baseRotateY * 0.75 : baseRotateY
            const targetScale = isSideHovered ? baseScale + 0.04 : baseScale

            const zIndex = isCenter ? 30 : isVisible ? 20 : 1

            return (
              <motion.div
                // PERSISTENT KEY ensures smooth motion between slots instead of re-mounting!
                key={slide.id}
                onMouseEnter={() => {
                  if (isLeft) setHoveredOffset(-1)
                  else if (isRight) setHoveredOffset(1)
                }}
                onMouseLeave={() => setHoveredOffset(null)}
                onClick={() => {
                  if (isLeft) handlePrev()
                  else if (isRight) handleNext()
                }}
                animate={{
                  x: targetX,
                  y: targetY,
                  z: targetZ,
                  rotateY: targetRotateY,
                  scale: targetScale,
                  opacity: targetOpacity,
                }}
                // Silky smooth transition for visible slides; instant relocation for the hidden buffer slide
                transition={
                  isHidden
                    ? { duration: 0 } // Jumps silently in the dark with opacity: 0 without flying across!
                    : {
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1], // Smooth seamless cubic-bezier glide
                      }
                }
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
                className={`absolute w-[280px] sm:w-[360px] md:w-[410px] lg:w-[440px] h-[175px] sm:h-[225px] md:h-[255px] lg:h-[275px] rounded-none cursor-pointer overflow-hidden transition-colors duration-300 ${
                  isCenter
                    ? 'border-2 border-[var(--accent-orange)] shadow-2xl'
                    : isSideHovered
                    ? 'border-2 border-[var(--accent-orange)] shadow-xl brightness-105'
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

        {/* Edge gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--bg-page)] to-transparent z-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--bg-page)] to-transparent z-40" />
      </div>

      {/* ── COMPACT BOTTOM CONTROLS (ALWAYS VISIBLE & TIED TO ALL 5 SLIDES) ── */}
      <div className="mt-4 sm:mt-5 flex flex-col items-center justify-center gap-2.5 z-30">
        {/* Explore More Button with Circular Dashed Arrow */}
        <button
          type="button"
          onClick={scrollToExplore}
          className="group flex flex-col items-center gap-1.5 text-center text-xs sm:text-sm font-sans font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <span className="tracking-wide">Explore More</span>
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--border-hairline-dark)] group-hover:border-[var(--accent-orange)] text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] flex items-center justify-center transition-all duration-300 group-hover:translate-y-0.5">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Minimalist Navigation Controls across all 5 slides */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-hairline)] shadow-xs">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-6.5 h-6.5 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-2xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* 5 Dots Indicator: 1 for each slide in total */}
          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setHoveredOffset(null)
                  setActiveIndex(i)
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
            className="w-6.5 h-6.5 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-2xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
