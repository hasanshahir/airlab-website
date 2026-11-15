import { useState, useMemo, useEffect, useRef } from 'react'
import { Calendar, User, CheckCircle2, Clock, Landmark } from 'lucide-react'
import { getGrants } from '../lib/data'
import type { Grant } from '../types/data'
import SectionReveal from '../components/ui/SectionReveal'
import PlaceholderBadge from '../components/ui/PlaceholderBadge'

function parseGrantDateScore(durationStr?: string): number {
  if (!durationStr) return 0
  const lower = durationStr.toLowerCase()
  const yearMatch = lower.match(/\b(19\d\d|20\d\d)\b/)
  return yearMatch ? parseInt(yearMatch[1], 10) : 0
}

function parseNumericGrantAmount(raw: string): { prefix: string; target: number; suffix: string } | null {
  if (!raw) return null
  const trimmed = raw.trim()

  let prefix = ''
  if (/^rs\.?\s*/i.test(trimmed)) {
    prefix = 'Rs. '
  } else if (/^pkr\s*/i.test(trimmed)) {
    prefix = 'PKR '
  } else if (/^\$/.test(trimmed)) {
    prefix = '$'
  }

  const numMatch = trimmed.match(/(\d[\d,]*(?:\.\d+)?)/)
  if (!numMatch) return null

  const baseValue = parseFloat(numMatch[1].replace(/,/g, ''))
  if (isNaN(baseValue)) return null

  const lower = trimmed.toLowerCase()
  let multiplier = 1
  if (lower.includes('billion')) {
    multiplier = 1_000_000_000
  } else if (lower.includes('million') || /\b\d+(?:\.\d+)?\s*m\b/i.test(trimmed)) {
    multiplier = 1_000_000
  } else if (lower.includes('crore')) {
    multiplier = 10_000_000
  } else if (lower.includes('lakh') || lower.includes('lac')) {
    multiplier = 100_000
  } else if (lower.includes('thousand') || /\b\d+(?:\.\d+)?\s*k\b/i.test(trimmed)) {
    multiplier = 1_000
  }

  return {
    prefix,
    target: Math.round(baseValue * multiplier),
    suffix: '',
  }
}

function AnimatedGrantAmount({ amount }: { amount: string }) {
  const parsed = useMemo(() => parseNumericGrantAmount(amount), [amount])
  const [displayValue, setDisplayValue] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!parsed) return
    hasAnimatedRef.current = false

    const el = containerRef.current
    const startAnimation = () => {
      if (hasAnimatedRef.current) return
      hasAnimatedRef.current = true

      const duration = 1800
      const startTime = performance.now()

      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic for smooth deceleration on final digits
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(eased * parsed.target))

        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          setDisplayValue(parsed.target)
        }
      }

      requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined' || !el) {
      startAnimation()
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [parsed])

  if (!parsed) {
    return (
      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-head text-[var(--text-primary)] tracking-tight mt-1">
        {amount}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="text-2xl sm:text-3xl xl:text-4xl font-extrabold font-head text-[var(--text-primary)] tracking-tight tabular-nums mt-1 leading-none"
    >
      {parsed.prefix}
      {displayValue.toLocaleString('en-US')}
      {parsed.suffix}
    </div>
  )
}

export default function Grants() {
  const [grants, setGrants] = useState<Grant[]>(() => getGrants())

  useEffect(() => {
    fetch('/api/content/grants')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setGrants(data)
      })
      .catch(() => {})
  }, [])

  // Sort: Active grants at top, Completed / older grants at bottom
  const sortedGrants = useMemo(() => {
    return grants.slice().sort((a, b) => {
      const isActiveA = a.status === 'Active'
      const isActiveB = b.status === 'Active'

      if (isActiveA && !isActiveB) return -1
      if (!isActiveA && isActiveB) return 1

      return parseGrantDateScore(b.duration) - parseGrantDateScore(a.duration)
    })
  }, [grants])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1320px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] tracking-tight">
            Research Grants
          </h1>
        </SectionReveal>
      </div>

      {/* Grants Cards (Generous 28px Rounded Stone Cards) */}
      <div className="space-y-8">
        <div className="space-y-8 text-left">
          {sortedGrants.map(grant => {
              const isActive = grant.status === 'Active'
              return (
                <div
                  key={grant.id}
                  className="relative overflow-hidden group p-9 sm:p-12 lg:p-14 min-h-[380px] sm:min-h-[420px] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Visible background image with directional gradient overlay for text contrast */}
                  {grant.image && (
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                      <img
                        src={grant.image}
                        alt=""
                        className="w-full h-full object-cover opacity-[0.50] dark:opacity-[0.54] group-hover:opacity-[0.60] dark:group-hover:opacity-[0.64] group-hover:scale-[1.02] transition-all duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)]/92 via-[var(--bg-surface)]/76 to-[var(--bg-surface)]/20 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)]/65 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col justify-between gap-8">
                    <div>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans font-semibold ${isActive
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[var(--ink-dark)] text-white'
                                }`}
                            >
                              {isActive ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {grant.status}
                            </span>

                            {grant.programTitle && (
                              <span className="px-3 py-1 rounded-full text-xs font-sans text-[var(--ink-dark)] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center gap-1.5 font-medium">
                                <Landmark className="w-3 h-3" />
                                {grant.programTitle}
                              </span>
                            )}

                            {grant.duration && (
                              <span className="px-3 py-1 rounded-full text-xs font-sans text-[var(--text-muted)] bg-[var(--bg-page)] border border-[var(--border-hairline)] inline-flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3 h-3" />
                                {grant.duration}
                              </span>
                            )}

                            {grant.placeholder && <PlaceholderBadge />}
                          </div>

                          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-head font-bold text-[var(--text-primary)] leading-[1.18] tracking-tight max-w-3xl">
                            {grant.title}
                          </h2>
                          <div className="text-sm sm:text-[15px] font-semibold text-[var(--accent-orange)] font-sans mt-2">
                            Grant Supplier: {grant.funder}
                          </div>
                        </div>

                        {grant.amount && (
                          <div className="px-5 py-3.5 rounded-2xl bg-[var(--bg-page)]/95 backdrop-blur-xs border border-[var(--border-hairline)] text-left md:text-right shrink-0 shadow-xs">
                            <div className="text-[11px] font-sans font-bold tracking-wider text-[var(--text-subtle)] uppercase">
                              Granted Amount
                            </div>
                            <AnimatedGrantAmount amount={grant.amount} />
                          </div>
                        )}
                      </div>

                      {grant.description && (
                        <p className="text-[15.5px] sm:text-[16.5px] text-[var(--text-primary)]/90 leading-[1.78] font-normal max-w-3xl">
                          {grant.description}
                        </p>
                      )}
                    </div>

                    {(grant.leadInvestigator || grant.url) && (
                      <div className="pt-5 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs sm:text-[13px] font-sans">
                        {grant.leadInvestigator && (
                          <span className="flex items-center gap-1.5 text-[var(--text-subtle)]">
                            <User className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                            <span>PI: <strong className="text-[var(--text-primary)]">{grant.leadInvestigator}</strong></span>
                          </span>
                        )}

                        {grant.url && (
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1.5 font-semibold ml-auto"
                          >
                            <span>Funder Website</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        {sortedGrants.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)] mt-8">
            <p className="text-sm font-sans text-[var(--text-muted)]">No research grants published yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
