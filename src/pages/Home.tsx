import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import Button from '../components/ui/Button'
import StudentApplicationModal from '../components/StudentApplicationModal'
import SponsorsGrid from '../components/SponsorsGrid'
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero'
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel'
import { getProjects, getGrants } from '../lib/data'
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
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    desc: 'Pretraining multilingual LLMs tailored for low-resource regional dialects with advanced byte-level tokenizers and parameter-efficient fine-tuning.',
  },
  {
    icon: ShieldAlert,
    title: 'Adversarial AI',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    desc: 'Investigating neural network vulnerabilities, model jailbreaking, prompt injection mitigation, and robust defense benchmarks for high-stakes AI systems.',
  },
  {
    icon: ShieldCheck,
    title: 'Cyber',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    desc: 'Autonomous cyber defense, encrypted traffic analysis, zero-trust infrastructure, and automated vulnerability intelligence to safeguard digital ecosystems.',
  },
  {
    icon: Terminal,
    title: 'Software Development',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    desc: 'High-performance AI engineering, production-grade microservices, scalable distributed inference pipelines, and intelligent software systems.',
  },
  {
    icon: Code,
    title: 'Efficient Computing & TinyML',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    desc: 'Hardware-aware neural architecture search (NAS), INT8 quantization, and ultra-low-latency deployment on FPGAs and embedded SoCs.',
  },
  {
    icon: LineChart,
    title: 'AI Safety & Alignment',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    desc: 'Ensuring robust, unbiased, and safe deployment of intelligent systems in critical healthcare, power grids, and national infrastructure.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [carouselVersion, setCarouselVersion] = useState<'v1' | 'v2'>('v1')
  const updatesTrackRef = useRef<HTMLDivElement>(null)
  const updatesOffsetRef = useRef(0)
  const updatesVelocityRef = useRef(55) // px/sec default moving left
  const updatesTargetVelocityRef = useRef(55)
  const updatesManualBoostRef = useRef(0)
  const vacancy = useVacancySettings()
  const [projects, setProjects] = useState<ProjectItem[]>(() => getProjects())
  const [grants, setGrants] = useState<Grant[]>(() => getGrants())
  const areasTrackRef = useRef<HTMLDivElement>(null)
  const areasOffsetRef = useRef(0)
  const areasVelocityRef = useRef(55) // px/sec default moving left
  const areasTargetVelocityRef = useRef(55)
  const areasManualBoostRef = useRef(0)

  useEffect(() => {
    let active = true
    const apiBase = import.meta.env.VITE_API_URL || ''

    fetch(`${apiBase}/api/content/projects`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setProjects(data)
        }
      })
      .catch(() => {})

    fetch(`${apiBase}/api/content/grants`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setGrants(data)
        }
      })
      .catch(() => {})

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

  const loopedAreas = useMemo(() => {
    return [...coreResearchAreas, ...coreResearchAreas, ...coreResearchAreas]
  }, [])

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

      stepRibbon(
        areasTrackRef.current,
        coreResearchAreas.length,
        areasOffsetRef,
        areasVelocityRef,
        areasTargetVelocityRef,
        areasManualBoostRef,
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
    const edgeZone = 0.2 // 20% leftmost and 20% rightmost zones

    if (relX < edgeZone) {
      const intensity = 1 - relX / edgeZone
      targetVelocityRef.current = -(140 + intensity * 180)
    } else if (relX > 1 - edgeZone) {
      const intensity = (relX - (1 - edgeZone)) / edgeZone
      targetVelocityRef.current = 140 + intensity * 180
    } else {
      targetVelocityRef.current = 0
    }
  }

  const handleUpdatesMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateRibbonHoverVelocity(e, updatesTargetVelocityRef)
  }

  const handleUpdatesMouseLeave = () => {
    updatesTargetVelocityRef.current = 55
  }

  const handleAreasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateRibbonHoverVelocity(e, areasTargetVelocityRef)
  }

  const handleAreasMouseLeave = () => {
    areasTargetVelocityRef.current = 55
  }

  const scrollUpdates = (direction: 'left' | 'right') => {
    const step = 360
    updatesManualBoostRef.current += direction === 'left' ? -step : step
  }

  const scrollAreas = (direction: 'left' | 'right') => {
    const step = 380
    areasManualBoostRef.current += direction === 'left' ? -step : step
  }

  const heroOverlay = (
    <div className="relative z-10 flex h-full w-full max-w-4xl mx-auto flex-col items-center justify-center px-6 text-center pointer-events-none">
      {/* Soft, edge-less shadow behind the text only (carousel photos remain 100% full brightness) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl h-64 -z-10"
        style={{
          background:
            'radial-gradient(closest-side, rgba(10, 0, 28, 0.58) 0%, rgba(10, 0, 28, 0.26) 55%, transparent 100%)',
        }}
      />

      {/* Clean centered 3D extruded slogan */}
      <h1
        className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-head text-white tracking-[-0.02em] leading-[1.12] select-none max-w-2xl"
        style={{
          textShadow:
            '0 1px 0 rgba(16, 0, 43, 0.95), 0 2px 0 rgba(16, 0, 43, 0.9), 0 3px 0 rgba(16, 0, 43, 0.85), 0 4px 0 rgba(16, 0, 43, 0.75), 0 8px 20px rgba(0, 0, 0, 0.95), 0 18px 42px rgba(0, 0, 0, 0.8)',
        }}
      >
        Where Intelligence Meets Engineering.
      </h1>

      {/* Tactile 3D Action Button centered directly below the text */}
      <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3.5 pointer-events-auto">
        <Link
          to="/projects"
          className="h-11 sm:h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full border border-white/25 shadow-[0_4px_0_rgba(16,0,43,0.55),0_12px_28px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_0_rgba(16,0,43,0.55),0_16px_34px_rgba(0,0,0,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(16,0,43,0.55),0_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 flex items-center gap-2 cursor-pointer group"
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
        {carouselVersion === 'v1' ? (
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
        ) : (
          <CoverflowCarousel
            slides={HERO_CAROUSEL_IMAGES}
            autoPlay
            speed={4}
            cardWidth="clamp(250px, 34vw, 400px)"
            label="AIR Lab Hero Coverflow Carousel"
            className="h-[460px] sm:h-[580px] md:h-[640px] w-full bg-transparent"
          >
            {heroOverlay}
          </CoverflowCarousel>
        )}

        {/* ── CAROUSEL VERSION TOGGLE (V1 / V2) RIGHT BELOW THE CAROUSEL ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-3 flex items-center justify-center">
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
                  className={`relative px-3.5 py-1 rounded-full text-xs font-semibold transition-colors duration-180 cursor-pointer select-none ${
                    isActive
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
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-sans text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
          <Link
            to="/projects"
            className="text-[var(--accent-orange)] hover:underline font-semibold flex items-center gap-1 transition-colors"
          >
            All Projects &rarr;
          </Link>
          <span className="text-[var(--border-hairline)]">•</span>
          <Link
            to="/grants"
            className="hover:text-[var(--text-primary)] hover:underline font-medium flex items-center gap-1 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            Active Grants &rarr;
          </Link>
          <span className="text-[var(--border-hairline)]">•</span>
          <Link
            to="/team"
            className="hover:text-[var(--text-primary)] hover:underline font-medium flex items-center gap-1 transition-colors"
          >
            All Team Members &rarr;
          </Link>
        </div>
      </section>

      {/* ── 2. RECENT UPDATES SECTION (Clean, Minimal, Directly Labeled) ── */}
      <section className="py-10 sm:py-12 px-4 sm:px-8 max-w-[1240px] mx-auto relative z-10">
        {/* Header Row with Prev/Next Controls */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[var(--border-hairline)]">
          <h2 className="text-xl sm:text-2xl font-bold font-head text-[var(--text-primary)]">
            Recent Updates
          </h2>

          {/* Horizontal Navigation Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollUpdates('left')}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Previous updates"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollUpdates('right')}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Next updates"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Looping Ribbon of Cards */}
        <div
          onMouseMove={handleUpdatesMouseMove}
          onMouseLeave={handleUpdatesMouseLeave}
          className="relative overflow-hidden py-2 -my-2 select-none"
        >
          <div
            ref={updatesTrackRef}
            className="flex gap-5 w-max pb-4 will-change-transform"
          >
            {loopedUpdates.map((item, idx) => (
              <article
                key={`${item.id}-${idx}`}
                className="min-w-[290px] sm:min-w-[340px] max-w-[360px] p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/50 shadow-xs hover:shadow-md transition-all shrink-0 flex flex-col justify-between group"
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
                      onClick={() => setApplyModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline transition-colors cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.link!}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline transition-colors"
                    >
                      <span>{item.actionText}</span>
                    </Link>
                  )}
                </div>
              </article>
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-head">
                Advancing Cutting-Edge AI & Translating Innovation
              </h2>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed font-normal">
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is established to advance cutting-edge artificial intelligence and translate theoretical exploration into real-world impact.
              </p>

              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal">
                Bridging academia and industry, we develop intelligent systems that are robust, ethical, explainable, and scalable—shaping the future of AI in Pakistan.
              </p>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/about"
                  variant="secondary"
                  size="md"
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>About AIR Lab</span>
                </Button>
              </div>
            </div>

            {/* Right: Bigger AIR Lab Photo */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group">
              <img
                src="/about-lab.jpg"
                alt="AIR Lab NED University Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CORE RESEARCH AREAS (Single-Row Horizontal Slider with Single "See Projects" Button) ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--border-hairline)] text-left">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-head">
            Core Research Areas
          </h2>

          {/* Horizontal Slider Controls (< and >) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollAreas('left')}
              className="w-10 h-10 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Previous research areas"
              title="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollAreas('right')}
              className="w-10 h-10 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Next research areas"
              title="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Looping Ribbon of Core Research Areas */}
        <div
          onMouseMove={handleAreasMouseMove}
          onMouseLeave={handleAreasMouseLeave}
          className="relative overflow-hidden py-2 -my-2 select-none"
        >
          <div
            ref={areasTrackRef}
            className="flex gap-6 w-max pb-6 pt-1 will-change-transform"
          >
            {loopedAreas.map((area, idx) => {
              const Icon = area.icon
              const targetUrl = `/projects?area=${encodeURIComponent(area.title)}`
              return (
                <div
                  key={`${area.title}-${idx}`}
                  onClick={() => navigate(targetUrl)}
                  className="min-w-[310px] sm:min-w-[360px] max-w-[380px] shrink-0 relative overflow-hidden p-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl flex flex-col justify-between hover:border-[var(--accent-orange)]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  {/* Subtle low-opacity background image texture ensuring all text remains crisp and visible */}
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                    <img
                      src={area.image}
                      alt=""
                      className="w-full h-full object-cover opacity-[0.18] dark:opacity-[0.24] group-hover:opacity-[0.26] dark:group-hover:opacity-[0.32] group-hover:scale-105 transition-all duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/60 to-[var(--bg-surface)]/10 pointer-events-none" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[var(--border-hairline)] text-[var(--ink-dark)] flex items-center justify-center group-hover:scale-105 group-hover:text-[var(--accent-orange)] transition-all shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="font-head font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors mb-2.5">
                      {area.title}
                    </h3>

                    <p className="text-sm text-[var(--text-muted)] leading-relaxed font-normal">
                      {area.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Single "See Projects" Button */}
        <div className="mt-8 flex justify-center sm:justify-start">
          <Button
            to="/projects"
            size="md"
            className="inline-flex items-center gap-2 font-semibold px-7"
          >
            <span>See Projects</span>
          </Button>
        </div>
      </section>

      {/* ── 5. TEAM SHOWCASE (Guided by faculty, driven by students, built for Pakistan) ── */}
      <section className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-24 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Team punchline & text */}
            <div className="lg:col-span-5 text-left space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-head leading-tight">
                Guided by faculty, driven by students, built for Pakistan.
              </h2>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed font-normal">
                Behind every system is a team that cares about Pakistan. Our interdisciplinary team brings together faculty principal investigators, research interns, and student scholars solving real problems at the forefront of artificial intelligence.
              </p>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/team"
                  variant="secondary"
                  size="md"
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>Meet the Team</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Bigger Team group photo */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group">
              <img
                src="/team-group.jpg"
                alt="AIR Lab Research Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
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
