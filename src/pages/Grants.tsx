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
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] tracking-tight">
            Research Funding
          </h1>
        </SectionReveal>
      </div>

      {/* Grants Cards (Generous 28px Rounded Stone Cards) */}
      <div className="space-y-6">
        <div className="space-y-6 text-left">
          {sortedGrants.map(grant => {
              const isActive = grant.status === 'Active'
              return (
                <div
                  key={grant.id}
                  className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                    {/* Grant Image preview if available (Bigger size) */}
                    {grant.image && (
                      <div className="w-full lg:w-[440px] xl:w-[500px] h-72 sm:h-80 lg:h-auto lg:min-h-[320px] rounded-2xl overflow-hidden shrink-0 bg-[var(--bg-page)] border border-[var(--border-hairline)] shadow-sm">
                        <img
                          src={grant.image}
                          alt={grant.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
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

                            <span className="px-3 py-1 rounded-full text-xs font-sans text-[var(--text-muted)] bg-[var(--bg-page)] border border-[var(--border-hairline)]">
                              {grant.duration}
                            </span>

                            {grant.placeholder && <PlaceholderBadge />}
                          </div>

                          <h2 className="text-xl sm:text-2xl font-head font-semibold text-[var(--text-primary)] leading-snug">
                            {grant.title}
                          </h2>
                          <div className="text-sm font-semibold text-[var(--accent-orange)] font-sans mt-1.5">
                            Grant Supplier: {grant.funder}
                          </div>
                        </div>

                        {grant.amount && (
                          <div className="px-5 py-3.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] text-left md:text-right shrink-0 shadow-xs">
                            <div className="text-[11px] font-sans font-bold tracking-wider text-[var(--text-subtle)] uppercase">
                              Granted Amount
                            </div>
                            <AnimatedGrantAmount amount={grant.amount} />
                          </div>
                        )}
                      </div>

                      {grant.description && (
                        <p className="text-sm sm:text-[14.5px] text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
                          {grant.description}
                        </p>
                      )}

                      <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
                        <div className="flex flex-wrap items-center gap-4 text-[var(--text-subtle)]">
                          {grant.leadInvestigator && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                              <span>Supervisor: <strong className="text-[var(--text-primary)]">{grant.leadInvestigator}</strong></span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Timeline: {grant.duration}</span>
                          </span>
                        </div>

                        {grant.url && (
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1.5 font-semibold"
                          >
                            <span>Funder Website</span>
                          </a>
                        )}
                      </div>
                    </div>
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
