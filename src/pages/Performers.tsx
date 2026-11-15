import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Medal, Mail, FileText, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import SectionReveal from '../components/ui/SectionReveal'
import TitleReveal from '../components/ui/TitleReveal'
import { getMemberAvatar, DEFAULT_AVATAR } from '../lib/placeholders'
import { getPerformers } from '../lib/data'
import { extractPerformerPhotos, mergePerformersWithLocal } from '../lib/performers'
import type { PerformerItem, CoAwardeeInfo } from '../types/data'

const Linkedin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export default function Performers() {
  const [performersList, setPerformersList] = useState<PerformerItem[]>(() => getPerformers())
  const [activeCycleIndex, setActiveCycleIndex] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetch('/api/content/performers', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : []))
      .then((d: PerformerItem[]) => {
        if (!Array.isArray(d) || d.length === 0) return
        const merged = mergePerformersWithLocal(d, getPerformers())
        setPerformersList(merged)
        setActiveSlideIndex(0)
      })
      .catch(() => {})
  }, [])

  const featuredPerformer = performersList[activeCycleIndex] || performersList[0] || null

  const slides = useMemo(() => {
    if (!featuredPerformer) return []
    const extracted = extractPerformerPhotos(featuredPerformer)
    const unique = Array.from(new Set(extracted.map(p => getMemberAvatar(p.url))))
    return unique.length > 0 ? unique : [DEFAULT_AVATAR]
  }, [featuredPerformer])

  const safeSlideIndex = slides.length > 0 ? activeSlideIndex % slides.length : 0

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = window.setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [slides.length, isPaused, activeCycleIndex])

  const goToPrevSlide = () => {
    if (slides.length <= 1) return
    setActiveSlideIndex(prev => (prev - 1 + slides.length) % slides.length)
  }

  const goToNextSlide = () => {
    if (slides.length <= 1) return
    setActiveSlideIndex(prev => (prev + 1) % slides.length)
  }

  const coAwardees: CoAwardeeInfo[] = Array.isArray(featuredPerformer?.coAwardees)
    ? featuredPerformer.coAwardees
    : []

  const hasMemberProfile = Boolean(featuredPerformer?.id?.startsWith('ri-'))
  const teamRedirectUrl = hasMemberProfile
    ? `/team?tab=${featuredPerformer?.categoryTab || 'interns'}&member=${featuredPerformer?.id}`
    : '/team?tab=interns'

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <TitleReveal
          as="h1"
          waitForPreloader
          className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight"
        >
          Performer of the Month
        </TitleReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Monthly spotlight honoring the researchers who demonstrated exceptional scientific rigor, landmark publications, and engineering leadership at AIR Lab.
          </p>
        </SectionReveal>
      </div>

      {/* ── Performer Card or Placeholder ── */}
      {!featuredPerformer ? (
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
        <SectionReveal delay={0.2}>
          <div className="p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl shadow-lg max-w-5xl mx-auto transition-all duration-300 hover:border-[var(--accent-orange)]/40 text-left">
            {/* Top Month Selector (July to October) */}
            <div className="flex flex-wrap items-center gap-2.5 pb-6 sm:pb-8 border-b border-[var(--border-hairline)] mb-8">
              {performersList.map((p, idx) => (
                <button
                  key={`${p.id || 'item'}-${p.month || idx}`}
                  type="button"
                  onClick={() => {
                    setActiveCycleIndex(idx)
                    setActiveSlideIndex(0)
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors cursor-pointer ${
                    activeCycleIndex === idx
                      ? 'bg-[var(--ink-dark)] text-white border-[var(--ink-dark)] shadow-xs'
                      : 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]'
                  }`}
                >
                  {p.month}
                </button>
              ))}
            </div>

            {/* Member Profile Showcase with Interactive Photo Slideshow */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 sm:gap-10 mb-8">
              {/* Main Image Slideshow */}
              <div
                className="w-full lg:w-[460px] shrink-0"
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
                <div className="relative w-full aspect-[4/3] sm:h-80 lg:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border-hairline)] shadow-md group bg-[var(--bg-page)]">
                  <Link
                    to={teamRedirectUrl}
                    title={`Click to view ${featuredPerformer.name} on Research Interns page`}
                    className="block w-full h-full cursor-pointer"
                  >
                    <img
                      key={slides[safeSlideIndex]}
                      src={slides[safeSlideIndex]}
                      alt={`${featuredPerformer.name} — ${featuredPerformer.month} photo ${safeSlideIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => {
                        e.currentTarget.src = DEFAULT_AVATAR
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  </Link>

                  {slides.length > 1 && (
                    <>
                      <span className="absolute top-3.5 right-3.5 z-10 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-sans font-medium pointer-events-none">
                        {safeSlideIndex + 1} / {slides.length}
                      </span>

                      <button
                        type="button"
                        onClick={goToPrevSlide}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={goToNextSlide}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-xs font-sans pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-medium">
                      {featuredPerformer.month}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px]">
                      AIR Lab Awardee
                    </span>
                  </div>
                </div>

                {/* Slideshow Dots & Thumbnails */}
                {slides.length > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {slides.map((slideUrl, sIdx) => (
                        <button
                          key={slideUrl + sIdx}
                          type="button"
                          onClick={() => setActiveSlideIndex(sIdx)}
                          aria-label={`View photo ${sIdx + 1}`}
                          className={`relative w-14 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
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
                          onClick={() => setActiveSlideIndex(sIdx)}
                          aria-label={`Go to slide ${sIdx + 1}`}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            safeSlideIndex === sIdx
                              ? 'w-5 bg-[var(--ink-dark)]'
                              : 'w-2 bg-[var(--border-hairline-dark)] hover:bg-[var(--accent-orange)]/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Performer Details: Clickable Name(s), Department, Research Focus, Links */}
              <div className="flex-1 w-full space-y-4 text-left">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[var(--ink-dark)] text-white inline-block">
                      {featuredPerformer.role || 'Research Intern'}
                    </span>
                  </div>

                  {coAwardees.length > 0 ? (
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-head text-[var(--text-primary)] tracking-tight leading-snug">
                      {coAwardees.map((person, idx) => (
                        <span key={person.id}>
                          {idx > 0 && <span className="text-[var(--text-muted)] font-normal"> &amp; </span>}
                          <Link
                            to={`/team?tab=${person.categoryTab || 'interns'}&member=${person.id}`}
                            title={`View ${person.name} on Research Interns`}
                            className="inline-flex items-baseline gap-1 hover:text-[var(--accent-orange)] transition-colors underline decoration-[var(--border-hairline-dark)] underline-offset-4 hover:decoration-[var(--accent-orange)]"
                          >
                            <span>{person.name}</span>
                          </Link>
                        </span>
                      ))}
                    </h2>
                  ) : (
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-head text-[var(--text-primary)] tracking-tight">
                      <Link
                        to={teamRedirectUrl}
                        title={`View ${featuredPerformer.name} on Research Interns`}
                        className="inline-flex items-center gap-1.5 hover:text-[var(--accent-orange)] transition-colors underline decoration-[var(--border-hairline-dark)] underline-offset-4 hover:decoration-[var(--accent-orange)]"
                      >
                        <span>{featuredPerformer.name}</span>
                        <ArrowUpRight className="w-5 h-5 shrink-0 opacity-60" />
                      </Link>
                    </h2>
                  )}

                  {featuredPerformer.department && (
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans mt-1">
                      {featuredPerformer.department}
                    </p>
                  )}
                </div>

                {/* Co-Awardees Contact Cards */}
                {coAwardees.length > 0 && (
                  <div className="space-y-2.5">
                    {coAwardees.map(person => (
                      <div
                        key={person.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/team?tab=${person.categoryTab || 'interns'}&member=${person.id}`}
                            title={`View ${person.name} on Research Interns`}
                            className="inline-flex items-center gap-1 text-sm font-bold font-head text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-colors"
                          >
                            <span>{person.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                          </Link>
                          {person.note && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[var(--bg-surface)] text-[var(--text-subtle)] border border-[var(--border-hairline)]">
                              {person.note}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {person.linkedin && (
                            <a
                              href={person.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[11px] font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <Linkedin className="w-3 h-3" />
                              <span>LinkedIn</span>
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
                    ))}
                  </div>
                )}

                {/* Action Links for Single Awardee (kept only once, no bottom duplicate) */}
                {coAwardees.length === 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    {featuredPerformer.linkedin && (
                      <a
                        href={featuredPerformer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {(featuredPerformer.cvUrl || featuredPerformer.linkedin) && (
                      <a
                        href={featuredPerformer.cvUrl || featuredPerformer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </a>
                    )}
                    {featuredPerformer.email && (
                      <a
                        href={`mailto:${featuredPerformer.email}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs font-sans font-medium text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Citation & Scientific Breakthrough Statement */}
            <div className="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] mb-8">
              <span className="text-xs font-sans font-semibold text-[var(--ink-dark)] uppercase tracking-wider block mb-2">
                Faculty Commendation & Impact:
              </span>
              {featuredPerformer.title && (
                <h4 className="text-base font-bold font-head text-[var(--text-primary)] mb-2">
                  {featuredPerformer.title}
                </h4>
              )}
              {featuredPerformer.achievement && (
                <p className="text-sm font-sans text-[var(--text-muted)] leading-relaxed font-normal">
                  {featuredPerformer.achievement}
                </p>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-[var(--border-hairline)] flex items-center justify-end">
              <Link
                to={coAwardees.length > 0 ? `/team?tab=${featuredPerformer.categoryTab || 'interns'}` : teamRedirectUrl}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-sans font-semibold bg-[var(--ink-dark)] text-white hover:bg-[var(--accent-orange)] hover:text-white transition-all inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>View Members</span>
              </Link>
            </div>
          </div>
        </SectionReveal>
      )}
    </div>
  )
}
