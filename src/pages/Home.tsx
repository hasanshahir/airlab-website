import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Code,
  LineChart,
  Layers,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react'
import Button from '../components/ui/Button'
import TitleReveal from '../components/ui/TitleReveal'
import BlurReveal from '../components/ui/blur-reveal'
import StudentApplicationModal from '../components/StudentApplicationModal'
import SponsorsGrid from '../components/SponsorsGrid'
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero'
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel'
import { HandwritingText } from '@/components/ui/handwriting-text'
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
  useHoverSliderContext,
} from '@/components/ui/animated-slideshow'
import { getGrants, getProjects } from '../lib/data'
import { useVacancySettings } from '../lib/vacancy'
import type { ProjectItem, Grant } from '../types/data'

const HERO_CAROUSEL_IMAGES = [
  {
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping Laboratory',
  },
  {
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'High Performance Neural Computing Rig',
  },
  {
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Interdisciplinary Student Collaboration & ML Pipelines',
  },
  {
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'AIR Lab Research Fellows Station',
  },
  {
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT & AIR Lab Entrance',
  },
]

const coreResearchAreas = [
  {
    icon: Brain,
    title: 'Foundational Models & NLP',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80',
    desc: 'Pretraining multilingual LLMs tailored for low-resource regional dialects with advanced byte-level tokenizers and parameter-efficient fine-tuning.',
  },
  {
    icon: ShieldAlert,
    title: 'Adversarial AI',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    desc: 'Investigating neural network vulnerabilities, model jailbreaking, prompt injection mitigation, and robust defense benchmarks for high-stakes AI systems.',
  },
  {
    icon: ShieldCheck,
    title: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
    desc: 'Autonomous cyber defense, encrypted traffic analysis, zero-trust infrastructure, and automated vulnerability intelligence to safeguard digital ecosystems.',
  },
  {
    icon: Terminal,
    title: 'Software Development',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    desc: 'High-performance AI engineering, production-grade microservices, scalable distributed inference pipelines, and intelligent software systems.',
  },
  {
    icon: Code,
    title: 'Efficient Computing & TinyML',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    desc: 'Hardware-aware neural architecture search (NAS), INT8 quantization, and ultra-low-latency deployment on FPGAs and embedded SoCs.',
  },
  {
    icon: LineChart,
    title: 'AI Safety & Alignment',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    desc: 'Ensuring robust, unbiased, and safe deployment of intelligent systems in critical healthcare, power grids, and national infrastructure.',
  },
]

function ActiveResearchAreaCaption({
  onSelectArea,
}: {
  onSelectArea: (title: string) => void
}) {
  const { activeSlide } = useHoverSliderContext()
  const active = coreResearchAreas[activeSlide] ?? coreResearchAreas[0]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => onSelectArea(active.title)}
      className="group mt-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] cursor-pointer transition-colors text-left"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={active.title}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] sm:text-base text-[var(--text-muted)] leading-snug font-normal"
        >
          {active.desc}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

function ResearchAreaTrackRow({
  area,
  index,
  onSelect,
}: {
  area: (typeof coreResearchAreas)[number]
  index: number
  onSelect: (title: string) => void
}) {
  const { activeSlide, changeSlide } = useHoverSliderContext()
  const isActive = activeSlide === index

  return (
    <button
      type="button"
      onMouseEnter={() => changeSlide(index)}
      onFocus={() => changeSlide(index)}
      onClick={() => onSelect(area.title)}
      className="group w-full text-left cursor-pointer bg-transparent border-0 py-1 px-0 focus:outline-none flex items-baseline gap-3.5"
    >
      <span
        className={`text-xs font-mono font-semibold tabular-nums transition-colors duration-200 shrink-0 ${
          isActive
            ? 'text-[var(--accent-orange)]'
            : 'text-[var(--text-subtle)]/45 group-hover:text-[var(--accent-orange)]/75'
        }`}
      >
        0{index + 1}
      </span>
      <TextStaggerHover
        index={index}
        className="font-head text-xl sm:text-2xl xl:text-[28px] font-bold uppercase tracking-tight leading-tight text-[var(--text-primary)]"
        text={area.title}
      />
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [carouselVersion, setCarouselVersion] = useState<'v1' | 'v2'>('v1')
  const [researchLayout, setResearchLayout] = useState<'grid' | 'slideshow'>('grid')
  const updatesTrackRef = useRef<HTMLDivElement>(null)
  const updatesOffsetRef = useRef(0)
  const updatesVelocityRef = useRef(55) // px/sec default moving left
  const updatesTargetVelocityRef = useRef(55)
  const updatesManualBoostRef = useRef(0)
  const vacancy = useVacancySettings()
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      return getProjects()
    } catch {
      return []
    }
  })
  const [grants, setGrants] = useState<Grant[]>(() => getGrants())

  useEffect(() => {
    let active = true
    const apiBase = import.meta.env.VITE_API_URL || ''

    fetch(`${apiBase}/api/content/projects`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setProjects(data)
        }
      })
      .catch(() => { })

    fetch(`${apiBase}/api/content/grants`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setGrants(data)
        }
      })
      .catch(() => { })

    return () => {
      active = false
    }
  }, [])

  const recentUpdates = useMemo(() => {
    const items: Array<{
      id: string
      category: string
      date: string
      title: string
      desc: string
      link?: string
      actionType?: 'apply'
      actionText: string
    }> = []

    const fundedProjects = projects.filter((p) => p.category === 'Funded')
    const ugProjects = projects.filter((p) => p.category !== 'Funded')

    for (const p of fundedProjects.slice(0, 2)) {
      items.push({
        id: `update-proj-${p.id}`,
        category: p.grantSupplier || 'Funded Project',
        date: p.timeTaken || p.startDate || 'Ongoing',
        title: p.title,
        desc: p.description,
        link: `/projects#${p.id}`,
        actionText: 'Explore Project',
      })
    }

    for (const g of grants.slice(0, 2)) {
      items.push({
        id: `update-grant-${g.id}`,
        category: g.funder || 'Research Grant',
        date: g.status === 'Active' ? 'Active Grant' : g.status,
        title: g.title,
        desc:
          g.description ||
          `${g.amount ? `${g.amount} · ` : ''}${g.leadInvestigator ? `PI: ${g.leadInvestigator}` : g.duration}`,
        link: `/grants#${g.id}`,
        actionText: 'View Grant',
      })
    }

    for (const p of ugProjects.slice(0, 3)) {
      items.push({
        id: `update-ug-${p.id}`,
        category: (p.grantSupplier && p.grantSupplier !== 'NA' ? p.grantSupplier : '') || 'Undergraduate Research',
        date: p.timeTaken || p.startDate || 'FYDP',
        title: p.title,
        desc: p.description,
        link: `/projects#${p.id}`,
        actionText: 'Explore Project',
      })
    }

    if (vacancy.status === 'Open') {
      items.push({
        id: 'update-vacancy',
        category: vacancy.badge || 'Vacancies',
        date: 'Admissions Open',
        title: vacancy.title,
        desc: vacancy.description,
        actionType: 'apply',
        actionText: 'Apply for Vacancy',
      })
    }

    return items
  }, [projects, grants, vacancy])

  const loopedUpdates = useMemo(() => {
    if (recentUpdates.length === 0) return []
    return [...recentUpdates, ...recentUpdates, ...recentUpdates]
  }, [recentUpdates])

  useEffect(() => {
    let rafId = 0
    let lastTime = performance.now()

    const stepRibbon = (
      track: HTMLDivElement | null,
      itemCount: number,
      offsetRef: React.MutableRefObject<number>,
      velocityRef: React.MutableRefObject<number>,
      targetVelocityRef: React.MutableRefObject<number>,
      manualBoostRef: React.MutableRefObject<number>,
      dt: number
    ) => {
      if (!track || itemCount === 0) return
      const children = track.children
      if (children.length < itemCount * 2) return

      const firstEl = children[0] as HTMLElement
      const secondSetEl = children[itemCount] as HTMLElement
      const singleSetWidth = secondSetEl.offsetLeft - firstEl.offsetLeft
      if (singleSetWidth <= 0) return

      velocityRef.current +=
        (targetVelocityRef.current - velocityRef.current) * Math.min(1, dt * 10)

      const manualStep = manualBoostRef.current * Math.min(1, dt * 8)
      manualBoostRef.current -= manualStep

      offsetRef.current += velocityRef.current * dt + manualStep

      if (offsetRef.current >= singleSetWidth) {
        offsetRef.current -= singleSetWidth
      } else if (offsetRef.current < 0) {
        offsetRef.current += singleSetWidth
      }

      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
    }

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      stepRibbon(
        updatesTrackRef.current,
        recentUpdates.length,
        updatesOffsetRef,
        updatesVelocityRef,
        updatesTargetVelocityRef,
        updatesManualBoostRef,
        dt
      )

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [recentUpdates.length])

  const updateRibbonHoverVelocity = (
    e: React.MouseEvent<HTMLDivElement>,
    targetVelocityRef: React.MutableRefObject<number>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width <= 0) return
    const relX = (e.clientX - rect.left) / rect.width
    const edgeZone = 0.25 // Outer 25% on each edge controls scrolling direction & speed

    if (relX < edgeZone) {
      // Hovering left side -> scrolls right (reverse)
      const intensity = 1 - relX / edgeZone
      targetVelocityRef.current = -(140 + intensity * 200)
    } else if (relX > 1 - edgeZone) {
      // Hovering right side -> scrolls left (forward)
      const intensity = (relX - (1 - edgeZone)) / edgeZone
      targetVelocityRef.current = 140 + intensity * 200
    } else {
      // Center area -> pause/standby so users can easily read or click cards
      targetVelocityRef.current = 0
    }
  }

  const handleUpdatesMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateRibbonHoverVelocity(e, updatesTargetVelocityRef)
  }

  const handleUpdatesMouseLeave = () => {
    updatesTargetVelocityRef.current = 55
  }

  const handleUpdatesWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4) {
      updatesManualBoostRef.current += e.deltaX * 1.2
    }
  }

  const scrollUpdates = (direction: 'left' | 'right') => {
    const step = 360
    updatesManualBoostRef.current += direction === 'left' ? -step : step
  }

  const heroOverlay = (
    <div className="relative z-10 flex h-full w-full max-w-4xl mx-auto flex-col items-center justify-center px-6 text-center pointer-events-none">
      {/* Clean high-visibility radial light scrim behind the text so the carousel stays visible without visual clutter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl h-64 -z-10 rounded-full blur-md"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.45) 55%, transparent 100%)',
        }}
      />

      <h1
        className="max-w-2xl text-center text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-zinc-900 font-head select-none pointer-events-auto"
        style={{
          textShadow: '0 2px 18px rgba(255, 255, 255, 0.95)',
        }}
      >
        Where Intelligence Meets
        <br />
        <HandwritingText
          words={[
            'Engineering.',
            'Creativity.',
            'Innovation.',
            'Discovery.',
            'Impact.',
          ]}
          className="text-[var(--accent-orange)] mt-1"
          height="1.18em"
          strokeWidth={1.8}
        />
      </h1>

      {/* Tactile Action Button centered directly below the text */}
      <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3.5 pointer-events-auto">
        <Link
          to="/projects"
          className="h-11 sm:h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full border border-white/40 shadow-[0_10px_28px_rgba(123,44,191,0.38)] hover:shadow-[0_14px_34px_rgba(123,44,191,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Explore Projects</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-transparent overflow-hidden">
      {/* ── 1. FULL-WIDTH HERO SHOWCASE (V1 Curved / V2 Coverflow) ── */}
      <section className="relative w-full z-10">
        <AnimatePresence mode="wait" initial={false}>
          {carouselVersion === 'v1' ? (
            <motion.div
              key="hero-v1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <TiltedGridHero
                images={HERO_CAROUSEL_IMAGES}
                tileHeight={48}
                speed={6}
                axis={50}
                gap={4}
                curve={72}
                className="h-[460px] sm:h-[580px] md:h-[640px] w-full bg-transparent"
              >
                {heroOverlay}
              </TiltedGridHero>
            </motion.div>
          ) : (
            <motion.div
              key="hero-v2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <CoverflowCarousel
                slides={HERO_CAROUSEL_IMAGES}
                autoPlay
                transitionDuration={850}
                pauseDuration={850}
                cardWidth="min(80cqh, 74cqw)"
                gap={-0.06}
                label="AIR Lab Hero Coverflow Carousel"
                className="h-[460px] sm:h-[580px] md:h-[640px] w-full bg-transparent"
              >
                {heroOverlay}
              </CoverflowCarousel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CAROUSEL VERSION TOGGLE (V1 / V2) RIGHT BELOW THE CAROUSEL ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-1.5 flex items-center justify-center">
          <div
            role="radiogroup"
            aria-label="Hero Carousel Version"
            className="inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs"
          >
            {(
              [
                { id: 'v1', label: 'V1 · Curved' },
                { id: 'v2', label: 'V2 · Coverflow' },
              ] as const
            ).map((option) => {
              const isActive = carouselVersion === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setCarouselVersion(option.id)}
                  className={`relative px-3.5 py-1 rounded-full text-xs font-semibold transition-colors duration-180 cursor-pointer select-none ${isActive
                      ? 'text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeHeroCarouselVersionPill"
                      className="absolute inset-0 rounded-full bg-[var(--accent-orange)] shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── MINIMAL CLEAN QUICK LINKS STRIP ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 text-xs sm:text-sm font-sans text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
          <Link
            to="/projects"
            className="group px-3 py-1 rounded-full bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-surface)] text-[var(--accent-orange)] font-semibold flex items-center gap-1.5 border border-[var(--border-hairline)] transition-all"
          >
            <span>All Projects</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
          </Link>
          <span className="text-[var(--border-hairline)] hidden sm:inline">•</span>
          <Link
            to="/grants"
            className="group px-3 py-1 rounded-full hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Active Grants</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
          </Link>
          <span className="text-[var(--border-hairline)] hidden sm:inline">•</span>
          <Link
            to="/team"
            className="group px-3 py-1 rounded-full hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-all"
          >
            <span>All Team Members</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ── 2. RECENT UPDATES SECTION (Clean, Minimal, Directly Labeled) ── */}
      <section className="py-10 sm:py-12 px-4 sm:px-8 max-w-[1240px] mx-auto relative z-10">
        {/* Header Row with Prev/Next Controls */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[var(--border-hairline)]">
          <TitleReveal
            as="h2"
            className="text-xl sm:text-2xl font-bold font-head text-[var(--text-primary)]"
          >
            Recent Updates
          </TitleReveal>

          {/* Horizontal Navigation Arrow Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => scrollUpdates('left')}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Previous updates"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => scrollUpdates('right')}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Next updates"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Dynamic Looping Ribbon of Cards */}
        <div
          onMouseEnter={handleUpdatesMouseEnter}
          onMouseLeave={handleUpdatesMouseLeave}
          onWheel={handleUpdatesWheel}
          className="relative overflow-hidden py-3 -my-3 select-none ribbon-edge-mask"
        >
          <div
            ref={updatesTrackRef}
            className="flex gap-5 w-max pb-4 will-change-transform"
          >
            {loopedUpdates.map((item, idx) => (
              <motion.article
                key={`${item.id}-${idx}`}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                onClick={() => {
                  if (item.actionType === 'apply') {
                    setApplyModalOpen(true)
                  } else if (item.link) {
                    navigate(item.link)
                  }
                }}
                className="min-w-[290px] sm:min-w-[340px] max-w-[360px] p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-colors shrink-0 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11.5px] font-semibold text-[var(--accent-orange)] font-sans">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-subtle)] font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed font-normal mt-2 line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-subtle)] font-medium">
                    {item.category}
                  </span>
                  {item.actionType === 'apply' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setApplyModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] group-hover:underline transition-colors cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  ) : (
                    <Link
                      to={item.link!}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] group-hover:underline transition-colors"
                    >
                      <span>{item.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT AIR LAB SECTION (Two Columns: Punch Line & Bigger Lab Photo) ── */}
      <section id="explore-anchor" className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-24 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Punch line and about text */}
            <div className="lg:col-span-5 text-left space-y-6">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-head"
              >
                Advancing Cutting-Edge AI & Translating Innovation
              </TitleReveal>

              <BlurReveal
                as="p"
                className="text-base sm:text-lg text-white/85 leading-relaxed font-normal"
              >
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is established to advance cutting-edge artificial intelligence and translate theoretical exploration into real-world impact.
              </BlurReveal>

              <BlurReveal
                as="p"
                delay={0.12}
                className="text-base sm:text-lg text-white/80 leading-relaxed font-normal"
              >
                Bridging academia and industry, we develop intelligent systems that are robust, ethical, explainable, and scalable—shaping the future of AI in Pakistan.
              </BlurReveal>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/about"
                  variant="secondary"
                  size="md"
                  arrow
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>About AIR Lab</span>
                </Button>
              </div>
            </div>

            {/* Right: Bigger AIR Lab Photo */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group"
            >
              <img
                src="/about-lab.jpg"
                alt="AIR Lab NED University Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. CORE RESEARCH AREAS ── */}
      <section className="py-12 sm:py-14 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-[var(--border-hairline)] text-left">
          <TitleReveal
            as="h2"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-head"
          >
            Core Research Areas
          </TitleReveal>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs"
              role="group"
              aria-label="Core Research Areas layout toggle"
            >
              {(
                [
                  { id: 'grid', label: 'All Areas', icon: LayoutGrid },
                  { id: 'slideshow', label: 'Slideshow', icon: SlidersHorizontal },
                ] as const
              ).map((opt) => {
                const isActive = researchLayout === opt.id
                const OptIcon = opt.icon
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResearchLayout(opt.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
                      isActive
                        ? 'text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="researchAreasLayoutTogglePill"
                        className="absolute inset-0 rounded-full bg-[var(--accent-orange)] shadow-xs"
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                    )}
                    <OptIcon className="relative z-10 w-3.5 h-3.5" />
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            <Button
              to="/projects"
              size="sm"
              arrow
              className="inline-flex items-center gap-2 font-semibold px-5 shrink-0"
            >
              <span>See Projects</span>
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {researchLayout === 'grid' ? (
            <motion.div
              key="research-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {coreResearchAreas.map((area, idx) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  onClick={() =>
                    navigate(`/projects?area=${encodeURIComponent(area.title)}`)
                  }
                  className="group rounded-2xl bg-[var(--bg-surface)]/90 border border-[var(--border-hairline)] overflow-hidden hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-colors duration-200 cursor-pointer flex flex-col text-left"
                >
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[var(--ink-dark)]">
                    <img
                      src={area.image}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-project.svg'
                      }}
                      alt={area.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
                    <h3 className="absolute bottom-2.5 left-3.5 right-3.5 font-head text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                      {area.title}
                    </h3>
                  </div>
                  <div className="px-4 py-3 flex-1 flex items-center">
                    <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-snug font-normal line-clamp-3">
                      {area.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="research-slideshow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <HoverSlider className="rounded-3xl bg-[var(--bg-surface)]/80 border border-[var(--border-hairline)] p-5 sm:p-8 shadow-[var(--shadow-card)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-10">
                  {/* Left Column: Staggered Hover Titles */}
                  <div className="lg:col-span-6 flex flex-col items-start space-y-2 text-left">
                    {coreResearchAreas.map((area, index) => (
                      <ResearchAreaTrackRow
                        key={area.title}
                        area={area}
                        index={index}
                        onSelect={(title) =>
                          navigate(`/projects?area=${encodeURIComponent(title)}`)
                        }
                      />
                    ))}
                  </div>

                  {/* Right Column: Clipped Animated Image + Active Area Description */}
                  <div className="lg:col-span-6 flex flex-col">
                    <HoverSliderImageWrap className="rounded-2xl overflow-hidden border border-[var(--border-hairline)] shadow-md aspect-[16/10] max-h-[320px] w-full bg-[var(--ink-dark)]">
                      {coreResearchAreas.map((area, index) => (
                        <div
                          key={area.title}
                          onClick={() =>
                            navigate(`/projects?area=${encodeURIComponent(area.title)}`)
                          }
                          className="cursor-pointer group relative"
                        >
                          <HoverSliderImage
                            index={index}
                            imageUrl={area.image}
                            src={area.image}
                            alt={area.title}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-project.svg'
                            }}
                            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="eager"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </HoverSliderImageWrap>

                    <ActiveResearchAreaCaption
                      onSelectArea={(title) =>
                        navigate(`/projects?area=${encodeURIComponent(title)}`)
                      }
                    />
                  </div>
                </div>
              </HoverSlider>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── 5. TEAM SHOWCASE (Guided by faculty, driven by students, built for Pakistan) ── */}
      <section className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-24 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Team punchline & text */}
            <div className="lg:col-span-5 text-left space-y-6">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-head leading-tight"
              >
                Guided by faculty, driven by students, built for Pakistan.
              </TitleReveal>

              <BlurReveal
                as="p"
                className="text-base sm:text-lg text-white/85 leading-relaxed font-normal"
              >
                Behind every system is a team that cares about Pakistan. Our interdisciplinary team brings together faculty principal investigators, research interns, and student scholars solving real problems at the forefront of artificial intelligence.
              </BlurReveal>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/team"
                  variant="secondary"
                  size="md"
                  arrow
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>Meet the Team</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Bigger Team group photo */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group"
            >
              <img
                src="/team-group.jpg"
                alt="AIR Lab Research Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. COLLABORATORS & SPONSORS ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10 border-t border-[var(--border-hairline)]">
        <SponsorsGrid />
      </section>

      {/* Student Application Modal */}
      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  )
}
