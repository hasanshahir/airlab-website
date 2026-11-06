import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

export interface SlideItem {
  id: string
  src: string
  alt: string
  title: string
  subtitle: string
}

export const LAB_SLIDES: SlideItem[] = [
  {
    id: 'slide-lab-1',
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping Laboratory',
    title: 'Research & Prototyping Laboratory',
    subtitle: 'High-Throughput Deep Learning Cluster',
  },
  {
    id: 'slide-gpu-2',
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'High Performance Neural Computing Rig',
    title: 'Deep Learning GPU Compute',
    subtitle: 'TensorRT & Edge Accelerated Nodes',
  },
  {
    id: 'slide-collab-3',
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Interdisciplinary Student Collaboration & ML Pipelines',
    title: 'Student ML Collaboration',
    subtitle: 'Foundational Models & Computer Vision',
  },
  {
    id: 'slide-fellows-4',
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'AIR Lab Research Fellows Station',
    title: 'Research Fellows Workstations',
    subtitle: 'Pioneering Regional AI Breakthroughs',
  },
  {
    id: 'slide-entrance-5',
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT & AIR Lab Entrance',
    title: 'Academic Excellence',
    subtitle: 'Department of CSIT • NED University',
  },
]

interface HeroBackgroundSlideshowProps {
  slides?: SlideItem[]
  autoPlayInterval?: number
  onPauseChange?: (isPaused: boolean) => void
  children?: React.ReactNode
}

export const HeroBackgroundSlideshow: React.FC<HeroBackgroundSlideshowProps> = ({
  slides = LAB_SLIDES,
  autoPlayInterval = 5000,
  onPauseChange,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0) // 0 to 100%

  const total = slides.length
  const lastTimeRef = useRef<number>(performance.now())
  const elapsedRef = useRef<number>(0)
  const isHoveredRef = useRef<boolean>(false)

  // Sync ref with state
  useEffect(() => {
    isHoveredRef.current = isHovered
    onPauseChange?.(isHovered)
  }, [isHovered, onPauseChange])

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total)
    elapsedRef.current = 0
    setProgress(0)
    lastTimeRef.current = performance.now()
  }, [total])

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total)
    elapsedRef.current = 0
    setProgress(0)
    lastTimeRef.current = performance.now()
  }, [total])

  const goToSlide = useCallback((idx: number) => {
    setCurrentIndex(idx)
    elapsedRef.current = 0
    setProgress(0)
    lastTimeRef.current = performance.now()
  }, [])

  // Smooth frame-by-frame timer & progress loop
  useEffect(() => {
    let animId: number
    lastTimeRef.current = performance.now()

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (!isHoveredRef.current) {
        elapsedRef.current += delta
        const pct = Math.min((elapsedRef.current / autoPlayInterval) * 100, 100)
        setProgress(pct)

        if (elapsedRef.current >= autoPlayInterval) {
          elapsedRef.current = 0
          setProgress(0)
          setCurrentIndex(prev => (prev + 1) % total)
        }
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [autoPlayInterval, total])

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  const activeSlide = slides[currentIndex] || slides[0]

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden select-none bg-slate-900 border border-black/10 shadow-2xl transition-all duration-300 group/hero"
      onMouseEnter={() => {
        setIsHovered(true)
        lastTimeRef.current = performance.now()
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        lastTimeRef.current = performance.now()
      }}
      role="region"
      aria-label="AIR Lab Photography Showcase"
    >
      {/* ── BACKGROUND SLIDESHOW IMAGES (100% Natural, Untampered Lab Photography) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
        <AnimatePresence initial={false}>
          <motion.img
            key={activeSlide.id}
            src={activeSlide.src}
            alt={activeSlide.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            loading="eager"
          />
        </AnimatePresence>

        {/* Top subtle vignette only behind top elements for clean text contrast */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

        {/* Bottom subtle vignette for HUD & progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/65 to-transparent pointer-events-none z-10" />
      </div>

      {/* ── FOREGROUND CONTENT (Middle alignment matching AllenAI: Centered vertically and horizontally) ── */}
      <div className="relative z-20 w-full min-h-[440px] sm:min-h-[500px] md:min-h-[540px] flex items-center justify-center p-4 sm:p-8 md:p-12">
        {children}
      </div>

      {/* ── NAVIGATION ARROWS (Floating at left & right edges) ── */}
      <div className="absolute inset-y-0 left-3 sm:left-5 flex items-center z-30 pointer-events-none">
        <button
          type="button"
          onClick={handlePrev}
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95 opacity-85 group-hover/hero:opacity-100"
          aria-label="Previous lab photograph"
          title="Previous image (Left arrow)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-3 sm:right-5 flex items-center z-30 pointer-events-none">
        <button
          type="button"
          onClick={handleNext}
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95 opacity-85 group-hover/hero:opacity-100"
          aria-label="Next lab photograph"
          title="Next image (Right arrow)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ── BOTTOM HUD STRIP (Slide caption badge + Jump dots + Pause indicator) ── */}
      <div className="absolute bottom-3.5 sm:bottom-4 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between gap-3 pointer-events-none">
        {/* Caption Badge on the left */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-md">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse shrink-0" />
          <span className="font-semibold text-white">0{currentIndex + 1} / 0{total}</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-white/85 hidden sm:inline">{activeSlide.title}</span>
        </div>

        {/* Jump Dots & Pause Indicator on the right */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 shadow-md">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[var(--accent-orange)]'
                  : 'w-2 bg-white/40 hover:bg-white/85'
              }`}
              aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
              title={slide.title}
            />
          ))}

          <div className="ml-1 pl-2 border-l border-white/20 text-white/80 text-[11px] font-sans flex items-center gap-1.5">
            {isHovered ? (
              <>
                <Pause className="w-3 h-3 text-[var(--accent-orange)]" />
                <span className="text-[10px] uppercase font-bold text-white/95 tracking-wide">
                  Paused
                </span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-white/70" />
                <span className="text-[10px] text-white/75 font-medium">5s</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH BOTTOM PROGRESS BAR (Animated 0% to 100%, pauses on hover) ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-1.5 sm:h-2 bg-black/50 backdrop-blur-xs z-40 overflow-hidden cursor-pointer"
        onClick={() => handleNext()}
        title={isHovered ? 'Slideshow paused (mouse hovering)' : 'Slideshow timer progress'}
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-cyan)] to-[var(--accent-orange)] shadow-[0_0_12px_var(--accent-orange)]"
          style={{
            width: `${progress}%`,
            transition: isHovered ? 'none' : 'width 30ms linear',
          }}
        />
      </div>
    </div>
  )
}

export default HeroBackgroundSlideshow
