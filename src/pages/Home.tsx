import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Bot,
  Database,
  Zap,
  Code,
  LineChart,
  Layers,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GraduationCap,
} from 'lucide-react'
import Button from '../components/ui/Button'
import airLabMark from '../assets/air-lab-mark.png'
import StudentApplicationModal from '../components/StudentApplicationModal'
import QuickDrawer from '../components/QuickDrawer'
import SponsorsGrid from '../components/SponsorsGrid'
import ContactSection from '../components/ContactSection'
import HeroBackgroundSlideshow from '../components/HeroBackgroundSlideshow'

const recentUpdates = [
  {
    id: 'update-1',
    category: 'NLP Research',
    date: 'Recent Release',
    title: 'Urdu Multilingual LLM Pretraining Milestone',
    desc: 'Pretraining byte-level tokenizers and parameter-efficient LoRA fine-tuning pipelines tailored for low-resource regional dialects.',
    badge: 'Benchmark',
    link: '/projects',
    actionText: 'Explore Project',
    icon: Brain,
  },
  {
    id: 'update-2',
    category: 'Fellowships',
    date: 'Admissions Open',
    title: 'Fall 2026 Student Research Fellowships Open',
    desc: 'Funded fellowship positions open for graduate and undergraduate scholars in edge AI, vision odometry, and TinyML acceleration.',
    badge: 'Vacancies',
    actionType: 'apply',
    actionText: 'Apply for Vacancy',
    icon: GraduationCap,
  },
  {
    id: 'update-3',
    category: 'Robotics Lab',
    date: 'Lab Benchmark',
    title: 'Autonomous UAV Edge Perception Trial Completed',
    desc: 'Field testing real-time visual odometry and edge neural inference algorithms on embedded Jetson computing hardware.',
    badge: 'Robotics',
    link: '/projects',
    actionText: 'View Benchmark',
    icon: Bot,
  },
  {
    id: 'update-4',
    category: 'Student Spotlight',
    date: 'Monthly Honors',
    title: 'Performer of the Month Research Spotlight',
    desc: 'Honoring student researchers and lab fellows for groundbreaking contributions to multi-modal clinical diagnostic models.',
    badge: 'Honors',
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
    badge: 'Grants',
    link: '/grants',
    actionText: 'View Grants',
    icon: Cpu,
  },
]

const coreResearchAreas = [
  {
    icon: Brain,
    title: 'Foundational Models & NLP',
    desc: 'Pretraining multilingual LLMs tailored for low-resource regional dialects with advanced byte-level tokenizers and parameter-efficient fine-tuning.',
    tag: 'Urdu & Multilingual NLP',
  },
  {
    icon: Bot,
    title: 'Autonomous Robotics & Edge AI',
    desc: 'Real-time perception algorithms, spatial visual odometry, and edge TensorRT neural inference pipelines for robotic vehicles and aerial UAVs.',
    tag: 'Robotics & Embedded Vision',
  },
  {
    icon: Database,
    title: 'Clinical Diagnostics & Healthcare',
    desc: 'Deep multi-modal medical imaging classification, diagnostic explainability, and chest radiograph analysis deployed across partner clinics.',
    tag: 'Medical AI Systems',
  },
  {
    icon: Zap,
    title: 'Smart Energy & Infrastructure',
    desc: 'Forecasting power grid surge anomalies, localized microgrid load shedding schedules, and renewable power dispatch with transformer models.',
    tag: 'Grid Intelligence',
  },
  {
    icon: Code,
    title: 'Efficient Computing & TinyML',
    desc: 'Hardware-aware neural architecture search (NAS), INT8 quantization, and ultra-low-latency deployment on FPGAs and embedded SoCs.',
    tag: 'TinyML & Edge Acceleration',
  },
  {
    icon: LineChart,
    title: 'AI Safety & Alignment',
    desc: 'Ensuring robust, unbiased, and safe deployment of intelligent systems in critical healthcare, power grids, and national infrastructure.',
    tag: 'AI Safety',
  },
]

export default function Home() {
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'projects' | 'members'>('projects')
  const updatesScrollRef = useRef<HTMLDivElement>(null)

  // Side panel opens on click only (no hover trigger)
  const openDrawer = (tab: 'projects' | 'members') => {
    setDrawerTab(tab)
    setDrawerOpen(true)
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

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-transparent overflow-hidden">
      {/* ── 1. HERO SHOWCASE (Ai2-Inspired Middle Alignment: Logo Left, Slogan Right, Background Carousel) ── */}
      <section className="relative pt-3 sm:pt-4 md:pt-6 pb-6 sm:pb-8 px-3 sm:px-6 md:px-8 max-w-[1360px] mx-auto z-10">
        <HeroBackgroundSlideshow autoPlayInterval={5000}>
          {/* Middle Alignment matching Ai2: Logo on Left, Slogan on Right, Center Aligned */}
          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 p-6 sm:p-8 md:p-10 rounded-3xl bg-black/45 backdrop-blur-md border border-white/20 shadow-2xl">
            {/* LOGO ON THE LEFT: Just the mark alone, clean and iconic */}
            <div className="shrink-0 flex items-center justify-center">
              <img
                src={airLabMark}
                alt="AIR Lab Mark"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Subtle vertical separator on desktop */}
            <div className="hidden md:block w-px h-20 bg-white/25 shrink-0" />

            {/* TEXT ON THE RIGHT: Punchy 4-word slogan + small description */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-bold font-head text-white tracking-tight leading-[1.12] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none">
                Where Intelligence Meets Engineering.
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-sans mt-2.5 max-w-lg leading-relaxed font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                Pioneering foundational regional AI, edge perception, and robotics benchmarks for national impact.
              </p>
            </div>
          </div>
        </HeroBackgroundSlideshow>

        {/* ── ACTION BAR DIRECTLY BELOW HERO STAGE (High Contrast on White Canvas) ── */}
        <div className="mt-5 sm:mt-6 flex flex-col md:flex-row items-center justify-between gap-5 p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs">
          {/* Explore Projects & Lab Members Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => openDrawer('projects')}
              className="h-11 sm:h-12 px-6 sm:px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 group flex-1 sm:flex-none"
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Explore Projects</span>
              <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
            </button>

            <button
              type="button"
              onClick={() => openDrawer('members')}
              className="h-11 sm:h-12 px-6 sm:px-7 bg-white hover:bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border-hairline)] text-sm font-semibold rounded-full shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 group flex-1 sm:flex-none"
            >
              <Users className="w-4 h-4 text-[var(--text-subtle)] shrink-0" />
              <span>Lab Members</span>
              <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
            </button>
          </div>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 text-xs sm:text-sm font-sans text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">Quick links:</span>
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
              <Award className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
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
        </div>
      </section>

      {/* ── 2. RECENT UPDATES SECTION (Compact Horizontal Slider Highlighted Distinctly) ── */}
      <section className="py-5 sm:py-7 px-3 sm:px-6 md:px-8 max-w-[1360px] mx-auto relative z-10">
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[var(--bg-surface)] via-[var(--surface-alt)]/35 to-[var(--bg-surface)] border-2 border-[var(--accent-orange)]/30 shadow-md">
          {/* Header Row with Prev/Next Controls */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recent Updates</span>
              </div>
              <span className="text-xs sm:text-sm text-[var(--text-muted)] hidden sm:inline font-medium">
                Latest research breakthroughs, benchmark releases & fellowship opportunities
              </span>
            </div>

            {/* Horizontal Navigation Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollUpdates('left')}
                className="w-8 h-8 rounded-full bg-[var(--bg-page)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous updates"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollUpdates('right')}
                className="w-8 h-8 rounded-full bg-[var(--bg-page)] hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--border-hairline)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
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
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recentUpdates.map(item => {
              const Icon = item.icon
              return (
                <article
                  key={item.id}
                  className="min-w-[280px] sm:min-w-[320px] max-w-[340px] p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/50 shadow-xs hover:shadow-md transition-all shrink-0 snap-start flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20">
                        {item.badge}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-subtle)] font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] text-[var(--accent-orange)] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal mt-2">
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <Link
                        to={item.link!}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT AIR LAB SECTION (Deep Ink Band with High Contrast) ── */}
      <section id="explore-anchor" className="py-12 sm:py-16 px-4 sm:px-8 max-w-[1240px] mx-auto text-left mb-16 relative z-10">
        <div className="bg-[var(--ink-dark)] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden transition-all duration-200 shadow-xl border border-[var(--border-hairline)]">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
              <span>About AIR Lab • NED University</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white leading-tight font-head">
              Empowering Regional AI Innovation at NED University
            </h2>

            <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-6 font-normal">
              The Artificial Intelligence Research Lab (AIR Lab) at NED University is dedicated to pushing the boundaries of machine learning, natural language processing, and computer vision.
            </p>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-10 font-normal">
              Our mission is to develop foundational models optimized for the region&apos;s unique linguistic and infrastructural challenges, ensuring AI benefits all segments of society.
            </p>

            <div className="pt-6 border-t border-white/15 flex flex-wrap gap-4 items-center">
              <Button
                to="/team"
                variant="secondary"
                size="md"
                className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold"
              >
                Meet the Team
              </Button>
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                className="h-10 px-5 rounded-full text-[13.5px] font-medium text-white hover:text-white/80 flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CORE RESEARCH AREAS (High-Contrast Cards on Pure White Canvas) ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-[1240px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[var(--border-hairline)] pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-subtle)] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Frontier Thrusts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-head">
              Core Research Areas
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-md font-normal leading-relaxed">
            Multi-disciplinary inquiry spanning regional foundational models, low-power edge vision, clinical diagnostics, and resilient national infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreResearchAreas.map((area, idx) => {
            const Icon = area.icon
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[var(--accent-orange)] shadow-xs mb-6 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-subtle)] mb-2">
                    {area.tag}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-orange)] transition-colors duration-150 font-head">
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
      </section>

      {/* ── 5. RESEARCH PARTNERS & SPONSORS ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-[1240px] mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-subtle)] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Collaboration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-head">
            Funded by National & Global Partners
          </h2>
        </div>
        <SponsorsGrid />
      </section>

      {/* ── 6. CONTACT & INQUIRIES ── */}
      <ContactSection />

      {/* Student Application Modal */}
      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />

      {/* Interactive Quick Explorer Drawer */}
      <QuickDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialTab={drawerTab}
      />
    </div>
  )
}
