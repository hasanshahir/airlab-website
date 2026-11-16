import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import TitleReveal from '../components/ui/TitleReveal'
import BlurReveal from '../components/ui/blur-reveal'

const AIMS = [
  'Advance AI research in security, language, speech, and vision, with a focus on problems that matter locally.',
  'Build practical, efficient AI that works within the data, language, and resource realities of Pakistan.',
  'Close the gap between academic research and real-world deployment.',
]

const OBJECTIVES = [
  'Conduct and publish original research in adversarial AI, NLP, computer vision, and agentic systems.',
  'Develop AI solutions that fit local languages, data, and resource constraints.',
  'Build and share datasets, benchmarks, and tools that reflect Pakistani contexts and users.',
  'Turn research into practical, privacy-preserving prototypes that address real local needs.',
  'Train students through projects, competitions, and mentorship.',
  'Collaborate with industry, government, and academia on locally driven problems.',
]

const SECTIONS = [
  { id: 'about', title: 'About' },
  { id: 'vision', title: 'Vision' },
  { id: 'mission', title: 'Mission' },
  { id: 'aims', title: 'Aims' },
  { id: 'objectives', title: 'Objectives' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

/** Purely geometric SVG flow art: Research -> Engineering -> Deployment */
function ResearchFlowDiagram() {
  return (
    <svg
      viewBox="0 0 360 110"
      fill="none"
      aria-hidden="true"
      className="w-full max-w-[360px] h-auto opacity-85"
    >
      <defs>
        <linearGradient id="airFlowGrad" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C77DFF" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#C77DFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M 28 55 C 95 15, 130 95, 180 55 C 230 15, 265 95, 332 55"
        stroke="url(#airFlowGrad)"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <path
        d="M 28 55 C 95 85, 130 25, 180 55 C 230 85, 265 25, 332 55"
        stroke="rgba(199,125,255,0.28)"
        strokeWidth="1.25"
      />
      {[
        { cx: 28, cy: 55, r: 8 },
        { cx: 104, cy: 48, r: 5 },
        { cx: 180, cy: 55, r: 10 },
        { cx: 256, cy: 62, r: 5 },
        { cx: 332, cy: 55, r: 8 },
      ].map((n, idx) => (
        <g key={idx}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 7} fill="rgba(199,125,255,0.1)" />
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="#10002B" stroke="#C77DFF" strokeWidth="2" />
          <circle cx={n.cx} cy={n.cy} r={n.r * 0.38} fill="#E0AAFF" />
        </g>
      ))}
    </svg>
  )
}

/** Purely geometric SVG orbital/vision art */
function OrbitVisionDiagram() {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
      className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 opacity-90"
    >
      <circle cx="90" cy="90" r="74" stroke="rgba(199,125,255,0.22)" strokeWidth="1.25" strokeDasharray="4 4" />
      <circle cx="90" cy="90" r="52" stroke="rgba(199,125,255,0.4)" strokeWidth="1.5" />
      <ellipse
        cx="90"
        cy="90"
        rx="74"
        ry="26"
        transform="rotate(-24 90 90)"
        stroke="rgba(224,170,255,0.55)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="90"
        cy="90"
        rx="74"
        ry="26"
        transform="rotate(24 90 90)"
        stroke="rgba(157,78,221,0.45)"
        strokeWidth="1.25"
      />
      <circle cx="90" cy="90" r="14" fill="rgba(199,125,255,0.18)" stroke="#C77DFF" strokeWidth="2" />
      <circle cx="90" cy="90" r="5" fill="#E0AAFF" />
      <circle cx="152" cy="64" r="4" fill="#C77DFF" />
      <circle cx="30" cy="118" r="3.5" fill="#9D4EDD" />
    </svg>
  )
}

/** Purely geometric SVG mission convergence diagram */
function ConvergenceDiagram() {
  return (
    <svg
      viewBox="0 0 180 140"
      fill="none"
      aria-hidden="true"
      className="w-32 h-24 sm:w-40 sm:h-28 shrink-0 opacity-90"
    >
      {[24, 52, 80, 108].map((y, idx) => (
        <path
          key={idx}
          d={`M 16 ${y} C 68 ${y}, 92 70, 148 70`}
          stroke="rgba(123,44,191,0.35)"
          strokeWidth="1.75"
        />
      ))}
      {[24, 52, 80, 108].map((y, idx) => (
        <circle key={idx} cx="16" cy={y} r="4.5" fill="#FFFFFF" stroke="#7B2CBF" strokeWidth="2" />
      ))}
      <circle cx="148" cy="70" r="16" fill="rgba(123,44,191,0.12)" />
      <circle cx="148" cy="70" r="8" fill="#7B2CBF" />
      <circle cx="148" cy="70" r="3" fill="#FFFFFF" />
    </svg>
  )
}

export default function About() {
  const [activeSection, setActiveSection] = useState<SectionId>('about')
  const [selectedAim, setSelectedAim] = useState<number>(0)
  const [selectedObjective, setSelectedObjective] = useState<number>(0)

  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    about: null,
    vision: null,
    mission: null,
    aims: null,
    objectives: null,
  })

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start 20%', 'end 80%'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    restDelta: 0.001,
  })

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id)
            }
          })
        },
        { rootMargin: '-32% 0px -48% 0px', threshold: 0.05 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id)
    const el = sectionRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen relative font-sans text-[var(--text-primary)]">
      <div
        ref={contentRef}
        className="pt-14 sm:pt-20 pb-28 px-4 sm:px-8 max-w-[1280px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── LEFT SECTION: STICKY HEADERS & SCROLL SLIDER ── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 text-left">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--ink-dark)] text-white shadow-2xl border border-white/10 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-25 blur-3xl"
                style={{ background: '#9D4EDD' }}
              />

              <div className="relative pl-5">
                {/* Vertical scroll progress track */}
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-white/15 overflow-hidden">
                  <motion.div
                    style={{ scaleY: smoothProgress, transformOrigin: 'top' }}
                    className="w-full h-full bg-gradient-to-b from-[#E0AAFF] via-[#C77DFF] to-[#7B2CBF]"
                  />
                </div>

                <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`relative text-left px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-white/55 hover:text-white/90 hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeAboutHeaderBg"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            className="absolute inset-0 rounded-2xl bg-white/12 border border-[#C77DFF]/45 shadow-sm"
                          />
                        )}
                        <span className="relative z-10 font-head font-bold text-xl sm:text-2xl tracking-tight block">
                          {sec.title}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* ── RIGHT SECTION: SCROLL-ANIMATED CONTENT & VISUAL DIAGRAMS ── */}
          <div className="lg:col-span-8 space-y-8 text-left">
            {/* 1. ABOUT */}
            <motion.section
              id="about"
              ref={(el) => {
                sectionRefs.current.about = el
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="scroll-mt-28 p-8 sm:p-11 rounded-3xl bg-[var(--ink-dark)] text-white border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <TitleReveal
                  as="h1"
                  waitForPreloader
                  hoverColor="#C77DFF"
                  className="font-head font-bold text-3xl sm:text-4xl lg:text-[42px] text-white leading-tight tracking-tight"
                >
                  Research-grade minds. Production-ready systems. Built for Pakistan.
                </TitleReveal>

                <div className="pt-2">
                  <ResearchFlowDiagram />
                </div>

                <div className="space-y-4 text-[16px] sm:text-[17px] text-white/85 leading-relaxed font-normal">
                  <BlurReveal as="p" waitForPreloader delay={0.14}>
                    AIR Lab, the artificial intelligence research lab at NED University, turns cutting-edge research into production-ready systems. We build models, fine-tune and optimize open-source ones to run on local hardware, and gather the data to teach them Pakistan’s languages and realities.
                  </BlurReveal>
                  <BlurReveal as="p" waitForPreloader delay={0.26}>
                    Our work spans cybersecurity and adversarial AI, small language models, computer vision, natural language processing, speech-based agents, and agentic AI. We don’t stop at papers and prototypes. We engineer, test, and deploy systems that people and institutions can use. Every project begins with one question: what do the people of Pakistan need?
                  </BlurReveal>
                </div>
              </div>
            </motion.section>

            {/* 2. VISION */}
            <motion.section
              id="vision"
              ref={(el) => {
                sectionRefs.current.vision = el
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="scroll-mt-28 p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] hover:border-[var(--accent-orange)]/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <TitleReveal
                    as="h2"
                    className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] tracking-tight"
                  >
                    Vision
                  </TitleReveal>
                  <BlurReveal
                    as="p"
                    delay={0.1}
                    className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal"
                  >
                    To make Pakistan a builder of AI, not just a consumer of it, with solutions designed around our people, our languages, and our values.
                  </BlurReveal>
                </div>
                <OrbitVisionDiagram />
              </div>
            </motion.section>

            {/* 3. MISSION */}
            <motion.section
              id="mission"
              ref={(el) => {
                sectionRefs.current.mission = el
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="scroll-mt-28 p-8 sm:p-10 rounded-3xl bg-[var(--ink-dark)] text-white border border-white/10 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <TitleReveal
                    as="h2"
                    hoverColor="#C77DFF"
                    className="text-2xl sm:text-3xl font-bold font-head text-white tracking-tight"
                  >
                    Mission
                  </TitleReveal>
                  <BlurReveal
                    as="p"
                    delay={0.1}
                    className="text-[16px] sm:text-[18px] text-white/85 leading-relaxed font-normal"
                  >
                    To conduct cutting-edge AI research and turn it into secure, production-ready systems built around the languages, data, and needs of the people of Pakistan, while training the next generation of AI researchers and engineers.
                  </BlurReveal>
                </div>
                <div className="p-3 rounded-2xl bg-white/95 shadow-md shrink-0">
                  <ConvergenceDiagram />
                </div>
              </div>
            </motion.section>

            {/* 4. AIMS */}
            <motion.section
              id="aims"
              ref={(el) => {
                sectionRefs.current.aims = el
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="scroll-mt-28 p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] space-y-6"
            >
              <TitleReveal
                as="h2"
                className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] tracking-tight"
              >
                Aims
              </TitleReveal>

              <div className="grid grid-cols-1 gap-3.5">
                {AIMS.map((aim, idx) => {
                  const isSelected = selectedAim === idx
                  return (
                    <motion.button
                      key={aim}
                      type="button"
                      whileHover={{ x: 6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => setSelectedAim(idx)}
                      className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? 'bg-[var(--ink-dark)] text-white border-[var(--ink-dark)] shadow-lg'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                          isSelected ? 'bg-[#C77DFF]' : 'bg-[var(--accent-orange)]/45'
                        }`}
                      />
                      <BlurReveal
                        as="span"
                        delay={idx * 0.06}
                        className={`text-[15.5px] sm:text-[16.5px] leading-relaxed font-normal ${
                          isSelected ? 'text-white/95' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {aim}
                      </BlurReveal>
                    </motion.button>
                  )
                })}
              </div>
            </motion.section>

            {/* 5. OBJECTIVES */}
            <motion.section
              id="objectives"
              ref={(el) => {
                sectionRefs.current.objectives = el
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="scroll-mt-28 p-8 sm:p-10 rounded-3xl bg-[var(--ink-dark)] text-white border border-white/10 shadow-2xl space-y-6"
            >
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="text-2xl sm:text-3xl font-bold font-head text-white tracking-tight"
              >
                Objectives
              </TitleReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OBJECTIVES.map((obj, idx) => {
                  const isSelected = selectedObjective === idx
                  return (
                    <motion.button
                      key={obj}
                      type="button"
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      onClick={() => setSelectedObjective(idx)}
                      className={`text-left p-6 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-white text-[var(--ink-dark)] border-white shadow-xl'
                          : 'bg-white/5 text-white/85 border-white/12 hover:bg-white/10 hover:border-[#C77DFF]/50'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          isSelected ? 'bg-[var(--accent-orange)]' : 'bg-[#C77DFF]'
                        }`}
                      />
                      <BlurReveal
                        as="span"
                        delay={idx * 0.05}
                        className={`text-[15px] leading-relaxed font-normal ${
                          isSelected ? 'text-[var(--ink-dark)] font-medium' : 'text-white/85'
                        }`}
                      >
                        {obj}
                      </BlurReveal>
                    </motion.button>
                  )
                })}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  )
}
