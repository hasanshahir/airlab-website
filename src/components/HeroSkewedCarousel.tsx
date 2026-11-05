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
  autoPlayInterval = 7000, // Increased to 7 seconds for smoother, relaxed viewing
  className = '',
}: HeroSkewedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredSideIndex, setHoveredSideIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cardSpacing, setCardSpacing] = useState(445)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = slides.length

  // Responsive card spacing calculation
  useEffect(() => {
    const updateSpacing = () => {
      const w = window.innerWidth
      if (w < 640) {
        setCardSpacing(285)
      } else if (w < 1024) {
        setCardSpacing(375)
      } else {
        setCardSpacing(445)
      }
    }
    updateSpacing()
    window.addEventListener('resize', updateSpacing)
    return () => window.removeEventListener('resize', updateSpacing)
  }, [])

  const handleNext = useCallback(() => {
    setHoveredSideIndex(null)
    setCurrentIndex(prev => (prev + 1) % total)
  }, [total])

  const handlePrev = useCallback(() => {
    setHoveredSideIndex(null)
    setCurrentIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Autoplay loop (smooth 7-second rotation)
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
    if (info.offset.x < -threshold || info.velocity.x < -350) {
      handleNext()
    } else if (info.offset.x > threshold || info.velocity.x > 350) {
      handlePrev()
    }
  }

  // Circular offset relative to currentIndex (-2 to +2)
  const getOffset = (index: number) => {
    let diff = index - currentIndex
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredSideIndex(null)
      }}
    >
      {/* ── 3D CURVED PANORAMIC STAGE ── */}
      <div
        className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px] flex items-center justify-center overflow-visible"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {slides.map((slide, index) => {
            const offset = getOffset(index)
            const isCenter = offset === 0
            const isVisible = Math.abs(offset) <= 2.2

            if (!isVisible) return null

            const isSideHovered = !isCenter && hoveredSideIndex === index

            // ── Depth & Coordinate Math ──
            // Center card sits at z = 0 (foreground).
            // Side cards sit BEHIND at z < 0.
            // This guarantees side cards rotate from behind and never cut across/above other cards!
            const baseZ = -Math.abs(offset) * (cardSpacing < 350 ? 50 : 75)
            const baseY = 0
            const baseRotateY = -offset * (cardSpacing < 350 ? 17 : 20)
            const baseScale = isCenter ? 1.0 : 0.94 - Math.abs(offset) * 0.03
            const opacity = isCenter ? 1.0 : Math.abs(offset) <= 1 ? 0.95 : 0.8

            // ── Side Card 3D Hover Displacement (Only on side cards, NOT on center) ──
            const targetX = offset * cardSpacing + (isSideHovered ? (offset < 0 ? -10 : 10) : 0)
            const targetY = isSideHovered ? -16 : baseY // lifts up on hover
            const targetZ = isSideHovered ? baseZ + 40 : baseZ // floats forward in 3D
            const targetRotateY = isSideHovered ? baseRotateY * 0.7 : baseRotateY // faces viewer slightly more
            const targetScale = isSideHovered ? baseScale + 0.05 : baseScale

            // High zIndex on center card ensures clean initial render, with smooth 3D depth
            const zIndex = isCenter ? 30 : 20 - Math.abs(offset) * 5

            return (
              <motion.div
                key={slide.id}
                onMouseEnter={() => {
                  if (!isCenter) setHoveredSideIndex(index)
                }}
                onMouseLeave={() => {
                  if (hoveredSideIndex === index) setHoveredSideIndex(null)
                }}
                onClick={() => {
                  if (!isCenter) {
                    setHoveredSideIndex(null)
                    setCurrentIndex(index)
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
                  type: 'spring',
                  stiffness: 145, // Silky smooth, relaxed glide
                  damping: 24,
                  mass: 0.9,
                }}
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                className={`absolute w-[280px] sm:w-[370px] md:w-[430px] lg:w-[455px] h-[180px] sm:h-[235px] md:h-[270px] lg:h-[285px] rounded-none cursor-pointer overflow-hidden transition-all duration-300 ${
                  isCenter
                    ? 'border-2 border-[var(--accent-orange)] shadow-[0_0_28px_rgba(240,106,31,0.35),0_20px_50px_rgba(0,0,0,0.3)]'
                    : isSideHovered
                    ? 'border-2 border-[var(--accent-orange)] shadow-[0_0_22px_rgba(240,106,31,0.5),0_15px_35px_rgba(0,0,0,0.25)] brightness-105'
                    : 'border border-[var(--accent-orange)]/55 hover:border-[var(--accent-orange)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] hover:brightness-105'
                }`}
              >
                {/* 100% PURE, CLEAN RECTANGULAR PHOTOGRAPH WITH ORANGE ACCENTS */}
                <div className="w-full h-full relative overflow-hidden bg-[var(--surface-alt)] rounded-none">
                  <img
                    src={slide.src}
                    alt={slide.alt || 'AIR Lab'}
                    className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out hover:scale-103 rounded-none"
                    draggable={false}
                    loading="lazy"
                  />

                  {/* Corner Accent Hairlines for Engineering / Lab aesthetic */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-orange)] pointer-events-none" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-orange)] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-orange)] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-orange)] pointer-events-none" />

                  {/* Subtle hover prompt on side cards */}
                  {isSideHovered && (
                    <div className="absolute inset-0 bg-black/15 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                      <span className="px-3 py-1 bg-black/75 text-[var(--accent-orange)] text-[11px] font-mono font-semibold tracking-wider rounded-none border border-[var(--accent-orange)]/80 shadow-md backdrop-blur-xs">
                        CLICK TO FOCUS
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── VIDEO REFERENCE BOTTOM CONTROLS: "Explore More" + Dashed Arrow Indicator ── */}
      <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 z-30">
        {/* Explore More Button with Circular Dashed Arrow (Matching carousel video.mp4) */}
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
                  setHoveredSideIndex(null)
                  setCurrentIndex(i)
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === i
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
