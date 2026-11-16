import { useRef, useState } from 'react'
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

/** Geometric SVG: Neural Research-to-Deployment Flow */
function ResearchFlowVisual() {
  return (
    <div className="w-full rounded-2xl bg-white/[0.04] border border-white/12 p-6 sm:p-8 flex items-center justify-center">
      <svg viewBox="0 0 360 170" fill="none" aria-hidden="true" className="w-full max-w-[340px] h-auto">
        <defs>
          <linearGradient id="spineFlowGrad" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0AAFF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#C77DFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          d="M 32 85 C 100 20, 140 150, 180 85 C 220 20, 260 150, 328 85"
          stroke="url(#spineFlowGrad)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path
          d="M 32 85 C 100 140, 140 30, 180 85 C 220 140, 260 30, 328 85"
          stroke="rgba(224,170,255,0.28)"
          strokeWidth="1.4"
        />
        {[
          { cx: 32, cy: 85, r: 9 },
          { cx: 106, cy: 62, r: 5 },
          { cx: 180, cy: 85, r: 12 },
          { cx: 254, cy: 108, r: 5 },
          { cx: 328, cy: 85, r: 9 },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r + 9} fill="rgba(199,125,255,0.12)" />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="#10002B" stroke="#C77DFF" strokeWidth="2" />
            <circle cx={n.cx} cy={n.cy} r={n.r * 0.4} fill="#FFFFFF" />
          </g>
        ))}
      </svg>
    </div>
  )
}

/** Geometric SVG: Orbital Vision */
function VisionOrbitVisual() {
  return (
    <div className="w-full rounded-2xl bg-white text-[var(--ink-dark)] p-6 sm:p-8 flex items-center justify-center shadow-xl">
      <svg viewBox="0 0 260 180" fill="none" aria-hidden="true" className="w-full max-w-[260px] h-auto">
        <circle cx="130" cy="90" r="72" stroke="rgba(123,44,191,0.18)" strokeWidth="1.25" strokeDasharray="4 4" />
        <circle cx="130" cy="90" r="50" stroke="rgba(123,44,191,0.35)" strokeWidth="1.5" />
        <ellipse
          cx="130"
          cy="90"
          rx="84"
          ry="26"
          transform="rotate(-22 130 90)"
          stroke="#7B2CBF"
          strokeOpacity="0.65"
          strokeWidth="1.6"
        />
        <ellipse
          cx="130"
          cy="90"
          rx="84"
          ry="26"
          transform="rotate(22 130 90)"
          stroke="#9D4EDD"
          strokeOpacity="0.45"
          strokeWidth="1.4"
        />
        <circle cx="130" cy="90" r="15" fill="rgba(123,44,191,0.12)" stroke="#7B2CBF" strokeWidth="2" />
        <circle cx="130" cy="90" r="5" fill="#7B2CBF" />
        <circle cx="204" cy="60" r="4.5" fill="#7B2CBF" />
        <circle cx="58" cy="122" r="4" fill="#9D4EDD" />
      </svg>
    </div>
  )
}

/** Geometric SVG: Mission Convergence */
function MissionConvergenceVisual() {
  return (
    <div className="w-full rounded-2xl bg-white/[0.04] border border-white/12 p-6 sm:p-8 flex items-center justify-center">
      <svg viewBox="0 0 280 160" fill="none" aria-hidden="true" className="w-full max-w-[280px] h-auto">
        {[28, 62, 98, 132].map((y, idx) => (
          <path
            key={idx}
            d={`M 24 ${y} C 100 ${y}, 140 80, 236 80`}
            stroke="rgba(199,125,255,0.45)"
            strokeWidth="1.75"
          />
        ))}
        {[28, 62, 98, 132].map((y, idx) => (
          <circle key={idx} cx="24" cy={y} r="5" fill="#10002B" stroke="#C77DFF" strokeWidth="2" />
        ))}
        <circle cx="236" cy="80" r="22" fill="rgba(199,125,255,0.14)" />
        <circle cx="236" cy="80" r="11" fill="#C77DFF" />
        <circle cx="236" cy="80" r="4" fill="#FFFFFF" />
      </svg>
    </div>
  )
}

/** Center spine dot marker */
function SpineNode() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-20 items-center justify-center"
    >
      <span className="w-3 h-3 rounded-full bg-white ring-4 ring-[var(--ink-dark)] shadow-[0_0_16px_rgba(199,125,255,0.9)]" />
    </div>
  )
}

export default function About() {
  const [selectedAim, setSelectedAim] = useState<number>(0)
  const [selectedObjective, setSelectedObjective] = useState<number>(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 35%', 'end 80%'],
  })
  const spineScaleY = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  })

  return (
    <div className="min-h-screen w-full bg-[var(--ink-dark)] text-white relative font-sans">
      {/* ── TOP HEADER BAND ── */}
      <header className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-6 sm:px-10 max-w-[1240px] mx-auto text-left">
        <TitleReveal
          as="h1"
          waitForPreloader
          hoverColor="#C77DFF"
          className="font-head font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4"
        >
          About AIR Lab
        </TitleReveal>

        <BlurReveal
          as="p"
          waitForPreloader
          delay={0.14}
          className="text-lg sm:text-2xl text-white/75 leading-snug font-normal max-w-3xl"
        >
          Research-grade minds. Production-ready systems. Built for Pakistan.
        </BlurReveal>
      </header>

      {/* ── CENTER-SPINE TWO-COLUMN EDITORIAL FLOW ── */}
      <div
        ref={timelineRef}
        className="relative border-t border-white/12 max-w-[1240px] mx-auto px-6 sm:px-10 pb-28"
      >
        {/* Static center spine + scroll-driven glowing progress line */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-white/12"
        >
          <motion.div
            style={{ scaleY: spineScaleY, transformOrigin: 'top' }}
            className="w-full h-full bg-gradient-to-b from-white via-[#C77DFF] to-[#7B2CBF]"
          />
        </div>

        <div className="space-y-16 sm:space-y-24 pt-14 sm:pt-20">
          {/* ── ROW 1: ABOUT (Left: Header + Diagram | Right: Content) ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
          >
            <SpineNode />
            <div className="md:text-right md:pr-4 space-y-5">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="font-head font-bold text-2xl sm:text-3xl text-white tracking-tight"
              >
                About
              </TitleReveal>
              <ResearchFlowVisual />
            </div>

            <div className="md:pl-4 space-y-4 text-left text-[15.5px] sm:text-[17px] text-white/80 leading-relaxed font-normal">
              <BlurReveal as="p" delay={0.08}>
                AIR Lab, the artificial intelligence research lab at NED University, turns cutting-edge research into production-ready systems. We build models, fine-tune and optimize open-source ones to run on local hardware, and gather the data to teach them Pakistan’s languages and realities.
              </BlurReveal>
              <BlurReveal as="p" delay={0.18}>
                Our work spans cybersecurity and adversarial AI, small language models, computer vision, natural language processing, speech-based agents, and agentic AI. We don’t stop at papers and prototypes. We engineer, test, and deploy systems that people and institutions can use. Every project begins with one question: what do the people of Pakistan need?
              </BlurReveal>
            </div>
          </motion.section>

          {/* ── ROW 2: VISION (Left: Diagram | Right: Header + Content) ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
          >
            <SpineNode />
            <div className="md:pr-4 order-2 md:order-1">
              <VisionOrbitVisual />
            </div>

            <div className="md:pl-4 text-left space-y-4 order-1 md:order-2">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="font-head font-bold text-2xl sm:text-3xl text-white tracking-tight"
              >
                Vision
              </TitleReveal>
              <BlurReveal
                as="p"
                delay={0.1}
                className="text-[16px] sm:text-[18px] text-white/85 leading-relaxed font-normal"
              >
                To make Pakistan a builder of AI, not just a consumer of it, with solutions designed around our people, our languages, and our values.
              </BlurReveal>
            </div>
          </motion.section>

          {/* ── ROW 3: MISSION (Left: Header + Content | Right: Diagram) ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
          >
            <SpineNode />
            <div className="md:text-right md:pr-4 space-y-4">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="font-head font-bold text-2xl sm:text-3xl text-white tracking-tight"
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

            <div className="md:pl-4">
              <MissionConvergenceVisual />
            </div>
          </motion.section>

          {/* ── ROW 4: AIMS (Left: Header | Right: Interactive Cards) ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
          >
            <SpineNode />
            <div className="md:text-right md:pr-4 md:pt-4">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="font-head font-bold text-2xl sm:text-3xl text-white tracking-tight"
              >
                Aims
              </TitleReveal>
            </div>

            <div className="md:pl-4 space-y-3.5 text-left">
              {AIMS.map((aim, idx) => {
                const isSelected = selectedAim === idx
                return (
                  <motion.button
                    key={aim}
                    type="button"
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    onClick={() => setSelectedAim(idx)}
                    className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-white text-[var(--ink-dark)] border-white shadow-xl'
                        : 'bg-white/[0.04] text-white/85 border-white/12 hover:bg-white/[0.08] hover:border-[#C77DFF]/50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        isSelected ? 'bg-[var(--accent-orange)]' : 'bg-[#C77DFF]'
                      }`}
                    />
                    <BlurReveal
                      as="span"
                      delay={idx * 0.06}
                      className={`text-[15px] sm:text-[16px] leading-relaxed font-normal ${
                        isSelected ? 'text-[var(--ink-dark)] font-medium' : 'text-white/85'
                      }`}
                    >
                      {aim}
                    </BlurReveal>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>

          {/* ── ROW 5: OBJECTIVES (Left: Interactive Cards | Right: Header) ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
          >
            <SpineNode />
            <div className="md:pr-4 space-y-3.5 text-left order-2 md:order-1">
              {OBJECTIVES.map((obj, idx) => {
                const isSelected = selectedObjective === idx
                return (
                  <motion.button
                    key={obj}
                    type="button"
                    whileHover={{ x: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    onClick={() => setSelectedObjective(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-white text-[var(--ink-dark)] border-white shadow-xl'
                        : 'bg-white/[0.04] text-white/85 border-white/12 hover:bg-white/[0.08] hover:border-[#C77DFF]/50'
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
                      className={`text-[14.5px] sm:text-[15.5px] leading-relaxed font-normal ${
                        isSelected ? 'text-[var(--ink-dark)] font-medium' : 'text-white/85'
                      }`}
                    >
                      {obj}
                    </BlurReveal>
                  </motion.button>
                )
              })}
            </div>

            <div className="md:pl-4 md:pt-4 text-left order-1 md:order-2">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="font-head font-bold text-2xl sm:text-3xl text-white tracking-tight"
              >
                Objectives
              </TitleReveal>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
