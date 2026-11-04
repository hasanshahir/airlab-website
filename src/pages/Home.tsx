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
import HeroSkewedCarousel from '../components/HeroSkewedCarousel'

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
    <div className="w-full relative font-sans text-[var(--text-primary)] overflow-hidden">
      {/* ── 1. HERO SECTION (21st.dev style: Bold Center Typography on top with 3D Skewed Carousel in Background) ── */}
      <section className="relative min-h-[580px] sm:min-h-[660px] md:min-h-[720px] flex items-center justify-center overflow-hidden px-4 sm:px-8 py-16 sm:py-24 text-center">
        {/* BACKGROUND LAYER: 3D Skewed Carousel with Lowered Transparency */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-0 overflow-hidden select-none">
          {/* Subtle Ambient Radial Lighting Glow */}
          <div className="absolute w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-[var(--accent-orange)]/15 rounded-full blur-[120px] pointer-events-none" />

          {/* 3D Carousel with Lowered Transparency & Spread */}
          <div className="w-full opacity-40 sm:opacity-50 hover:opacity-80 transition-opacity duration-700 scale-95 sm:scale-100 transform -translate-y-4 sm:-translate-y-2">
            <HeroSkewedCarousel spread="wide" showControls={true} />
          </div>

          {/* Center Radial Vignette Mask so Foreground Typography is 100% Readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 65% 65% at 50% 50%, var(--bg-page) 30%, transparent 85%)',
              opacity: 0.90,
            }}
          />

          {/* Top & Bottom Soft Fade Transitions into Page Body */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--bg-page)] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-page)] to-transparent pointer-events-none" />
        </div>

        {/* FOREGROUND LAYER: Sleek Centered Typography & Primary Action Buttons (21st.dev Style) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Department / Affiliation Badge */}
          <SectionReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-muted)] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
              <span>DEPARTMENT OF CSIT &bull; NED UNIVERSITY</span>
            </div>
          </SectionReveal>

          {/* Giant, Commanding Modernist Headline */}
          <SectionReveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black tracking-[-0.04em] leading-[0.96] text-[var(--text-primary)] font-head mb-6 max-w-3xl drop-shadow-sm">
              Pioneering Frontier AI.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-green)] to-[var(--text-primary)]">
                Building Real Impact.
              </span>
            </h1>
          </SectionReveal>

          {/* Sleek Subtitle */}
          <SectionReveal delay={0.16}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-muted)] max-w-2xl font-normal leading-relaxed mb-8">
              The Artificial Intelligence Research Lab at NED University develops foundational regional models, edge perception, and autonomous robotics benchmarks for national impact.
            </p>
          </SectionReveal>

          {/* Foreground CTA Action Buttons */}
          <SectionReveal delay={0.22}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => openDrawer('projects')}
                className="h-13 px-8 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
              >
                <Layers className="w-5 h-5 shrink-0" />
                <span>Explore Projects</span>
                <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
              </button>

              <button
                type="button"
                onClick={() => openDrawer('members')}
                className="h-13 px-8 bg-[var(--bg-surface)]/95 backdrop-blur-md hover:bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border-hairline-dark)] text-base font-semibold rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
              >
                <Users className="w-5 h-5 text-[var(--ink-dark)] shrink-0" />
                <span>Lab Members</span>
                <span className="text-sm font-sans group-hover:translate-x-0.5 transition-transform">↳</span>
              </button>
            </div>
          </SectionReveal>

          {/* Quick Direct Navigation Links */}
          <SectionReveal delay={0.28}>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-sans text-[var(--text-muted)]">
              <Link to="/projects" className="text-[var(--accent-orange)] hover:underline font-semibold flex items-center gap-1">
                All Projects &rarr;
              </Link>
              <span>&bull;</span>
              <Link to="/grants" className="text-[var(--ink-dark)] hover:underline font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Active Grants &rarr;
              </Link>
              <span>&bull;</span>
              <Link to="/team" className="text-[var(--text-primary)] hover:underline font-semibold flex items-center gap-1">
                All Team Members &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 2. ABOUT AIR LAB SECTION (Deep Ink Band with High Contrast) ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto text-left mb-24 relative z-10">
        <div className="bg-[var(--ink-dark)] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden transition-all duration-200 shadow-xl border border-[var(--border-hairline)]">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-sans font-semibold uppercase mb-5 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
              ABOUT AIR LAB &bull; NED UNIVERSITY
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-head font-medium text-white tracking-tight mb-6 leading-tight">
              Empowering Regional AI Innovation at NED University
            </h2>

            <div className="space-y-4 text-base sm:text-[17px] text-white/95 leading-relaxed font-normal [&>p]:text-white/95">
              <p>
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is dedicated to pushing the boundaries of machine learning, natural language processing, and computer vision.
              </p>
              <p>
                Our mission is to develop foundational models optimized for the region's unique linguistic and infrastructural challenges, ensuring AI benefits all segments of society.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap gap-4">
              <Button to="/team" variant="secondary" size="md" className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold">
                Meet the Team
              </Button>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="h-10 px-6 rounded-full border border-white/30 text-white hover:bg-white/10 text-[13.5px] font-medium tracking-tight transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CORE RESEARCH AREAS (Generous 24px Rounded Stone Cards) ── */}
      <section className="py-16 px-6 sm:px-10 max-w-[1240px] mx-auto mb-24 text-left relative z-10">
        <div className="max-w-2xl mb-14 relative z-10">
          <span className="text-xs font-sans uppercase font-bold text-[var(--accent-orange)] tracking-wider">
            LAB INITIATIVES
          </span>
          <h2 className="text-3xl sm:text-4xl font-head font-semibold text-[var(--text-primary)] tracking-tight mt-1.5 mb-3">
            Core Research Areas
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Exploring the frontiers of machine learning, natural language processing, edge computer vision, and autonomous robotics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {coreResearchAreas.map((area, idx) => {
            const Icon = area.icon
            return (
              <div
                key={idx}
                className="p-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl flex flex-col justify-between hover:border-[var(--accent-orange)]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] text-[var(--ink-dark)] flex items-center justify-center group-hover:scale-105 group-hover:text-[var(--accent-orange)] transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-sans text-[var(--text-muted)] uppercase px-3 py-1 bg-[var(--bg-page)] rounded-full border border-[var(--border-hairline)]">
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

      {/* ── 4. SPONSORS & INSTITUTIONAL PARTNERS (Clean Rounded Cards Grid) ── */}
      <section className="py-16 px-6 sm:px-10 max-w-[1240px] mx-auto text-left mb-24 relative z-10 border-t border-[var(--border-hairline)]">
        <SponsorsGrid />
      </section>

      {/* ── 5. CONTACT SECTION ── */}
      <section className="py-10 px-6 sm:px-10 max-w-[1240px] mx-auto text-left mb-24 relative z-10">
        <ContactSection />
      </section>

      {/* Quick Directory Side Panel (opens on button click) */}
      <QuickDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialTab={drawerTab}
      />

      {/* Student Fellowship Modal */}
      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  )
}
