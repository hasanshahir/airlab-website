import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ExternalLink, Calendar, User, CheckCircle2, Clock, Landmark } from 'lucide-react'
import { getGrants } from '../lib/data'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'
import PlaceholderBadge from '../components/ui/PlaceholderBadge'

export default function Grants() {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All')
  const grants = useMemo(() => getGrants(), [])

  const filtered = useMemo(() => {
    if (filter === 'All') return grants
    return grants.filter(g => g.status === filter)
  }, [grants, filter])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<Award className="w-3.5 h-3.5 text-white" />}>
              RESEARCH FUNDING & GRANTS
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Active & Sponsored Grants
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Official government research programs, Sindh Higher Education Commission awards, national technology grants, and international fellowships supporting computational intelligence at AIR Lab.
          </p>
        </SectionReveal>
      </div>

      {/* Filter Tabs (Pill selectors) */}
      <div className="mb-10 flex items-center justify-between border-b border-[var(--border-hairline)] pb-6">
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-full shadow-xs">
          {(['All', 'Active', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${filter === tab
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                }`}
            >
              <span>{tab} Grants</span>
              <span className="ml-1.5 opacity-80 text-[10px]">
                ({tab === 'All' ? grants.length : grants.filter(g => g.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grants Cards (Generous 28px Rounded Stone Cards) */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 text-left"
          >
            {filtered.map(grant => {
              const isActive = grant.status === 'Active'
              return (
                <div
                  key={grant.id}
                  className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Grant Image preview if available */}
                    {grant.image && (
                      <div className="w-full lg:w-72 h-48 sm:h-56 rounded-2xl overflow-hidden shrink-0 bg-[var(--bg-page)] border border-[var(--border-hairline)]">
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
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold ${isActive
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[var(--ink-dark)] text-white'
                                }`}
                            >
                              {isActive ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {grant.status}
                            </span>

                            {grant.programTitle && (
                              <span className="px-3 py-1 rounded-full text-xs font-mono text-[var(--ink-dark)] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center gap-1.5 font-medium">
                                <Landmark className="w-3 h-3" />
                                {grant.programTitle}
                              </span>
                            )}

                            <span className="px-3 py-1 rounded-full text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-page)] border border-[var(--border-hairline)]">
                              {grant.duration}
                            </span>

                            {grant.placeholder && <PlaceholderBadge />}
                          </div>

                          <h2 className="text-xl sm:text-2xl font-head font-semibold text-[var(--text-primary)] leading-snug">
                            {grant.title}
                          </h2>
                          <div className="text-sm font-semibold text-[var(--accent-orange)] font-mono mt-1.5">
                            Grant Supplier: {grant.funder}
                          </div>
                        </div>

                        {grant.amount && (
                          <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] text-left md:text-right shrink-0">
                            <div className="text-[10px] font-mono text-[var(--text-subtle)] uppercase">Granted Amount</div>
                            <div className="text-base sm:text-lg font-bold font-mono text-[var(--text-primary)] mt-0.5">
                              {grant.amount}
                            </div>
                          </div>
                        )}
                      </div>

                      {grant.description && (
                        <p className="text-sm sm:text-[14.5px] text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
                          {grant.description}
                        </p>
                      )}

                      <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                        <div className="flex flex-wrap items-center gap-4 text-[var(--text-subtle)]">
                          {grant.leadInvestigator && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                              <span>PI: <strong className="text-[var(--text-primary)]">{grant.leadInvestigator}</strong></span>
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
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
