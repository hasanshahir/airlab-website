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
      {/* ── Ambient Background Color Glows ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[720px] pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
        <div className="absolute top-12 right-[-6%] w-[540px] h-[540px] rounded-full bg-[var(--accent-orange)]/10 blur-[130px]" />
        <div className="absolute top-20 left-[-8%] w-[500px] h-[500px] rounded-full bg-[var(--accent-purple)]/10 blur-[130px]" />
        <div className="absolute top-44 left-[20%] w-[440px] h-[440px] rounded-full bg-[var(--bg-backdrop)]/35 blur-[120px]" />
      </div>

      {/* ── 1. HERO SECTION ── */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-8 max-w-[1280px] mx-auto text-left relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-12 border-b border-[var(--border-hairline)]">
          {/* Left Column */}
          <SectionReveal delay={0.06} className="lg:col-span-5">
            <div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] leading-[0.95] text-[var(--text-primary)] font-head">
                AIR Lab
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] max-w-sm leading-relaxed mt-5 font-normal">
                The Artificial Intelligence Research Lab at NED University is pioneering foundational regional AI models, edge perception, and autonomous robotics benchmarks for national impact.
              </p>
            </div>
          </SectionReveal>

          {/* Right Column */}
          <SectionReveal delay={0.12} className="lg:col-span-7">
            <div className="lg:pl-6 lg:border-l border-[var(--border-hairline)]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)] mb-8 font-head">
                Ignite intelligence, computational strength, and breakthrough innovation on every research frontier, turning lab discoveries into impactful real-world systems.
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => openDrawer('projects')}
                  className="h-14 sm:h-16 px-8 sm:px-10 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-base sm:text-lg font-bold rounded-[2px] shadow-lg shadow-[var(--accent-orange)]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Layers className="w-5 h-5 shrink-0" />
                  <span>Explore Projects</span>
                  <span className="font-mono text-xl group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDrawer('members')}
                  className="h-14 sm:h-16 px-8 sm:px-10 bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] text-[var(--text-primary)] border-2 border-[var(--text-primary)] text-base sm:text-lg font-bold rounded-[2px] shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-[var(--accent-purple)] shrink-0" />
                  <span>Lab Members</span>
                  <span className="font-mono text-xl group-hover:translate-x-0.5 transition-transform">↳</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-[var(--text-muted)] mt-2">
                <span className="text-[var(--text-subtle)]">Quick links:</span>
                <Link to="/projects" className="text-[var(--accent-orange)] hover:underline font-semibold flex items-center gap-1">
                  All Projects &rarr;
                </Link>
                <span>&bull;</span>
                <Link to="/grants" className="text-[var(--accent-purple)] hover:underline font-semibold flex items-center gap-1">
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

      {/* ── 3. FULL-WIDTH ORANGE ABOUT AIR LAB SECTION ── */}
      <section className="py-12 px-6 max-w-[1140px] mx-auto text-left mb-20 relative z-10">
        <div className="bg-[var(--accent-orange)] text-white rounded-[4px] p-8 sm:p-12 relative overflow-hidden transition-all duration-200 shadow-xl border border-[var(--accent-orange)]">
          <div className="max-w-3xl relative z-10">
            <div className="flex items-center gap-2 text-white/90 font-mono font-semibold uppercase text-xs mb-3">
              <div className="w-6 h-[2px] bg-white" />
              ABOUT AIR LAB · NED UNIVERSITY
            </div>
            <h2 className="text-2xl sm:text-4xl font-head font-normal text-white tracking-tight mb-4">
              Empowering Regional AI Innovation at NED University
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              <p>
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is dedicated to pushing the boundaries of machine learning, natural language processing, and computer vision.
              </p>
              <p>
                Our mission is to develop foundational models optimized for the region's unique linguistic and infrastructural challenges, ensuring AI benefits all segments of society.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap gap-4">
              <Button to="/team" variant="secondary" size="md" className="bg-white text-[var(--text-primary)] hover:bg-gray-100 border-white">
                Meet the Team
              </Button>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="h-9 px-4 rounded-[2px] border border-white text-white hover:bg-white/10 text-[13px] font-medium tracking-tight transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Apply for Internship</span>
                <span className="text-[12px] leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. RESEARCH INITIATIVES (6 Sharp Cards) ── */}
      <section className="py-12 px-6 max-w-[1140px] mx-auto mb-20 text-left relative z-10">
        <div className="max-w-2xl mb-12 relative z-10">
          <span className="text-xs font-mono uppercase font-bold text-[var(--accent-purple)]">
            LAB INITIATIVES
          </span>
          <h2 className="text-3xl sm:text-4xl font-head font-normal text-[var(--text-primary)] tracking-tight mt-1">
            Core Research Areas
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2">
            Exploring the frontiers of machine learning, natural language processing, edge computer vision, and autonomous robotics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {coreResearchAreas.map((area, idx) => {
            const Icon = area.icon
            return (
              <div
                key={idx}
                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] flex flex-col justify-between hover:border-[var(--accent-purple)] hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[2px] bg-[var(--accent-purple-light)] text-[var(--accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase px-2 py-0.5 bg-[var(--bg-page)] rounded-[2px] border border-[var(--border-hairline)]">
                      {area.tag}
                    </span>
                  </div>

                  <h3 className="font-head font-medium text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors mb-2">
                    {area.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-normal">
                    {area.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono font-medium text-[var(--accent-orange)]">
                  <Link to="/projects" className="inline-flex items-center gap-1 hover:underline">
                    <span>View Projects</span>
                    <span className="text-[11px] leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 5. SPONSORS & INSTITUTIONAL PARTNERS (Logo Grid + Linking Out) ── */}
      <section className="py-12 px-6 max-w-[1140px] mx-auto text-left mb-20 relative z-10 border-t border-[var(--border-hairline)]">
        <SponsorsGrid />
      </section>

      {/* ── 6. CONTACT SECTION ── */}
      <section className="py-6 px-6 max-w-[1140px] mx-auto text-left mb-20 relative z-10">
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
