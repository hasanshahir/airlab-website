import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Medal, Mail, FileText, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import SectionReveal from '../components/ui/SectionReveal'
import TitleReveal from '../components/ui/TitleReveal'
import { TextReveal } from '../components/ui/cascade-text'
import BlurReveal from '../components/ui/blur-reveal'
import { getMemberAvatar, DEFAULT_AVATAR } from '../lib/placeholders'
import { extractPerformerPhotos, normalizeDbPerformers } from '../lib/performers'
import { normalizeLinkedInUrl } from '../lib/utils'
import type { PerformerItem, CoAwardeeInfo } from '../types/data'

const Linkedin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.35,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.35,
  }),
}

export default function Performers() {
  const [performersList, setPerformersList] = useState<PerformerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCycleIndex, setActiveCycleIndex] = useState(0)
  const [slideState, setSlideState] = useState({ index: 0, direction: 1 })
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/content/performers', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : []))
      .then((d: PerformerItem[]) => {
        if (!active) return
        if (Array.isArray(d)) {
          setPerformersList(normalizeDbPerformers(d))
          setSlideState({ index: 0, direction: 1 })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const featuredPerformer = performersList[activeCycleIndex] || performersList[0] || null

  const awardees: CoAwardeeInfo[] = useMemo(() => {
    if (!featuredPerformer) return []
    if (Array.isArray(featuredPerformer.coAwardees) && featuredPerformer.coAwardees.length > 0) {
      return featuredPerformer.coAwardees
    }
    return [
      {
        id: featuredPerformer.id,
        name: featuredPerformer.name,
        role: featuredPerformer.role,
        department: featuredPerformer.department,
        categoryTab: featuredPerformer.categoryTab || 'interns',
        email: featuredPerformer.email,
        linkedin: featuredPerformer.linkedin,
        cvUrl: featuredPerformer.cvUrl,
        avatar: featuredPerformer.avatar,
      },
    ]
  }, [featuredPerformer])

  const slides = useMemo(() => {
    if (!featuredPerformer) return []
    const extracted = extractPerformerPhotos(featuredPerformer)
    const ceremonyUrls = Array.from(new Set(extracted.map(p => getMemberAvatar(p.url))))
    if (ceremonyUrls.length > 0) return ceremonyUrls
    const memberAvatars = Array.from(
      new Set(
        awardees
          .map(a => a.avatar)
          .filter((url): url is string => Boolean(url && url.trim()))
          .map(url => getMemberAvatar(url))
      )
    )
    return memberAvatars.length > 0 ? memberAvatars : [DEFAULT_AVATAR]
  }, [featuredPerformer, awardees])

  const safeSlideIndex = slides.length > 0 ? slideState.index % slides.length : 0

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = window.setInterval(() => {
      setSlideState(prev => ({
        index: (prev.index + 1) % slides.length,
        direction: 1,
      }))
    }, 4500)
    return () => window.clearInterval(timer)
  }, [slides.length, isPaused, activeCycleIndex])

  const goToPrevSlide = () => {
    if (slides.length <= 1) return
    setSlideState(prev => ({
      index: (prev.index - 1 + slides.length) % slides.length,
      direction: -1,
    }))
  }

  const goToNextSlide = () => {
    if (slides.length <= 1) return
    setSlideState(prev => ({
      index: (prev.index + 1) % slides.length,
      direction: 1,
    }))
  }

  const goToSlide = (targetIdx: number) => {
    if (targetIdx === safeSlideIndex) return
    setSlideState({
      index: targetIdx,
      direction: targetIdx > safeSlideIndex ? 1 : -1,
    })
  }

  const primaryAwardee = awardees[0]
  const hasMemberProfile = Boolean(primaryAwardee?.id)
  const teamRedirectUrl = hasMemberProfile
    ? `/team?tab=${primaryAwardee?.categoryTab || featuredPerformer?.categoryTab || 'interns'}&member=${primaryAwardee?.id}`
    : '/team?tab=interns'

  return (
    <div className="min-h-screen pt-6 sm:pt-10 pb-14 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Compact Header */}
      <div className="mb-6 text-left max-w-3xl">
        <TitleReveal
          as="h1"
          waitForPreloader
          className="font-head font-semibold text-2xl sm:text-4xl text-[var(--text-primary)] mb-2 tracking-tight"
        >
          Performer of the Month
        </TitleReveal>

        <BlurReveal
          as="p"
          waitForPreloader
          delay={0.12}
          className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal"
        >
          Monthly spotlight honoring the researchers who demonstrated exceptional scientific rigor, landmark publications, and engineering leadership at AIR Lab.
        </BlurReveal>
      </div>

      {/* ── Performer Card or Placeholder ── */}
      {loading ? (
        <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)] max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-sm font-sans text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-orange)]" />
            <span>Loading Performers of the Month...</span>
          </div>
        </div>
      ) : !featuredPerformer ? (
        <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)] max-w-4xl mx-auto">
          <Medal className="w-12 h-12 text-[var(--accent-orange)] mx-auto mb-4 opacity-75" />
          <h3 className="text-xl font-bold font-head text-[var(--text-primary)] mb-2">
            Nomination Cycle in Progress
          </h3>
          <p className="text-sm font-sans text-[var(--text-muted)] max-w-md mx-auto">
            The AIR Lab Performer of the Month spotlight will appear here once finalized by faculty coordinators.
          </p>
        </div>
      ) : (
        <SectionReveal delay={0.15} blur={false}>
          <div className="p-5 sm:p-7 relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl shadow-lg max-w-5xl mx-auto transition-all duration-300 hover:border-[var(--accent-orange)]/40 text-left">
            {/* Month Selector (Most recent first: October to July) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-[var(--border-hairline)] mb-5">
              {performersList.map((p, idx) => (
                <button
                  key={`${p._id || p.id || 'item'}-${p.month || idx}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveCycleIndex(idx)
                    setSlideState({ index: 0, direction: 1 })
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-sans font-medium border transition-colors cursor-pointer ${
                    activeCycleIndex === idx
                      ? 'bg-[var(--ink-dark)] text-white border-[var(--ink-dark)] shadow-xs'
                      : 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]'
                  }`}
                >
                  {p.month}
                </button>
              ))}
            </div>

            {/* Centerpiece Image Slideshow */}
            <div
              className="w-full max-w-[480px] mx-auto mb-5"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={e => {
                if (e.key === 'ArrowLeft') goToPrevSlide()
                if (e.key === 'ArrowRight') goToNextSlide()
              }}
              tabIndex={0}
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-hairline)] shadow-md group bg-[var(--bg-page)]">
                <Link
                  to={teamRedirectUrl}
                  title={`Click to view ${featuredPerformer.name} on Research Interns page`}
                  className="relative block w-full h-full cursor-pointer overflow-hidden"
                >
                  <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <AnimatePresence initial={false} custom={slideState.direction} mode="popLayout">
                      <motion.img
                        key={`${activeCycleIndex}-${slides[safeSlideIndex]}`}
                        src={slides[safeSlideIndex]}
                        custom={slideState.direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3 },
                        }}
                        alt={`${featuredPerformer.name} — ${featuredPerformer.month} photo ${safeSlideIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={e => {
                          e.currentTarget.src = DEFAULT_AVATAR
                        }}
                      />
                    </AnimatePresence>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                </Link>

                {slides.length > 1 && (
                  <>
                    <span className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium pointer-events-none">
                      {safeSlideIndex + 1} / {slides.length}
                    </span>

                    <button
                      type="button"
                      onClick={goToPrevSlide}
                      aria-label="Previous photo"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={goToNextSlide}
                      aria-label="Next photo"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-sans pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium">
                    {featuredPerformer.month}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px]">
                    AIR Lab Awardee
                  </span>
                </div>
              </div>

              {/* Compact Slideshow Dots & Thumbnails */}
              {slides.length > 1 && (
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {slides.map((slideUrl, sIdx) => (
                      <button
                        key={slideUrl + sIdx}
                        type="button"
                        onClick={() => goToSlide(sIdx)}
                        aria-label={`View photo ${sIdx + 1}`}
                        className={`relative w-12 h-8 rounded-md overflow-hidden border transition-all cursor-pointer ${
                          safeSlideIndex === sIdx
                            ? 'border-[var(--accent-orange)] ring-2 ring-[var(--accent-orange)]/30 opacity-100'
                            : 'border-[var(--border-hairline)] opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img
                          src={slideUrl}
                          alt={`Thumbnail ${sIdx + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.src = DEFAULT_AVATAR
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {slides.map((_, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => goToSlide(sIdx)}
                        aria-label={`Go to slide ${sIdx + 1}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          safeSlideIndex === sIdx
                            ? 'w-4 bg-[var(--ink-dark)]'
                            : 'w-1.5 bg-[var(--border-hairline-dark)] hover:bg-[var(--accent-orange)]/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom 2-Column Band: Awardee Identity & Links (Left) + Faculty Commendation & CTA (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-5 border-t border-[var(--border-hairline)]">
              {/* Left: Awardee Header + Detail Cards */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[var(--ink-dark)] text-white inline-block">
                      {featuredPerformer.role || 'Research Intern'}
                    </span>
                    {featuredPerformer.department && (
                      <span className="text-xs text-[var(--text-muted)] font-sans">
                        {featuredPerformer.department}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold font-head text-[var(--text-primary)] tracking-tight leading-snug">
                    {awardees.map((person, idx) => (
                      <span key={person.id || person.name || idx}>
                        {idx > 0 && (
                          <span className="text-[var(--text-muted)] font-normal">
                            {idx === awardees.length - 1 ? ' & ' : ', '}
                          </span>
                        )}
                        <Link
                          to={`/team?tab=${person.categoryTab || 'interns'}&member=${person.id}`}
                          title={`View ${person.name} on Team page`}
                          className="inline-flex items-baseline gap-1 hover:text-[var(--accent-orange)] transition-colors underline decoration-[var(--border-hairline-dark)] underline-offset-4 hover:decoration-[var(--accent-orange)]"
                        >
                          <TextReveal as="span" text={person.name} blurOnReveal staggerDelay={16} duration={250} />
                        </Link>
                      </span>
                    ))}
                  </h2>
                </div>

                {/* Awardee Detail Cards */}
                <div className="space-y-2">
                  {awardees.map((person, idx) => {
                    const cleanLinkedin = normalizeLinkedInUrl(person.linkedin)
                    const cleanCv =
                      person.cvUrl &&
                      person.cvUrl.trim() !== '' &&
                      person.cvUrl.trim() !== '#' &&
                      !person.cvUrl.includes('placeholder')
                        ? person.cvUrl
                        : null

                    return (
                      <div
                        key={person.id || person.name || idx}
                        className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          {person.avatar && (
                            <img
                              src={getMemberAvatar(person.avatar)}
                              alt={person.name}
                              className="w-7 h-7 rounded-full object-cover border border-[var(--border-hairline)] shrink-0 bg-[var(--bg-surface)]"
                              onError={e => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <Link
                            to={`/team?tab=${person.categoryTab || 'interns'}&member=${person.id}`}
                            title={`View ${person.name} profile`}
                            className="text-xs sm:text-sm font-bold font-head text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-colors"
                          >
                            {person.name}
                          </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {cleanLinkedin && (
                            <a
                              href={cleanLinkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[11px] font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <Linkedin className="w-3 h-3" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {cleanCv && (
                            <a
                              href={cleanCv}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[11px] font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Resume</span>
                            </a>
                          )}
                          {person.email && (
                            <a
                              href={`mailto:${person.email}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[11px] font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right: Faculty Commendation & CTA */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                {(featuredPerformer.title || featuredPerformer.achievement || featuredPerformer.researchFocus) && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] space-y-2 flex-1">
                    <span className="text-[11px] font-sans font-semibold text-[var(--ink-dark)] uppercase tracking-wider block">
                      Faculty Commendation &amp; Impact
                    </span>
                    {featuredPerformer.title && (
                      <BlurReveal
                        key={`${featuredPerformer.id}-title`}
                        as="h4"
                        mode="char"
                        className="text-sm sm:text-[15px] font-bold font-head text-[var(--text-primary)] leading-snug"
                      >
                        {featuredPerformer.title}
                      </BlurReveal>
                    )}
                    {featuredPerformer.achievement && (
                      <BlurReveal
                        key={`${featuredPerformer.id}-ach`}
                        as="p"
                        delay={0.08}
                        className="text-xs sm:text-[13px] font-sans text-[var(--text-muted)] leading-relaxed font-normal"
                      >
                        {featuredPerformer.achievement}
                      </BlurReveal>
                    )}
                    {featuredPerformer.researchFocus && (
                      <div className="pt-2 border-t border-[var(--border-hairline)] flex items-start gap-1.5 text-[11px] font-sans text-[var(--text-muted)]">
                        <Sparkles className="w-3 h-3 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] mr-1">Research Focus:</span>
                          <span>{featuredPerformer.researchFocus}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Link
                    to={awardees.length > 1 ? `/team?tab=${primaryAwardee?.categoryTab || 'interns'}` : teamRedirectUrl}
                    className="w-full sm:w-auto px-5 py-2 rounded-full text-xs font-sans font-semibold bg-[var(--ink-dark)] text-white hover:bg-[var(--accent-orange)] hover:text-white transition-all inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>{awardees.length > 1 ? 'View Members' : 'View Member'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      )}
    </div>
  )
}
