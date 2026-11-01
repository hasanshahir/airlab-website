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
      {/* ── 1. HERO SECTION (High whitespace, calm editorial rhythm) ── */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-6 sm:px-10 max-w-[1240px] mx-auto text-left relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-[var(--border-hairline)]">
          {/* Left Column */}
          <SectionReveal delay={0.05} className="lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)] mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
                <span>DEPARTMENT OF CSIT &bull; NED UNIVERSITY</span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.035em] leading-[0.95] text-[var(--text-primary)] font-head">
                AIR Lab
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[var(--text-muted)] max-w-md leading-relaxed mt-6 font-normal">
                The Artificial Intelligence Research Lab at NED University is pioneering foundational regional AI models, edge perception, and autonomous robotics benchmarks for national impact.
              </p>
            </div>
          </SectionReveal>

          {/* Right Column */}
          <SectionReveal delay={0.12} className="lg:col-span-7">
            <div className="lg:pl-8 lg:border-l border-[var(--border-hairline)] pt-2 lg:pt-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal tracking-[-0.02em] leading-[1.18] text-[var(--text-primary)] mb-10 font-head">
                Ignite intelligence, computational strength, and breakthrough innovation on every research frontier, turning lab discoveries into impactful real-world systems.
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => openDrawer('projects')}
                  className="h-13 sm:h-14 px-8 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-base font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
                >
                  <Layers className="w-5 h-5 shrink-0" />
                  <span>Explore Projects</span>
                  <span className="text-sm font-mono group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDrawer('members')}
                  className="h-13 sm:h-14 px-8 bg-[var(--bg-surface)] hover:bg-[#E8E2D8] text-[var(--text-primary)] border border-[var(--border-hairline-dark)] text-base font-semibold rounded-full shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
                >
                  <Users className="w-5 h-5 text-[var(--ink-dark)] shrink-0" />
                  <span>Lab Members</span>
                  <span className="text-sm font-mono group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-mono text-[var(--text-muted)] pt-2">
                <span className="text-[var(--text-subtle)]">Quick links:</span>
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
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 2. ABOUT AIR LAB SECTION (Deep Ink Band with High Contrast) ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto text-left mb-24 relative z-10">
        <div className="bg-[var(--ink-dark)] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden transition-all duration-200 shadow-xl border border-[var(--border-hairline)]">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-semibold uppercase mb-5 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
              ABOUT AIR LAB &bull; NED UNIVERSITY
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-head font-medium text-white tracking-tight mb-6 leading-tight">
              Empowering Regional AI Innovation at NED University
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              <p>
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is dedicated to pushing the boundaries of machine learning, natural language processing, and computer vision.
              </p>
              <p>
                Our mission is to develop foundational models optimized for the region's unique linguistic and infrastructural challenges, ensuring AI benefits all segments of society.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap gap-4">
              <Button to="/team" variant="secondary" size="md" className="bg-white text-[var(--ink-dark)] hover:bg-[#F0ECE4] border-transparent font-semibold">
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
          <span className="text-xs font-mono uppercase font-bold text-[var(--accent-orange)] tracking-wider">
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
                    <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase px-3 py-1 bg-[var(--bg-page)] rounded-full border border-[var(--border-hairline)]">
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

                <div className="pt-5 mt-6 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono font-medium text-[var(--accent-orange)]">
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
