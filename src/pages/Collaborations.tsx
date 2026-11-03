import { useState, useEffect } from 'react'
import { Handshake, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react'
import rawCollaborations from '../data/collaborations.json'
import type { CollaborationItem } from '../types/data'

const collaborationsData = rawCollaborations as unknown as CollaborationItem[]
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'

const partnersList = [
  { name: 'PLAID', type: 'Fintech AI' },
  { name: 'Grasshopper', type: 'Autonomous Systems' },
  { name: 'PAI 02', type: 'Robotics Labs' },
  { name: 'commune', type: 'Community Tech' },
  { name: 'Google DeepMind', type: 'Foundation Models' },
  { name: 'Numeral', type: 'Automated Accounting' },
  { name: 'Perplexity AI', type: 'Conversational Search' },
  { name: 'NVIDIA Research', type: 'Compute Architecture' },
  { name: 'HEC Pakistan', type: 'National Grants' },
  { name: 'NEDUET CSIT', type: 'Academic Department' },
]

export default function Collaborations() {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>(() => collaborationsData)

  useEffect(() => {
    fetch('/api/content/collaborations')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) setCollaborations(d)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<Handshake className="w-3.5 h-3.5 text-white" />}>
              ACADEMIC & INDUSTRY ALLIANCES
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Research Alliances & Partners
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Strategic collaborations bridging foundational research with enterprise applications, national computing testbeds, and academic exchange.
          </p>
        </SectionReveal>
      </div>

      {/* ── Partner Organization Logos ── */}
      <div className="mb-20 text-left">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {partnersList.map((partner, idx) => (
            <SectionReveal key={partner.name} staggerIndex={idx}>
              <div className="h-28 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-4 flex flex-col items-center justify-center text-center hover:border-[var(--accent-orange)]/40 hover:shadow-sm transition-all duration-200">
                <span className="font-head font-bold text-sm tracking-wide text-[var(--text-primary)]">
                  {partner.name}
                </span>
                <span className="text-[11px] font-sans text-[var(--text-subtle)] mt-1">
                  {partner.type}
                </span>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      {/* ── Detailed Joint Venture Cards ── */}
      <div className="text-left">
        <SectionReveal>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-head font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              Sponsored Research Programs
            </h2>
            <p className="text-[15px] text-[var(--text-muted)]">
              Flagship collaborative programs, grant deliverables, and enterprise testbeds.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collaborations.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)]">
              <p className="text-sm font-sans text-[var(--text-muted)]">No joint collaborative programs published yet.</p>
            </div>
          ) : (
            collaborations.map((collab, index) => (
              <SectionReveal key={collab.id} staggerIndex={index}>
                <div className="p-8 sm:p-10 flex flex-col justify-between group overflow-hidden h-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all">
                  <div>
                    {/* Media header thumbnail */}
                    {collab.image && (
                      <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-[var(--bg-page)] mb-6 border border-[var(--border-hairline)]">
                        <img
                          src={collab.image}
                          alt={collab.partner}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-white/95 text-[var(--text-primary)] shadow-xs">
                            {collab.type}
                          </span>
                          {collab.grantAmount && (
                            <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[var(--accent-orange)] text-white shadow-xs">
                              {collab.grantAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-2xl font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors mb-2">
                        {collab.partner}
                      </h3>
                      <p className="text-xs font-sans text-[var(--text-subtle)] font-medium">
                        Period: {collab.period}
                      </p>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-sans font-semibold text-[var(--ink-dark)] uppercase tracking-wider block mb-1">
                        Domain Scope:
                      </span>
                      <p className="text-sm font-sans font-medium text-[var(--text-primary)]">{collab.focus}</p>
                    </div>

                    <p className="text-sm font-sans text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
                      {collab.description}
                    </p>

                    {/* Tangible Outcomes */}
                    {collab.outcomes && collab.outcomes.length > 0 && (
                      <div className="rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] p-5 mb-5">
                        <div className="text-xs font-sans font-semibold text-[var(--text-primary)] mb-2.5 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[var(--accent-orange)]" />
                          Key Joint Deliverables:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {collab.outcomes.map((outcome, oIdx) => (
                            <span
                              key={oIdx}
                              className="px-3 py-1 rounded-full text-[11px] font-sans bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)] flex items-center gap-1.5 font-medium"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[var(--ink-dark)]" />
                              {outcome}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-sans">
                    <span className="text-[var(--text-subtle)]">
                      Alliance Status: <strong className="text-[var(--accent-orange)] font-semibold">Active</strong>
                    </span>
                    <span className="text-[var(--accent-orange)] font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Partnership Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </SectionReveal>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
