import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Target } from 'lucide-react'
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

export default function About() {
  const [activeAim, setActiveAim] = useState<number | null>(null)
  const [activeObjective, setActiveObjective] = useState<number | null>(null)

  return (
    <div className="min-h-screen relative font-sans text-[var(--text-primary)]">
      <div className="pt-16 sm:pt-24 pb-24 px-4 sm:px-8 max-w-[1240px] mx-auto space-y-16 sm:space-y-20">
        {/* ── 1. ABOUT & SUB-LINE (Editorial Split Grid) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left">
          <div className="lg:col-span-5">
            <TitleReveal
              as="h1"
              waitForPreloader
              className="font-head font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-5 tracking-tight"
            >
              About
            </TitleReveal>

            <TitleReveal
              as="h2"
              waitForPreloader
              delay={0.12}
              className="text-xl sm:text-2xl font-head font-semibold text-[var(--accent-orange)] leading-snug tracking-tight"
            >
              Research-grade minds. Production-ready systems. Built for Pakistan.
            </TitleReveal>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] hover:border-[var(--accent-orange)]/35 transition-colors space-y-5 text-[16px] sm:text-[17px] text-[var(--text-muted)] leading-relaxed font-normal"
          >
            <BlurReveal as="p" waitForPreloader delay={0.18}>
              AIR Lab, the artificial intelligence research lab at NED University, turns cutting-edge research into production-ready systems. We build models, fine-tune and optimize open-source ones to run on local hardware, and gather the data to teach them Pakistan’s languages and realities.
            </BlurReveal>
            <BlurReveal as="p" waitForPreloader delay={0.3}>
              Our work spans cybersecurity and adversarial AI, small language models, computer vision, natural language processing, speech-based agents, and agentic AI. We don’t stop at papers and prototypes. We engineer, test, and deploy systems that people and institutions can use. Every project begins with one question: what do the people of Pakistan need?
            </BlurReveal>
          </motion.div>
        </section>

        {/* ── 2. VISION & MISSION (Interactive Bento Pair) ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="group p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-orange)] mb-6 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <TitleReveal
                as="h2"
                className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] mb-4 tracking-tight"
              >
                Vision
              </TitleReveal>
              <BlurReveal
                as="p"
                delay={0.1}
                className="text-[15.5px] sm:text-[17px] text-[var(--text-muted)] leading-relaxed font-normal"
              >
                To make Pakistan a builder of AI, not just a consumer of it, with solutions designed around our people, our languages, and our values.
              </BlurReveal>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="group p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-orange)] mb-6 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <TitleReveal
                as="h2"
                className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] mb-4 tracking-tight"
              >
                Mission
              </TitleReveal>
              <BlurReveal
                as="p"
                delay={0.1}
                className="text-[15.5px] sm:text-[17px] text-[var(--text-muted)] leading-relaxed font-normal"
              >
                To conduct cutting-edge AI research and turn it into secure, production-ready systems built around the languages, data, and needs of the people of Pakistan, while training the next generation of AI researchers and engineers.
              </BlurReveal>
            </div>
          </motion.div>
        </section>

        {/* ── 3. AIMS (Interactive 3-Column Grid) ── */}
        <section className="text-left">
          <div className="mb-6 pb-3 border-b border-[var(--border-hairline)]">
            <TitleReveal
              as="h2"
              className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] tracking-tight"
            >
              Aims
            </TitleReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AIMS.map((aim, i) => {
              const isSelected = activeAim === i
              return (
                <motion.div
                  key={aim}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  onClick={() => setActiveAim(isSelected ? null : i)}
                  className={`p-7 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center ${
                    isSelected
                      ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent-orange)] shadow-[var(--shadow-hover)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)]'
                  }`}
                >
                  <BlurReveal
                    as="p"
                    delay={i * 0.06}
                    className="text-[15.5px] text-[var(--text-muted)] leading-relaxed font-normal"
                  >
                    {aim}
                  </BlurReveal>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── 4. OBJECTIVES (Interactive 3-Column Grid) ── */}
        <section className="text-left">
          <div className="mb-6 pb-3 border-b border-[var(--border-hairline)]">
            <TitleReveal
              as="h2"
              className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] tracking-tight"
            >
              Objectives
            </TitleReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OBJECTIVES.map((obj, i) => {
              const isSelected = activeObjective === i
              return (
                <motion.div
                  key={obj}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  onClick={() => setActiveObjective(isSelected ? null : i)}
                  className={`p-7 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center ${
                    isSelected
                      ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent-orange)] shadow-[var(--shadow-hover)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)]'
                  }`}
                >
                  <BlurReveal
                    as="p"
                    delay={i * 0.05}
                    className="text-[15px] text-[var(--text-muted)] leading-relaxed font-normal"
                  >
                    {obj}
                  </BlurReveal>
                </motion.div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
