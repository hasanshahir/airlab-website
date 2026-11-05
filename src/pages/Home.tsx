import { useState } from 'react'
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
} from 'lucide-react'
import Button from '../components/ui/Button'
import SectionReveal from '../components/ui/SectionReveal'
import StudentApplicationModal from '../components/StudentApplicationModal'
import QuickDrawer from '../components/QuickDrawer'
import SponsorsGrid from '../components/SponsorsGrid'
import ContactSection from '../components/ContactSection'
import HeroBackgroundSlideshow from '../components/HeroBackgroundSlideshow'

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

  // Side panel opens on click only (no hover trigger)
  const openDrawer = (tab: 'projects' | 'members') => {
    setDrawerTab(tab)
    setDrawerOpen(true)
  }

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-[var(--bg-page)] overflow-hidden">
      {/* ── 1. HERO SHOWCASE (Ai2-Inspired: Full Cinematic Background Slideshow + Overlaid Slogan) ── */}
      <section className="relative pt-3 sm:pt-4 md:pt-6 pb-12 sm:pb-16 px-3 sm:px-6 md:px-8 max-w-[1360px] mx-auto z-10">
        <HeroBackgroundSlideshow autoPlayInterval={5000}>
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Top Subheading / Affiliation Pill */}
            <SectionReveal delay={0.08}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white/95 text-xs font-semibold tracking-wide uppercase mb-5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shadow-xs animate-pulse" />
                <span>Department of CSIT • NED University</span>
              </div>
            </SectionReveal>

            {/* Master Slogan Headline (Bold, Geometric, Crisp White matching Ai2) */}
            <SectionReveal delay={0.12}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.035em] leading-[1.06] text-white font-head mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)] select-none">
                Where Intelligence
                <br />
                Meets Engineering.
              </h1>
            </SectionReveal>

            {/* Narrative Subtitle */}
            <SectionReveal delay={0.16}>
              <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-normal max-w-2xl mx-auto mb-7 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
                The Artificial Intelligence Research Lab at NED University is pioneering foundational regional AI models, edge perception, and autonomous robotics benchmarks for national impact.
              </p>
            </SectionReveal>

            {/* Primary Action Buttons (Pill Aesthetic matching Ai2 reference) */}
            <SectionReveal delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
                <button
                  type="button"
                  onClick={() => openDrawer('projects')}
                  className="h-12 sm:h-13 px-8 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm sm:text-base font-semibold rounded-full shadow-xl hover:shadow-2xl hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
                >
                  <Layers className="w-4.5 h-4.5 shrink-0" />
                  <span>Explore Projects</span>
                  <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDrawer('members')}
                  className="h-12 sm:h-13 px-8 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-sm sm:text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
                >
                  <Users className="w-4.5 h-4.5 text-white/90 shrink-0" />
                  <span>Lab Members</span>
                  <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>
              </div>
            </SectionReveal>

            {/* Quick Direct Links */}
            <SectionReveal delay={0.24}>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-sans text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                <Link to="/projects" className="text-white hover:underline font-semibold flex items-center gap-1 transition-colors">
                  All Projects &rarr;
                </Link>
                <span className="text-white/40">&bull;</span>
                <Link to="/grants" className="text-white hover:underline font-semibold flex items-center gap-1 transition-colors">
                  <Award className="w-3.5 h-3.5" />
                  Research Grants &rarr;
                </Link>
                <span className="text-white/40">&bull;</span>
                <Link to="/team" className="text-white hover:underline font-semibold flex items-center gap-1 transition-colors">
                  All Team Members &rarr;
                </Link>
              </div>
            </SectionReveal>
          </div>
        </HeroBackgroundSlideshow>
      </section>

      {/* ── 2. ABOUT AIR LAB SECTION (Deep Ink Band with High Contrast) ── */}
      <section id="explore-anchor" className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto text-left mb-24 relative z-10">
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
              <Button to="/team" variant="secondary" size="md" className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold">
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

      {/* ── 3. CORE RESEARCH AREAS (Craftly High-Contrast Cards on Pure White Canvas) ── */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
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

      {/* ── 4. RESEARCH PARTNERS & SPONSORS ── */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
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

      {/* ── 5. CONTACT & INQUIRIES ── */}
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
