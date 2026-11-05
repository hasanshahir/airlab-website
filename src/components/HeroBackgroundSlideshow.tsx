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
  autoPlayInterval = 5000, // 5 seconds per slide for a comfortable reading rhythm
  onPauseChange,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<number | null>(null)

  const total = slides.length

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total)
  }, [total])

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      onPauseChange?.(true)
      return
    }

    onPauseChange?.(false)
    timerRef.current = window.setInterval(() => {
      handleNext()
    }, autoPlayInterval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isHovered, autoPlayInterval, handleNext, onPauseChange])

  // Keyboard navigation
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
      className="relative w-full rounded-3xl overflow-hidden select-none bg-[#10002B] border border-black/10 shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="AIR Lab Photography Showcase"
    >
      {/* ── BACKGROUND SLIDESHOW IMAGES (Untampered, High Resolution) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.9, ease: 'easeInOut' },
              scale: { duration: 7.0, ease: 'easeOut' },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeSlide.src}
              alt={activeSlide.alt}
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* ── CRISP VIGNETTE & CONTRAST OVERLAY (Keeps images vibrant while text pops with 100% clarity) ── */}
        {/* Top subtle vignette for navbar/top elements */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-black/35 to-black/75 z-10" />

        {/* Center radial focus scrim to elevate the slogan */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16, 0, 43, 0.35) 0%, rgba(16, 0, 43, 0.65) 100%)',
          }}
        />
      </div>

      {/* ── FOREGROUND CONTENT LAYER (Slogan, CTA, and Links on top of the slideshow) ── */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[680px] px-6 sm:px-12 py-14 sm:py-20 text-center">
        {children}
      </div>

      {/* ── NAVIGATION ARROWS (Fade in on hover or visible on desktop) ── */}
      <div className="absolute inset-y-0 left-3 sm:left-5 flex items-center z-30 pointer-events-none">
        <button
          type="button"
          onClick={handlePrev}
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white/85 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
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
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white/85 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          aria-label="Next lab photograph"
          title="Next image (Right arrow)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ── BOTTOM HUD BAR: Real-time Caption, Hover Pause Indicator, and Segmented Progress Pill ── */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Caption Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium shadow-md">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse shrink-0" />
          <span className="font-semibold text-white">{activeSlide.title}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/75">{activeSlide.subtitle}</span>
        </div>

        {/* Center: Segmented Timer Indicators */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 shadow-md">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`group relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive ? 'w-8 bg-white/30' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                title={slide.title}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[var(--accent-orange)] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: isHovered ? '100%' : '100%' }}
                    transition={{
                      duration: isHovered ? 0 : autoPlayInterval / 1000,
                      ease: 'linear',
                    }}
                  />
                )}
              </button>
            )
          })}

          {/* Pause Status Indicator */}
          <div
            className="ml-1 pl-2 border-l border-white/20 text-white/70 text-[11px] font-sans flex items-center gap-1 select-none"
            title={isHovered ? 'Slideshow paused while hovering' : 'Slideshow actively playing'}
          >
            {isHovered ? (
              <>
                <Pause className="w-3 h-3 text-[var(--accent-orange)]" />
                <span className="text-[10.5px] uppercase tracking-wider font-semibold text-white/90">Paused</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-white/70" />
                <span className="text-[10px] text-white/60">5s</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBackgroundSlideshow

