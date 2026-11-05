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
  ExternalLink,
  Calendar,
  Newspaper,
} from 'lucide-react'
import Button from '../components/ui/Button'
import AirLabLogo from '../components/AirLabLogo'
import StudentApplicationModal from '../components/StudentApplicationModal'
import QuickDrawer from '../components/QuickDrawer'
import SponsorsGrid from '../components/SponsorsGrid'
import ContactSection from '../components/ContactSection'
import HeroBackgroundSlideshow from '../components/HeroBackgroundSlideshow'

const recentUpdates = [
  {
    id: 'update-1',
    category: 'Curriculum & Accreditation',
    date: 'October 2026',
    title: 'NED CSIT Launches Modern BS Computer Science with Artificial Intelligence Specialization',
    desc: 'The Department of Computer Science & Information Technology has upgraded its undergraduate curriculum, integrating foundational transformer architectures, edge inference, and hands-on laboratory modules powered by AIR Lab’s high-performance computing cluster.',
    badge: 'Academic Milestone',
    link: 'https://cct.neduet.edu.pk/',
    isExternal: true,
  },
  {
    id: 'update-2',
    category: 'Recruitment & Fellowships',
    date: 'September 2026',
    title: 'Call for Student Research Fellows & Graduate Interns — Fall 2026',
    desc: 'AIR Lab is inviting competitive applications for funded research fellowships in low-resource multilingual NLP, autonomous drone perception, and TinyML hardware acceleration. Selected fellows collaborate on national-impact models.',
    badge: 'Vacancies Open',
    actionType: 'apply',
    isExternal: false,
  },
  {
    id: 'update-3',
    category: 'Clinical AI R&D',
    date: 'August 2026',
    title: 'Deployment of Explainable Chest Radiography & Clinical Diagnostic Model',
    desc: 'AIR Lab researchers commenced hospital pilot evaluations of multi-modal vision-language diagnostic models for automated radiological reporting across regional medical partner centers in Karachi.',
    badge: 'Research Pilot',
    link: '/projects',
    isExternal: false,
  },
  {
    id: 'update-4',
    category: 'Community & Benchmarks',
    date: 'July 2026',
    title: 'AI Alliance Hosts Regional Machine Learning Hackathon & Benchmarking Challenge',
    desc: 'Over 200 student researchers participated in model optimization and domain-specific sentiment analysis on Pakistani regional dialects, mentored by AIR Lab faculty and senior engineers.',
    badge: 'Community Hackathon',
    link: 'https://cct.neduet.edu.pk/',
    isExternal: true,
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

  // Side panel opens on click only (no hover trigger)
  const openDrawer = (tab: 'projects' | 'members') => {
    setDrawerTab(tab)
    setDrawerOpen(true)
  }

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-transparent overflow-hidden">
      {/* ── 1. HERO SHOWCASE (Clean Split Layout Over Background Carousel + Full Progress Bar) ── */}
      <section className="relative pt-3 sm:pt-4 md:pt-6 pb-6 sm:pb-8 px-3 sm:px-6 md:px-8 max-w-[1360px] mx-auto z-10">
        <HeroBackgroundSlideshow autoPlayInterval={5000}>
          {/* Top/Main Overlay Row: Logo on Left, Single Slogan Text on Right, Center completely clear */}
          <div className="w-full flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
            {/* LOGO ON THE LEFT */}
            <div className="inline-flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-xl">
              <AirLabLogo height={42} showSubtitle light />
            </div>

            {/* SINGLE TEXT ON THE RIGHT */}
            <div className="text-left md:text-right max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/95 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                <span>Department of CSIT • NED University</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white font-head leading-[1.12] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] select-none">
                Where Intelligence
                <br />
                Meets Engineering.
              </h1>
            </div>
          </div>

          {/* Central stage area is intentionally open and uncluttered — lab photography shines through unobstructed */}
          <div className="flex-1 min-h-[160px] sm:min-h-[220px]" />
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

      {/* ── 2. RECENT UPDATES SECTION (Authoritative Academic Dispatches & News from NED CSIT) ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-[1240px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[var(--border-hairline)] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--accent-orange)] text-xs font-bold uppercase tracking-wider mb-3 border border-[var(--border-hairline)]">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Dispatches & Announcements</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-head">
              Recent Updates
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://cct.neduet.edu.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition-all shadow-xs hover:shadow-sm"
            >
              <span>NED CSIT Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentUpdates.map(item => (
            <article
              key={item.id}
              className="group relative p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20">
                    {item.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-orange)] transition-colors duration-150 font-head leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-subtle)] font-medium">
                  {item.category}
                </span>
                {item.actionType === 'apply' ? (
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Apply for Vacancy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : item.isExternal ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Dispatch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={item.link!}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Explore Research</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 3. ABOUT AIR LAB SECTION (Deep Ink Band with High Contrast) ── */}
      <section id="explore-anchor" className="py-14 sm:py-18 px-4 sm:px-8 max-w-[1240px] mx-auto text-left mb-16 relative z-10">
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
