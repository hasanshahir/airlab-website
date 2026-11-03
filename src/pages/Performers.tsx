import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, Mail, ArrowRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'
import { getMemberAvatar, DEFAULT_AVATAR } from '../lib/placeholders'

const Linkedin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export default function Performers() {
  const [featuredPerformer, setFeaturedPerformer] = useState<any>(null)

  useEffect(() => {
    fetch('/api/content/performers')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d) && d.length > 0) setFeaturedPerformer(d[0])
      })
      .catch(() => {})
  }, [])

  const teamRedirectUrl = featuredPerformer
    ? `/team?tab=${featuredPerformer.categoryTab || 'interns'}&member=${featuredPerformer.id}`
    : '/team'

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="orange" icon={<Trophy className="w-3.5 h-3.5 text-white" />}>
              ACADEMIC EXCELLENCE & HALL OF FAME
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Performer of the Month
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Monthly spotlight honoring the researcher who demonstrated exceptional scientific rigor, landmark publications, and engineering leadership at AIR Lab.
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
          <div className="p-8 sm:p-12 relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl shadow-lg max-w-4xl mx-auto transition-all duration-300 hover:border-[var(--accent-orange)]/40 text-left">
            {/* Top Banner Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-8 border-b border-[var(--border-hairline)] mb-8">
              <div className="flex items-center gap-2.5">
                <span className="px-4 py-1.5 rounded-full text-xs font-sans font-semibold bg-[var(--accent-orange)] text-white flex items-center gap-1.5 shadow-xs">
                  <Medal className="w-4 h-4 text-white" />
                  Spotlight Award
                </span>
                {featuredPerformer.month && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-sans font-medium bg-[var(--bg-page)] text-[var(--ink-dark)] border border-[var(--border-hairline)]">
                    {featuredPerformer.month}
                  </span>
                )}
              </div>

              <span className="text-xs font-sans text-[var(--text-subtle)]">
                Recognized by AIR Lab
              </span>
            </div>

            {/* Member Profile Showcase */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
              {/* Clickable Portrait Image */}
              <Link
                to={teamRedirectUrl}
                title={`Click to view ${featuredPerformer.name} on Team page`}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-hairline)] shadow-sm group cursor-pointer bg-[var(--bg-page)] transition-transform duration-300 hover:scale-102"
              >
                <img
                  src={getMemberAvatar(featuredPerformer.image)}
                  alt={featuredPerformer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR
                  }}
                />
              </Link>

              <div className="flex-1 space-y-3 text-center md:text-left">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[var(--ink-dark)] text-white inline-block mb-2">
                    {featuredPerformer.role || 'Research Scholar'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)]">
                    {featuredPerformer.name}
                  </h2>
                  {featuredPerformer.department && (
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans mt-1">
                      {featuredPerformer.department}
                    </p>
                  )}
                </div>

                {/* Research Tags */}
                {featuredPerformer.tags && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                    {featuredPerformer.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                      >
                        #{tag}
                      </span>
                    ))}
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
            <div className="pt-6 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {featuredPerformer.linkedin && (
                  <a
                    href={featuredPerformer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {featuredPerformer.email && (
                  <a
                    href={`mailto:${featuredPerformer.email}`}
                    className="p-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>

              <Link
                to={teamRedirectUrl}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-sans font-semibold bg-[var(--ink-dark)] text-white hover:bg-[var(--accent-orange)] hover:text-white transition-all inline-flex items-center justify-center gap-2 shadow-xs"
              >
                <span>View Full Team Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </SectionReveal>
      )}
    </div>
  )
}
