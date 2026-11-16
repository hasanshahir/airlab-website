import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Code,
  LineChart,
  Layers,
  Award,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react'
import Button from '../components/ui/Button'
import TitleReveal from '../components/ui/TitleReveal'
import BlurReveal from '../components/ui/blur-reveal'
import SponsorsGrid from '../components/SponsorsGrid'
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero'
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel'
import { HandwritingText } from '@/components/ui/handwriting-text'
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
  useHoverSliderContext,
} from '@/components/ui/animated-slideshow'

const HERO_CAROUSEL_IMAGES = [
  {
    src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
    alt: 'AIR Lab Research & Prototyping Laboratory',
  },
  {
    src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
    alt: 'High Performance Neural Computing Rig',
  },
  {
    src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
    alt: 'Interdisciplinary Student Collaboration & ML Pipelines',
  },
  {
    src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
    alt: 'AIR Lab Research Fellows Station',
  },
  {
    src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
    alt: 'Department of CSIT & AIR Lab Entrance',
  },
]

const coreResearchAreas = [
  {
    icon: Brain,
    title: 'Foundational Models & NLP',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80',
    desc: 'Pretraining multilingual LLMs tailored for low-resource regional dialects with advanced byte-level tokenizers and parameter-efficient fine-tuning.',
  },
  {
    icon: ShieldAlert,
    title: 'Adversarial AI',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    desc: 'Investigating neural network vulnerabilities, model jailbreaking, prompt injection mitigation, and robust defense benchmarks for high-stakes AI systems.',
  },
  {
    icon: ShieldCheck,
    title: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
    desc: 'Autonomous cyber defense, encrypted traffic analysis, zero-trust infrastructure, and automated vulnerability intelligence to safeguard digital ecosystems.',
  },
  {
    icon: Terminal,
    title: 'Software Development',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    desc: 'High-performance AI engineering, production-grade microservices, scalable distributed inference pipelines, and intelligent software systems.',
  },
  {
    icon: Code,
    title: 'Efficient Computing & TinyML',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    desc: 'Hardware-aware neural architecture search (NAS), INT8 quantization, and ultra-low-latency deployment on FPGAs and embedded SoCs.',
  },
  {
    icon: LineChart,
    title: 'AI Safety & Alignment',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    desc: 'Ensuring robust, unbiased, and safe deployment of intelligent systems in critical healthcare, power grids, and national infrastructure.',
  },
]

function ActiveResearchAreaCaption({
  onSelectArea,
}: {
  onSelectArea: (title: string) => void
}) {
  const { activeSlide } = useHoverSliderContext()
  const active = coreResearchAreas[activeSlide] ?? coreResearchAreas[0]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => onSelectArea(active.title)}
      className="group mt-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] cursor-pointer transition-colors text-left"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={active.title}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] sm:text-base text-[var(--text-muted)] leading-snug font-normal"
        >
          {active.desc}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

function ResearchAreaTrackRow({
  area,
  index,
  onSelect,
}: {
  area: (typeof coreResearchAreas)[number]
  index: number
  onSelect: (title: string) => void
}) {
  const { activeSlide, changeSlide } = useHoverSliderContext()
  const isActive = activeSlide === index

  return (
    <button
      type="button"
      onMouseEnter={() => changeSlide(index)}
      onFocus={() => changeSlide(index)}
      onClick={() => onSelect(area.title)}
      className="group w-full text-left cursor-pointer bg-transparent border-0 py-1 px-0 focus:outline-none flex items-baseline gap-3.5"
    >
      <span
        className={`text-xs font-mono font-semibold tabular-nums transition-colors duration-200 shrink-0 ${isActive
            ? 'text-[var(--accent-orange)]'
            : 'text-[var(--text-subtle)]/45 group-hover:text-[var(--accent-orange)]/75'
          }`}
      >
        0{index + 1}
      </span>
      <TextStaggerHover
        index={index}
        className="font-head text-xl sm:text-2xl xl:text-[28px] font-bold uppercase tracking-tight leading-tight text-[var(--text-primary)]"
        text={area.title}
      />
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [carouselVersion, setCarouselVersion] = useState<'v1' | 'v2'>('v1')
  const [researchLayout, setResearchLayout] = useState<'grid' | 'slideshow'>('grid')

  const heroOverlay = (
    <div className="relative z-10 flex h-full w-full max-w-4xl mx-auto flex-col items-center justify-center px-6 text-center pointer-events-none">
      {/* Clean high-visibility radial light scrim behind the text so the carousel stays calm and legible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] max-w-3xl h-72 sm:h-80 -z-10 rounded-full blur-xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.78) 52%, rgba(255, 255, 255, 0.25) 82%, transparent 100%)',
        }}
      />

      <h1
        className="w-full max-w-4xl text-center text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.12] tracking-tight text-zinc-900 font-head select-none pointer-events-auto"
        style={{
          textShadow: '0 2px 20px rgba(255, 255, 255, 0.98)',
        }}
      >
        <span className="block sm:whitespace-nowrap">Where Intelligence Meets</span>
        <span className="mt-1.5 flex items-center justify-center w-full">
          <HandwritingText
            words={[
              'Engineering.',
              'Creativity.',
              'Innovation.',
              'Discovery.',
              'Impact.',
            ]}
            className="text-[var(--accent-orange)]"
            height="1.15em"
            strokeWidth={1.8}
          />
        </span>
      </h1>

      {/* Tactile Action Button centered directly below the text */}
      <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3.5 pointer-events-auto">
        <Link
          to="/projects"
          className="h-11 sm:h-12 px-7 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-semibold rounded-full border border-white/40 shadow-[0_10px_28px_rgba(123,44,191,0.34)] hover:shadow-[0_14px_34px_rgba(123,44,191,0.48)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Explore Projects</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="w-full relative font-sans text-[var(--text-primary)] bg-transparent overflow-hidden">
      {/* ── 1. FULL-WIDTH HERO SHOWCASE (V1 Curved / V2 Coverflow) ── */}
      <section className="relative w-full z-10 bg-[var(--bg-page)]">
        <AnimatePresence mode="wait" initial={false}>
          {carouselVersion === 'v1' ? (
            <motion.div
              key="hero-v1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <TiltedGridHero
                images={HERO_CAROUSEL_IMAGES}
                tileHeight={52}
                speed={6}
                axis={50}
                gap={4}
                curve={72}
                imageClassName="opacity-65 saturate-[0.75] brightness-[1.04]"
                className="h-[400px] sm:h-[520px] md:h-[600px] lg:h-[640px] w-full bg-transparent"
              >
                {heroOverlay}
              </TiltedGridHero>
            </motion.div>
          ) : (
            <motion.div
              key="hero-v2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <CoverflowCarousel
                slides={HERO_CAROUSEL_IMAGES}
                autoPlay
                transitionDuration={850}
                pauseDuration={850}
                cardWidth="min(80cqh, 74cqw)"
                gap={-0.06}
                label="AIR Lab Hero Coverflow Carousel"
                className="h-[400px] sm:h-[520px] md:h-[600px] lg:h-[640px] w-full bg-transparent"
              >
                {heroOverlay}
              </CoverflowCarousel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CAROUSEL VERSION TOGGLE (V1 / V2) RIGHT BELOW THE CAROUSEL ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-1.5 flex items-center justify-center">
          <div
            role="radiogroup"
            aria-label="Hero Carousel Version"
            className="inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs"
          >
            {(
              [
                { id: 'v1', label: 'V1 · Curved' },
                { id: 'v2', label: 'V2 · Coverflow' },
              ] as const
            ).map((option) => {
              const isActive = carouselVersion === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setCarouselVersion(option.id)}
                  className={`relative px-3.5 py-1 rounded-full text-xs font-semibold transition-colors duration-180 cursor-pointer select-none ${isActive
                    ? 'text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeHeroCarouselVersionPill"
                      className="absolute inset-0 rounded-full bg-[var(--accent-orange)] shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── MINIMAL CLEAN QUICK LINKS STRIP ── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 text-xs sm:text-sm font-sans text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
          <Link
            to="/projects"
            className="group px-3 py-1 rounded-full bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-surface)] text-[var(--accent-orange)] font-semibold flex items-center gap-1.5 border border-[var(--border-hairline)] transition-all"
          >
            <span>All Projects</span>
          </Link>
          <span className="text-[var(--border-hairline)] hidden sm:inline">•</span>
          <Link
            to="/grants"
            className="group px-3 py-1 rounded-full hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Active Grants</span>
          </Link>
          <span className="text-[var(--border-hairline)] hidden sm:inline">•</span>
          <Link
            to="/team"
            className="group px-3 py-1 rounded-full hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-all"
          >
            <span>All Team Members</span>
          </Link>
        </div>
      </section>

      {/* ── 2. ABOUT AIR LAB SECTION (Two Columns: Punch Line & Bigger Lab Photo) ── */}
      <section id="explore-anchor" className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-24 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Punch line and about text */}
            <div className="lg:col-span-5 text-left space-y-6">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-head"
              >
                Advancing Cutting-Edge AI & Translating Innovation
              </TitleReveal>

              <BlurReveal
                as="p"
                className="text-base sm:text-lg text-white/85 leading-relaxed font-normal"
              >
                The Artificial Intelligence Research Lab (AIR Lab) at NED University is established to advance cutting-edge artificial intelligence and translate theoretical exploration into real-world impact.
              </BlurReveal>

              <BlurReveal
                as="p"
                delay={0.12}
                className="text-base sm:text-lg text-white/80 leading-relaxed font-normal"
              >
                Bridging academia and industry, we develop intelligent systems that are robust, ethical, explainable, and scalable—shaping the future of AI in Pakistan.
              </BlurReveal>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/about"
                  variant="secondary"
                  size="md"
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>About AIR Lab</span>
                </Button>
              </div>
            </div>

            {/* Right: Bigger AIR Lab Photo */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group"
            >
              <img
                src="/about-lab.jpg"
                alt="AIR Lab NED University Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. CORE RESEARCH AREAS ── */}
      <section className="py-12 sm:py-14 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-[var(--border-hairline)] text-left">
          <TitleReveal
            as="h2"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-head"
          >
            Core Research Areas
          </TitleReveal>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs"
              role="group"
              aria-label="Core Research Areas layout toggle"
            >
              {(
                [
                  { id: 'grid', label: 'All Areas', icon: LayoutGrid },
                  { id: 'slideshow', label: 'Slideshow', icon: SlidersHorizontal },
                ] as const
              ).map((opt) => {
                const isActive = researchLayout === opt.id
                const OptIcon = opt.icon
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResearchLayout(opt.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${isActive
                        ? 'text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="researchAreasLayoutTogglePill"
                        className="absolute inset-0 rounded-full bg-[var(--accent-orange)] shadow-xs"
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                    )}
                    <OptIcon className="relative z-10 w-3.5 h-3.5" />
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            <Button
              to="/projects"
              size="sm"
              arrow
              className="inline-flex items-center gap-2 font-semibold px-5 shrink-0"
            >
              <span>See Projects</span>
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {researchLayout === 'grid' ? (
            <motion.div
              key="research-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {coreResearchAreas.map((area, idx) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  onClick={() =>
                    navigate(`/projects?area=${encodeURIComponent(area.title)}`)
                  }
                  className="group rounded-2xl bg-[var(--bg-surface)]/90 border border-[var(--border-hairline)] overflow-hidden hover:border-[var(--accent-orange)]/45 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-colors duration-200 cursor-pointer flex flex-col text-left"
                >
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[var(--ink-dark)]">
                    <img
                      src={area.image}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-project.svg'
                      }}
                      alt={area.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
                    <h3 className="absolute bottom-2.5 left-3.5 right-3.5 font-head text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                      {area.title}
                    </h3>
                  </div>
                  <div className="px-4 py-3 flex-1 flex items-center">
                    <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-snug font-normal line-clamp-3">
                      {area.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="research-slideshow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <HoverSlider className="rounded-3xl bg-[var(--bg-surface)]/80 border border-[var(--border-hairline)] p-5 sm:p-8 shadow-[var(--shadow-card)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-10">
                  {/* Left Column: Staggered Hover Titles */}
                  <div className="lg:col-span-6 flex flex-col items-start space-y-2 text-left">
                    {coreResearchAreas.map((area, index) => (
                      <ResearchAreaTrackRow
                        key={area.title}
                        area={area}
                        index={index}
                        onSelect={(title) =>
                          navigate(`/projects?area=${encodeURIComponent(title)}`)
                        }
                      />
                    ))}
                  </div>

                  {/* Right Column: Clipped Animated Image + Active Area Description */}
                  <div className="lg:col-span-6 flex flex-col">
                    <HoverSliderImageWrap className="rounded-2xl overflow-hidden border border-[var(--border-hairline)] shadow-md aspect-[16/10] max-h-[320px] w-full bg-[var(--ink-dark)]">
                      {coreResearchAreas.map((area, index) => (
                        <div
                          key={area.title}
                          onClick={() =>
                            navigate(`/projects?area=${encodeURIComponent(area.title)}`)
                          }
                          className="cursor-pointer group relative"
                        >
                          <HoverSliderImage
                            index={index}
                            imageUrl={area.image}
                            src={area.image}
                            alt={area.title}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-project.svg'
                            }}
                            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="eager"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </HoverSliderImageWrap>

                    <ActiveResearchAreaCaption
                      onSelectArea={(title) =>
                        navigate(`/projects?area=${encodeURIComponent(title)}`)
                      }
                    />
                  </div>
                </div>
              </HoverSlider>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── 5. TEAM SHOWCASE (Guided by faculty, driven by students, built for Pakistan) ── */}
      <section className="w-full bg-[var(--ink-dark)] text-white py-16 sm:py-24 px-6 sm:px-10 relative z-10 border-y border-[var(--border-hairline)]">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Team punchline & text */}
            <div className="lg:col-span-5 text-left space-y-6">
              <TitleReveal
                as="h2"
                hoverColor="#C77DFF"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-head leading-tight"
              >
                Guided by faculty, driven by students, built for Pakistan.
              </TitleReveal>

              <BlurReveal
                as="p"
                className="text-base sm:text-lg text-white/85 leading-relaxed font-normal"
              >
                Behind every system is a team that cares about Pakistan. Our interdisciplinary team brings together faculty principal investigators, research interns, and student scholars solving real problems at the forefront of artificial intelligence.
              </BlurReveal>

              <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 items-center">
                <Button
                  to="/team"
                  variant="secondary"
                  size="md"
                  className="bg-white text-[var(--ink-dark)] hover:bg-[var(--surface-alt)] border-transparent font-semibold inline-flex items-center gap-2"
                >
                  <span>Meet the Team</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Bigger Team group photo */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[440px] lg:min-h-[500px] bg-white/5 group"
            >
              <img
                src="/team-group.jpg"
                alt="AIR Lab Research Team"
                className="w-full h-full absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COLLABORATORS & SPONSORS ── */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 max-w-[1240px] mx-auto relative z-10 border-t border-[var(--border-hairline)]">
        <SponsorsGrid />
      </section>
    </div>
  )
}
