import { useState, useEffect } from 'react'
import { Building2, BookOpen } from 'lucide-react'
import rawInterns from '../data/interns.json'
import type { InternItem } from '../types/data'
import { getMemberAvatar, DEFAULT_AVATAR } from '../lib/placeholders'
import Button from '../components/ui/Button'
import SectionReveal from '../components/ui/SectionReveal'

const internsData = rawInterns as unknown as InternItem[]

export default function Interns() {
  const [interns, setInterns] = useState<InternItem[]>(() => internsData)

  useEffect(() => {
    fetch('/api/content/interns')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) setInterns(d)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Research Interns & Alumni
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Where our former research fellows are now — from graduate studies to industry engineering positions.
          </p>
        </SectionReveal>
      </div>

      {/* Grid of Alumni */}
      {interns.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)] mb-16">
          <p className="text-sm font-sans text-[var(--text-muted)]">No intern spotlight entries published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
          {interns.map((intern, index) => (
            <SectionReveal key={intern.id} staggerIndex={index}>
              <div
                className="p-8 sm:p-10 flex flex-col justify-between group h-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div>
                  {/* Profile Header */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-hairline)] bg-[var(--bg-page)] shadow-xs">
                      <img
                        src={getMemberAvatar(intern.image)}
                        alt={intern.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR
                        }}
                      />
                    </div>

                    <div>
                      {intern.term && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[var(--ink-dark)] text-white">
                            {intern.term}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl sm:text-2xl font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors mt-1">
                        {intern.name}
                      </h3>
                      {intern.university && (
                        <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                          {intern.university}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Present Destination */}
                  {intern.currentRole && (
                    <div className="mb-4">
                      <span className="text-xs font-sans font-semibold text-[var(--ink-dark)] uppercase tracking-wider block mb-1">
                        Current Destination:
                      </span>
                      <p className="text-sm font-sans font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        {intern.currentRole}
                      </p>
                    </div>
                  )}

                  {/* Research Contribution */}
                  {intern.project && (
                    <div className="mb-4">
                      <span className="text-xs font-sans font-semibold text-[var(--ink-dark)] uppercase tracking-wider block mb-1">
                        AIR Lab Contribution:
                      </span>
                      <p className="text-sm font-sans text-[var(--text-muted)]">{intern.project}</p>
                    </div>
                  )}

                  {/* Published Work at AIR Lab */}
                  {intern.paper && (
                    <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)]">
                      <div className="text-xs font-sans font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        Key Publication:
                      </div>
                      <p className="text-xs font-sans text-[var(--text-muted)] italic">
                        "{intern.paper}"
                      </p>
                    </div>
                  )}

                  {/* Personal Quote */}
                  {intern.quote && (
                    <blockquote className="text-xs font-sans text-[var(--text-muted)] italic border-l-2 border-[var(--accent-orange)] pl-3 mb-6">
                      "{intern.quote}"
                    </blockquote>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--border-hairline)] text-right">
                  <span className="text-xs font-sans text-[var(--text-subtle)]">
                    Alumni Verification Verified
                  </span>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      )}

      {/* Call to Action Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--ink-dark)] text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold font-head mb-2 text-white">
            Are you a former AIR Lab research fellow?
          </h3>
          <p className="text-sm text-white/70 font-sans">
            Keep your profile, publications, and current PhD / industry position up to date with our lab coordinators.
          </p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0"
          onClick={() => (window.location.href = 'mailto:airlab@neduet.edu.pk')}
        >
          Update Your Alumni Profile
        </Button>
      </div>
    </div>
  )
}
