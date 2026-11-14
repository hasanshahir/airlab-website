import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Brain,
  Bot,
  Code,
  LineChart,
  Layers,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Images,
  Box,
} from 'lucide-react'
import Button from '../components/ui/Button'
import airLabMark from '../assets/air-lab-mark.png'
import StudentApplicationModal from '../components/StudentApplicationModal'
import SponsorsGrid from '../components/SponsorsGrid'
import HeroBackgroundSlideshow, { LAB_SLIDES } from '../components/HeroBackgroundSlideshow'
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero'

const HERO_CAROUSEL_IMAGES = LAB_SLIDES.map(({ src, alt }) => ({ src, alt }))

const recentUpdates = [
  {
    id: 'update-1',
    category: 'NLP Research',
    date: 'Recent Release',
    title: 'Urdu Multilingual LLM Pretraining Milestone',
    desc: 'Pretraining byte-level tokenizers and parameter-efficient LoRA fine-tuning pipelines tailored for low-resource regional dialects.',
    link: '/projects#PRJ-1',
    actionText: 'Explore Project',
    icon: Brain,
  },
  {
    id: 'update-2',
    category: 'Space & Cyber AI',
    date: 'Funded Initiative',
    title: 'NED-SAC Satellite Telemetry & Autonomous Perception',
    desc: 'Developing onboard edge intelligence and automated anomaly detection for satellite telemetry streams with NED-SAC.',
    link: '/projects#PRJ-NED-SAC',
    actionText: 'Explore Project',
    icon: ShieldCheck,
  },
  {
    id: 'update-3',
    category: 'Robotics Lab',
    date: 'Lab Benchmark',
    title: 'Autonomous UAV Edge Perception Trial Completed',
    desc: 'Field testing real-time visual odometry and edge neural inference algorithms on embedded Jetson computing hardware.',
    link: '/projects#PRJ-6',
    actionText: 'View Benchmark',
    icon: Bot,
  },
  {
    id: 'update-4',
    category: 'Student Spotlight',
    date: 'Monthly Honors',
    title: 'Performer of the Month Research Spotlight',
    desc: 'Honoring student researchers and lab fellows for groundbreaking contributions to multi-modal clinical diagnostic models.',
    link: '/performers',
    actionText: 'Meet Performers',
    icon: Award,
  },
  {
    id: 'update-5',
    category: 'Research Grants',
    date: 'Active Grants',
    title: 'National Infrastructure & Smart Grid Funding',
    desc: 'Secured competitive collaborative funding for power grid surge forecasting and renewable dispatch transformer models.',
    link: '/grants#grant-meta-pytorch',
    actionText: 'View Grants',
    icon: Cpu,
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
  const [heroMode, setHeroMode] = useState<'carousel' | 'slideshow'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('airlab_hero_mode')
      if (saved === 'slideshow' || saved === 'carousel') return saved
    }
    return 'carousel'
  })
  const updatesScrollRef = useRef<HTMLDivElement>(null)
  const areasScrollRef = useRef<HTMLDivElement>(null)

  const handleHeroModeChange = (mode: 'carousel' | 'slideshow') => {
    setHeroMode(mode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('airlab_hero_mode', mode)
    }
  }

  const scrollUpdates = (direction: 'left' | 'right') => {
    if (updatesScrollRef.current) {
      const scrollAmount = 340
      updatesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const scrollAreas = (direction: 'left' | 'right') => {
    if (areasScrollRef.current) {
      const scrollAmount = 380
      areasScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-transparent overflow-hidden">
      {/* ── 1. FULL-WIDTH HERO SHOWCASE (Toggleable between 3D Curved Carousel & Classic Slideshow) ── */}
      <section className="relative w-full z-10">
        {heroMode === 'carousel' ? (
          <TiltedGridHero
            images={HERO_CAROUSEL_IMAGES}
            tileHeight={56}
            speed={6}
            axis={50}
            gap={4}
            curve={72}
            className="h-[520px] sm:h-[640px] md:h-[720px] w-full bg-transparent"
          >
            <div className="relative z-10 flex h-full w-full max-w-4xl mx-auto flex-col items-center justify-center px-6 text-center">
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
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  to="/projects"
                  className="h-11 sm:h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full border border-white/25 shadow-[0_4px_0_rgba(16,0,43,0.55),0_12px_28px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_0_rgba(16,0,43,0.55),0_16px_34px_rgba(0,0,0,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(16,0,43,0.55),0_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Explore Projects</span>
                </Link>
              </div>
            </div>
          </TiltedGridHero>
        ) : (
          <HeroBackgroundSlideshow autoPlayInterval={5000}>
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 px-6">
              {/* LOGO ON THE LEFT: Clean, iconic, white on imagery */}
              <div className="shrink-0 flex items-center justify-center">
                <img
                  src={airLabMark}
                  alt="AIR Lab Mark"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain brightness-0 invert drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Subtle vertical separator on desktop */}
              <div className="hidden md:block w-px h-24 bg-white/30 shrink-0" />

              {/* TEXT ON THE RIGHT: Clean punchy slogan */}
              <div className="text-center md:text-left flex flex-col items-center md:items-start max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-head text-white tracking-tight leading-[1.08] drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] select-none">
                  Where Intelligence Meets Engineering.
                </h1>

                {/* Action Buttons directly on the photography */}
                <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
                  <Link
                    to="/projects"
                    className="h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 group"
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Explore Projects</span>
                  </Link>
                </div>
              </div>
            </div>
          </HeroBackgroundSlideshow>
        )}

        {/* ── MINIMAL CLEAN QUICK LINKS STRIP + HERO VIEW TOGGLE ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-sans text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <Link
              to="/projects"
              className="text-[var(--accent-orange)] hover:underline font-semibold flex items-center gap-1 transition-colors"
            >
              All Projects
            </Link>
            <span className="text-[var(--border-hairline)]">•</span>
            <Link
              to="/grants"
              className="hover:text-[var(--text-primary)] hover:underline font-medium flex items-center gap-1 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              Active Grants
            </Link>
            <span className="text-[var(--border-hairline)]">•</span>
            <Link
              to="/team"
              className="hover:text-[var(--text-primary)] hover:underline font-medium flex items-center gap-1 transition-colors"
            >
              All Team Members
            </Link>
          </div>

          {/* Hero View Mode Toggle */}
          <div
            role="group"
            aria-label="Hero display mode"
            className="inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs mx-auto sm:mx-0"
          >
            <button
              type="button"
              onClick={() => handleHeroModeChange('slideshow')}
              aria-pressed={heroMode === 'slideshow'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                heroMode === 'slideshow'
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Slideshow</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeroModeChange('carousel')}
              aria-pressed={heroMode === 'carousel'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                heroMode === 'carousel'
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Carousel</span>
            </button>
          </div>
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

        {/* Horizontal Scrollable Cards Rail */}
        <div
          ref={updatesScrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentUpdates.map(item => {
            const Icon = item.icon
            return (
              <article
                key={item.id}
                className="min-w-[290px] sm:min-w-[340px] max-w-[360px] p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/50 shadow-xs hover:shadow-md transition-all shrink-0 snap-start flex flex-col justify-between group"
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

                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-[var(--accent-orange)] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed font-normal mt-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-subtle)] font-medium">
                    {item.category}
                  </span>
                  <Link
                    to={item.link!}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline transition-colors"
                  >
                    <span>{item.actionText}</span>
                  </Link>
                </div>
              </article>
            )
          })}
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
                src="/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg"
                alt="AIR Lab NED University"
                className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-sans font-medium bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl inline-flex items-center justify-between border border-white/10">
                <span>Artificial Intelligence Research Lab</span>
                <span className="text-[var(--accent-orange)]">NED University</span>
              </div>
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

        {/* Single-Row Horizontal Scrollable Track */}
        <div
          ref={areasScrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {coreResearchAreas.map((area, idx) => {
            const Icon = area.icon
            const targetUrl = `/projects?area=${encodeURIComponent(area.title)}`
            return (
              <div
                key={idx}
                onClick={() => navigate(targetUrl)}
                className="min-w-[310px] sm:min-w-[360px] max-w-[380px] shrink-0 snap-start relative overflow-hidden p-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl flex flex-col justify-between hover:border-[var(--accent-orange)]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
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
      <section className="py-16 sm:py-24 px-6 sm:px-10 max-w-[1320px] mx-auto relative z-10 border-t border-[var(--border-hairline)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Team punchline & text */}
          <div className="lg:col-span-5 text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-head leading-tight">
              Guided by faculty, driven by students, built for Pakistan.
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-normal">
              Behind every system is a team that cares about Pakistan. Our interdisciplinary team brings together faculty principal investigators, research interns, and student scholars solving real problems at the forefront of artificial intelligence.
            </p>

            <div className="pt-2">
              <Button
                to="/team"
                size="md"
                className="inline-flex items-center gap-2 font-semibold"
              >
                <span>Meet the Team</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Bigger Team group photo */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[var(--border-hairline)] shadow-xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-[var(--bg-surface)] group">
            <img
              src="/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg"
              alt="AIR Lab Research Team"
              className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-sans font-medium bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl inline-flex items-center justify-between border border-white/10">
              <span>AIR Lab Faculty & Research Cohort</span>
              <span className="text-[var(--accent-orange)]">Department of CSIT</span>
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
