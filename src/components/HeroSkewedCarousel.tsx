import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react'

export interface CarouselSlide {
  id: string
  type: 'typography' | 'image'
  src?: string
  alt?: string
  caption?: string
  tag?: string
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-typography',
    type: 'typography',
    tag: 'ORIGIN & MISSION',
  },
  {
    id: 'slide-1',
    type: 'image',
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Innovation',
    caption: 'Frontier AI Research & Prototyping',
    tag: 'LABORATORY',
  },
  {
    id: 'slide-2',
    type: 'image',
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'Team Collaboration at NED CSIT',
    caption: 'Interdisciplinary Collaboration',
    tag: 'COMMUNITY',
  },
  {
    id: 'slide-3',
    type: 'image',
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Robotics & Intelligent Systems',
    caption: 'Autonomous Systems & Edge AI',
    tag: 'DEVELOPMENT',
  },
  {
    id: 'slide-4',
    type: 'image',
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'Student Researchers & Fellows',
    caption: 'Nurturing the Next Generation of AI Scientists',
    tag: 'FELLOWSHIPS',
  },
  {
    id: 'slide-5',
    type: 'image',
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT, NED University',
    caption: 'Academic Excellence & Impact',
    tag: 'CAMPUS',
  },
]

interface HeroSkewedCarouselProps {
  slides?: CarouselSlide[]
  autoPlayInterval?: number
}

export default function HeroSkewedCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 4500,
}: HeroSkewedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = slides.length

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % total)
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + total) % total)
  }

  // Autoplay
  useEffect(() => {
    if (isHovered || total <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isHovered, total, autoPlayInterval])

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diffX = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) handleNext()
      else handlePrev()
    }
    touchStartX.current = null
  }

  // Calculate circular offset
  const getOffset = (index: number) => {
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <div
      className="relative w-full select-none py-6 sm:py-8 flex flex-col items-center justify-center overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-full max-w-[940px] h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center"
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
      >
        {slides.map((slide, index) => {
          const offset = getOffset(index)
          const isCenter = offset === 0
          const isVisible = Math.abs(offset) <= 2

          // Style transformations based on offset
          let xPercent = 0
          let rotateY = 0
          let scale = 1
          let zIndex = 30
          let opacity = 1

          if (offset === 0) {
            xPercent = 0
            rotateY = 0
            scale = 1
            zIndex = 30
            opacity = 1
          } else if (offset === -1) {
            xPercent = -58
            rotateY = 24
            scale = 0.88
            zIndex = 20
            opacity = 0.85
          } else if (offset === 1) {
            xPercent = 58
            rotateY = -24
            scale = 0.88
            zIndex = 20
            opacity = 0.85
          } else if (offset === -2) {
            xPercent = -105
            rotateY = 38
            scale = 0.74
            zIndex = 10
            opacity = 0.45
          } else if (offset === 2) {
            xPercent = 105
            rotateY = -38
            scale = 0.74
            zIndex = 10
            opacity = 0.45
          } else {
            xPercent = offset > 0 ? 140 : -140
            scale = 0.6
            zIndex = 0
            opacity = 0
          }

          if (!isVisible && opacity === 0) return null

          return (
            <motion.div
              key={slide.id}
              onClick={() => {
                if (!isCenter) setCurrentIndex(index)
              }}
              animate={{
                x: `${xPercent}%`,
                rotateY,
                scale,
                opacity,
                z: isCenter ? 40 : -Math.abs(offset) * 60,
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
              className={`absolute w-[240px] sm:w-[280px] md:w-[320px] aspect-[3/4] rounded-3xl cursor-pointer overflow-hidden transition-shadow duration-300 ${
                isCenter
                  ? 'shadow-[0_20px_50px_rgba(0,0,0,0.32)] ring-1 ring-[var(--accent-orange)]/40'
                  : 'shadow-[0_12px_30px_rgba(0,0,0,0.20)] hover:opacity-95'
              }`}
            >
              {/* SLIDE TYPE 1: SLEEK AIR LAB TYPOGRAPHY */}
              {slide.type === 'typography' ? (
                <div className="w-full h-full relative p-6 sm:p-7 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c1813] via-[#081c15] to-[#122e23] text-white border border-[var(--accent-orange)]/30 rounded-3xl group">
                  {/* Subtle ambient lighting mesh */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-[var(--accent-orange)]/25 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#74C69D]/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Grid texture overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Top Bar: Lab Badge & Coordinates */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--accent-cyan)]/90">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                      AIR-LAB // 2026
                    </span>
                    <span className="text-white/50 text-[10px]">EST. 2019</span>
                  </div>

                  {/* Center Typography: Sleek, architectural, bold */}
                  <div className="relative z-10 my-auto py-4">
                    <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--accent-orange)] uppercase font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      <span>FRONTIER AI</span>
                    </div>

                    <h2 className="text-5xl sm:text-6xl font-black font-head tracking-[-0.04em] leading-[0.88] text-white drop-shadow-md">
                      AIR
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent-cyan)] to-[var(--accent-orange)]">
                        LAB
                      </span>
                    </h2>

                    <div className="w-12 h-1 bg-[var(--accent-orange)] rounded-full mt-3 mb-3" />

                    <p className="text-xs sm:text-[13px] font-sans font-medium text-white/80 leading-relaxed max-w-[240px]">
                      Artificial Intelligence Research Laboratory
                    </p>
                  </div>

                  {/* Bottom: Department details & status */}
                  <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col gap-1 text-[11px] font-sans">
                    <div className="text-white/90 font-semibold flex items-center justify-between">
                      <span>NED University CSIT</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    </div>
                    <span className="text-white/50 text-[10px] font-mono">
                      AUTONOMOUS &bull; REGIONAL &bull; IMPACT
                    </span>
                  </div>
                </div>
              ) : (
                /* SLIDE TYPE 2: HIGH-RES PHOTOGRAPH WITH SLEEK GLASS OVERLAY */
                <div className="w-full h-full relative group">
                  <img
                    src={slide.src}
                    alt={slide.alt || 'AIR Lab'}
                    className="w-full h-full object-cover rounded-3xl transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent rounded-3xl" />

                  {/* Card Content & Tag */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-left text-white">
                    {slide.tag && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[var(--accent-orange)] text-white mb-2 shadow-xs">
                        {slide.tag}
                      </span>
                    )}
                    {slide.caption && (
                      <p className="text-sm font-semibold font-sans leading-snug text-white/95 drop-shadow-sm">
                        {slide.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Pagination & Arrow Controls */}
      <div className="mt-6 flex items-center justify-center gap-4 z-20">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs">
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
          className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
