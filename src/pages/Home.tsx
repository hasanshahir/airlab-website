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
      {/* ── 1. FULL-WIDTH HERO SHOWCASE (Pans 100% of the screen horizontally, no padded rectangles) ── */}
      <section className="relative w-full z-10">
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

            {/* TEXT ON THE RIGHT: Clean punchy slogan + concise narrative */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-head text-white tracking-tight leading-[1.08] drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] select-none">
                Where Intelligence Meets Engineering.
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/95 font-sans mt-3.5 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                The Artificial Intelligence Research Lab at NED University is pioneering foundational regional AI models, edge perception, and autonomous robotics benchmarks for national impact.
              </p>

              {/* Action Buttons directly on the photography */}
              <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={() => openDrawer('projects')}
                  className="h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 group"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Explore Projects</span>
                  <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDrawer('members')}
                  className="h-12 px-7 bg-white/90 hover:bg-white text-[var(--ink-dark)] backdrop-blur-md text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 group"
                >
                  <Users className="w-4 h-4 text-[var(--ink-dark)]/70 shrink-0" />
                  <span>Lab Members</span>
                  <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>
              </div>
            </div>
          </div>
        </HeroBackgroundSlideshow>

        {/* ── MINIMAL CLEAN QUICK LINKS STRIP ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-sans text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
            <span>Direct Research Portals:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20">
                      {item.badge}
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
      </section>

      {/* ── 3. ABOUT AIR LAB SECTION (Full Bleed Deep Ink Band) ── */}
      <section id="explore-anchor" className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-20 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1240px] mx-auto">
          <div className="max-w-3xl">
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

      {/* ── 4. CORE RESEARCH AREAS (High-Contrast Clean Cards) ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[var(--border-hairline)] pb-6 gap-4">
          <div>
            <span className="text-xs font-sans uppercase font-bold text-[var(--accent-orange)] tracking-wider">
              LAB INITIATIVES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-head mt-1.5">
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
                className="p-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl flex flex-col justify-between hover:border-[var(--accent-orange)]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[var(--border-hairline)] text-[var(--ink-dark)] flex items-center justify-center group-hover:scale-105 group-hover:text-[var(--accent-orange)] transition-all shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-sans text-[var(--text-muted)] uppercase px-3 py-1 bg-white rounded-full border border-[var(--border-hairline)]">
                      {area.tag}
                    </span>
                  </div>

                  <h3 className="font-head font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors mb-2.5">
                    {area.title}
                  </h3>

                  <p className="text-sm text-[var(--text-muted)] leading-relaxed font-normal">
                    {area.desc}
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-sans font-medium text-[var(--accent-orange)]">
                  <Link to="/projects" className="inline-flex items-center gap-1.5 hover:underline font-semibold">
                    <span>View Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 5. RESEARCH PARTNERS & SPONSORS ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10 border-t border-[var(--border-hairline)]">
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
