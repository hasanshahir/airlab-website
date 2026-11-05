import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react'

export interface CarouselSlide {
  id: string
  type: 'typography' | 'image'
  src?: string
  alt?: string
  title?: string
  caption?: string
  tag?: string
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-typography',
    type: 'typography',
    tag: 'ORIGIN & VISION',
    title: 'AIR LAB',
    caption: 'Artificial Intelligence Research Laboratory',
  },
  {
    id: 'slide-1',
    type: 'image',
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping',
    title: 'Deep Learning Cluster',
    caption: 'Frontier AI Research & Prototyping Laboratory',
    tag: 'RESEARCH LAB',
  },
  {
    id: 'slide-2',
    type: 'image',
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'Team Collaboration at NED CSIT',
    title: 'Interdisciplinary Teams',
    caption: 'Collaborative Neural & Machine Learning Systems',
    tag: 'COLLABORATION',
  },
  {
    id: 'slide-3',
    type: 'image',
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Autonomous Robotics & Edge AI',
    title: 'Autonomous Robotics',
    caption: 'Real-Time Edge Perception & Spatial Odometry',
    tag: 'EDGE AI & ROBOTICS',
  },
  {
    id: 'slide-4',
    type: 'image',
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'Student Researchers & Innovators',
    title: 'Research Fellows',
    caption: 'Nurturing the Next Generation of AI Scientists',
    tag: 'FELLOWSHIPS',
  },
  {
    id: 'slide-5',
    type: 'image',
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT, NED University',
    title: 'Academic Excellence',
    caption: 'Department of CSIT &bull; NED University of Engineering & Technology',
    tag: 'CAMPUS & LEGACY',
  },
]

interface HeroSkewedCarouselProps {
  slides?: CarouselSlide[]
  autoPlayInterval?: number
  className?: string
}

export default function HeroSkewedCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 4500,
  className = '',
}: HeroSkewedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = slides.length

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total)
  }, [total])

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Autoplay loop
  useEffect(() => {
    if (isHovered || total <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isHovered, total, autoPlayInterval, handleNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  // Drag Gesture Handling with threshold
  const handleDragEnd = (_: any, info: any) => {
    const threshold = 35
    if (info.offset.x < -threshold) {
      handleNext()
    } else if (info.offset.x > threshold) {
      handlePrev()
    }
  }

  // Circular offset relative to currentIndex
  const getOffset = (index: number) => {
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none flex flex-col items-center justify-center overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 3D CURVED PANORAMIC CYLINDRICAL STAGE ── */}
      <div
        className="relative w-full max-w-[1440px] h-[280px] sm:h-[350px] md:h-[390px] flex items-center justify-center overflow-visible"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 65%',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {slides.map((slide, index) => {
            const offset = getOffset(index)
            const isCenter = offset === 0
            const isVisible = Math.abs(offset) <= 2.2

            if (!isVisible) return null

            // Exact Curved Arc Filmstrip Math matching carousel video.mp4
            const cardSpacing = 410 // px width + gap
            const x = offset * cardSpacing
            const z = -Math.abs(offset) * 85
            const rotateY = -offset * 20 // angles inward toward the viewer
            const rotateZ = offset * 3.4 // tilts along the concave horizon
            const y = -Math.abs(offset) * 14 // concave arc rising at edges
            const scale = isCenter ? 1.0 : 0.96 - Math.abs(offset) * 0.03
            const opacity = isCenter ? 1.0 : Math.abs(offset) <= 1 ? 0.94 : 0.72
            const zIndex = 30 - Math.abs(offset) * 10

            return (
              <motion.div
                key={slide.id}
                onClick={() => {
                  if (!isCenter) setCurrentIndex(index)
                }}
                animate={{
                  x,
                  y,
                  z,
                  rotateY,
                  rotateZ,
                  scale,
                  opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 28,
                  mass: 0.8,
                }}
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                }}
                className={`absolute w-[330px] sm:w-[410px] md:w-[460px] h-[210px] sm:h-[260px] md:h-[295px] rounded-2xl sm:rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 ${
                  isCenter
                    ? 'shadow-[0_20px_50px_-8px_rgba(0,0,0,0.35)] ring-2 ring-[var(--accent-orange)]/60'
                    : 'shadow-[0_12px_30px_rgba(0,0,0,0.22)] hover:ring-1 hover:ring-[var(--accent-orange)]/40 hover:brightness-105'
                }`}
              >
                {/* SLIDE TYPE 1: SLEEK AIR LAB TYPOGRAPHY SHOWCASE */}
                {slide.type === 'typography' ? (
                  <div className="w-full h-full relative p-6 sm:p-7 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#071610] via-[#0c271c] to-[#040e0a] text-white border border-[var(--accent-orange)]/40 rounded-2xl sm:rounded-3xl group">
                    {/* Ambient Radial Glow */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--accent-orange)]/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#74C69D]/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Precision Matrix Dots */}
                    <div
                      className="absolute inset-0 opacity-[0.08] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)`,
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Top Row: Lab Telemetry Badge */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--accent-cyan)]">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                        AIR-LAB // 2026
                      </span>
                      <span className="text-white/60 text-[10px]">EST. 2019</span>
                    </div>

                    {/* Centerpiece Typography Monogram */}
                    <div className="relative z-10 my-auto">
                      <div className="text-[10px] font-mono tracking-[0.25em] text-[var(--accent-orange)] uppercase font-semibold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        <span>FRONTIER AI RESEARCH</span>
                      </div>

                      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-head tracking-tight text-white leading-none">
                        AIR
                        <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent-cyan)] to-[var(--accent-orange)]">
                          LAB
                        </span>
                      </h2>

                      <p className="text-xs sm:text-sm font-sans font-medium text-white/85 mt-2 max-w-sm">
                        Artificial Intelligence Research Laboratory
                      </p>
                    </div>

                    {/* Bottom Row: Affiliation */}
                    <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-sans">
                      <span className="text-white font-semibold">NED University &bull; CSIT</span>
                      <ArrowUpRight className="w-4 h-4 text-[var(--accent-orange)]" />
                    </div>
                  </div>
                ) : (
                  /* SLIDE TYPE 2: HIGH-RES LANDSCAPE PHOTOGRAPH */
                  <div className="w-full h-full relative group overflow-hidden">
                    <img
                      src={slide.src}
                      alt={slide.alt || 'AIR Lab'}
                      className="w-full h-full object-cover rounded-2xl sm:rounded-3xl group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Subtle Scrim for Clean Photo Display */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left text-white">
                      {slide.tag && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[var(--accent-orange)] text-white mb-1.5 shadow-xs">
                          {slide.tag}
                        </span>
                      )}
                      {slide.title && (
                        <h3 className="text-base sm:text-lg font-bold font-head leading-snug text-white drop-shadow-md">
                          {slide.title}
                        </h3>
                      )}
                      {slide.caption && (
                        <p className="text-[11px] sm:text-xs text-white/80 font-sans line-clamp-1 mt-0.5">
                          {slide.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── MINIMALIST CONTROLS BELOW ── */}
      <div className="mt-5 sm:mt-6 flex items-center justify-center gap-3 z-30">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-hairline)] shadow-xs">
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-8.5 h-8.5 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === i
                    ? 'w-6 bg-[var(--accent-orange)]'
                    : 'w-2 bg-[var(--border-hairline-dark)] hover:bg-[var(--accent-orange)]/50'
                }`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="w-8.5 h-8.5 rounded-full bg-[var(--bg-page)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-hairline)] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
