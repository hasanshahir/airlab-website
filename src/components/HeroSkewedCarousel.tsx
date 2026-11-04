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

interface CarouselCardProps {
  slide: CarouselSlide
  offset: number
  isCenter: number | boolean
  spread?: 'normal' | 'wide'
  onClick: () => void
}

function CarouselCard({ slide, offset, isCenter, spread = 'normal', onClick }: CarouselCardProps) {
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const isWide = spread === 'wide'

  // Base transformations derived from relative offset
  let xPercent = 0
  let baseRotateY = 0
  let scale = 1
  let zIndex = 30
  let opacity = 1

  if (offset === 0) {
    xPercent = 0
    baseRotateY = 0
    scale = 1
    zIndex = 30
    opacity = 1
  } else if (offset === -1) {
    xPercent = isWide ? -66 : -58
    baseRotateY = isWide ? 26 : 24
    scale = 0.88
    zIndex = 20
    opacity = 0.85
  } else if (offset === 1) {
    xPercent = isWide ? 66 : 58
    baseRotateY = isWide ? -26 : -24
    scale = 0.88
    zIndex = 20
    opacity = 0.85
  } else if (offset === -2) {
    xPercent = isWide ? -122 : -105
    baseRotateY = isWide ? 40 : 38
    scale = 0.74
    zIndex = 10
    opacity = 0.45
  } else if (offset === 2) {
    xPercent = isWide ? 122 : 105
    baseRotateY = isWide ? -40 : -38
    scale = 0.74
    zIndex = 10
    opacity = 0.45
  } else {
    xPercent = offset > 0 ? 150 : -150
    scale = 0.6
    zIndex = 0
    opacity = 0
  }

  // Handle 3D Mouse Parallax & Specular Glare Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const normX = (e.clientX - rect.left) / rect.width - 0.5
    const normY = (e.clientY - rect.top) / rect.height - 0.5

    const maxTilt = isCenter ? 15 : 9
    setTiltX(-normY * maxTilt)
    setTiltY(normX * maxTilt)

    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: isCenter ? 0.4 : 0.25,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTiltX(0)
    setTiltY(0)
    setGlarePos(prev => ({ ...prev, opacity: 0 }))
  }

  // Combined 3D Position & Rotation
  const currentY = isHovered ? (isCenter ? -14 : -8) : 0
  const currentScale = isHovered ? (isCenter ? scale * 1.05 : scale * 1.04) : scale
  const currentZ = isCenter ? (isHovered ? 85 : 40) : (isHovered ? 15 : -Math.abs(offset) * 60)

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: `${xPercent}%`,
        y: currentY,
        rotateX: tiltX,
        rotateY: baseRotateY + tiltY,
        scale: currentScale,
        opacity,
        z: currentZ,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 26,
        mass: 0.75,
      }}
      style={{
        zIndex: isHovered ? zIndex + 5 : zIndex,
        transformStyle: 'preserve-3d',
      }}
      className={`absolute w-[240px] sm:w-[280px] md:w-[320px] aspect-[3/4] rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 ${
        isCenter
          ? 'shadow-[0_25px_60px_-10px_rgba(0,0,0,0.38)] ring-1.5 ring-[var(--accent-orange)]/50'
          : 'shadow-[0_12px_32px_rgba(0,0,0,0.22)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.32)] hover:ring-1 hover:ring-[var(--accent-orange)]/40 hover:opacity-100'
      }`}
    >
      {/* Dynamic 3D Specular Glare / Holographic Light Sheen */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl z-30 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Ambient Edge Reflection */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15 pointer-events-none z-20" />

      {/* SLIDE TYPE 1: SLEEK AIR LAB TYPOGRAPHY */}
      {slide.type === 'typography' ? (
        <div className="w-full h-full relative p-6 sm:p-7 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c1813] via-[#081c15] to-[#122e23] text-white border border-[var(--accent-orange)]/35 rounded-3xl group">
          {/* Subtle dynamic ambient lighting mesh */}
          <div
            className="absolute -top-24 -right-24 w-56 h-56 bg-[var(--accent-orange)]/30 rounded-full blur-3xl pointer-events-none transition-transform duration-500"
            style={{
              transform: isHovered ? `translate3d(${tiltY * 3}px, ${-tiltX * 3}px, 0) scale(1.2)` : 'none',
            }}
          />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#74C69D]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Grid texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Top Bar: Lab Badge & Coordinates */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--accent-cyan)]/90">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
              AIR-LAB // 2026
            </span>
            <span className="text-white/55 text-[10px] font-mono">EST. 2019</span>
          </div>

          {/* Center Typography: Sleek, architectural, bold */}
          <div
            className="relative z-10 my-auto py-4 transition-transform duration-300"
            style={{
              transform: isHovered ? `translate3d(${tiltY * 1.5}px, ${-tiltX * 1.5}px, 20px)` : 'none',
            }}
          >
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

            <div className="w-12 h-1 bg-[var(--accent-orange)] rounded-full mt-3 mb-3 shadow-xs" />

            <p className="text-xs sm:text-[13px] font-sans font-medium text-white/85 leading-relaxed max-w-[240px]">
              Artificial Intelligence Research Laboratory
            </p>
          </div>

          {/* Bottom: Department details & status */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col gap-1 text-[11px] font-sans">
            <div className="text-white/95 font-semibold flex items-center justify-between">
              <span>NED University CSIT</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            </div>
            <span className="text-white/50 text-[10px] font-mono">
              AUTONOMOUS &bull; REGIONAL &bull; IMPACT
            </span>
          </div>
        </div>
      ) : (
        /* SLIDE TYPE 2: HIGH-RES PHOTOGRAPH WITH 3D ZOOM & SLEEK GLASS OVERLAY */
        <div className="w-full h-full relative group overflow-hidden">
          <motion.img
            src={slide.src}
            alt={slide.alt || 'AIR Lab'}
            className="w-full h-full object-cover rounded-3xl"
            animate={{
              scale: isHovered ? 1.08 : 1.0,
            }}
            transition={{ duration: 0.45 }}
            loading="lazy"
          />

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent rounded-3xl pointer-events-none" />

          {/* Card Content & Tag with Parallax depth */}
          <div
            className="absolute bottom-0 inset-x-0 p-5 text-left text-white transition-transform duration-300"
            style={{
              transform: isHovered ? `translate3d(${tiltY * 1.2}px, ${-tiltX * 1.2}px, 15px)` : 'none',
            }}
          >
            {slide.tag && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[var(--accent-orange)] text-white mb-2 shadow-xs">
                {slide.tag}
              </span>
            )}
            {slide.caption && (
              <p className="text-sm font-semibold font-sans leading-snug text-white/95 drop-shadow-md">
                {slide.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface HeroSkewedCarouselProps {
  slides?: CarouselSlide[]
  autoPlayInterval?: number
  spread?: 'normal' | 'wide'
  showControls?: boolean
  className?: string
}

export default function HeroSkewedCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 4500,
  spread = 'normal',
  showControls = true,
  className = '',
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

  // Autoplay (pauses smoothly when user hovers over the carousel)
  useEffect(() => {
    if (isHovered || total <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isHovered, total, autoPlayInterval])

  // Touch Swipe Handlers for Mobile & Tablet
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
      className={`relative w-full select-none py-6 sm:py-8 flex flex-col items-center justify-center overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-full max-w-[1020px] h-[390px] sm:h-[450px] md:h-[490px] flex items-center justify-center"
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
      >
        {slides.map((slide, index) => {
          const offset = getOffset(index)
          const isCenter = offset === 0
          const isVisible = Math.abs(offset) <= 2

          if (!isVisible) return null

          return (
            <CarouselCard
              key={slide.id}
              slide={slide}
              offset={offset}
              isCenter={isCenter}
              spread={spread}
              onClick={() => {
                if (!isCenter) setCurrentIndex(index)
              }}
            />
          )
        })}
      </div>

      {/* Pagination & Arrow Controls */}
      {showControls && (
        <div className="mt-7 flex items-center justify-center gap-4 z-20">
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
      )}
    </div>
  )
}
