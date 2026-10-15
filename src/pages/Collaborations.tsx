import { Handshake, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react'
import collaborationsData from '../data/collaborations.json'
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
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
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
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-3 tracking-tight">
            Strategic Collaborations
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Partnering with international tech enterprises, premier universities, and national research bodies to accelerate real-world AI deployment.
          </p>
        </SectionReveal>
      </div>

      {/* ── Logo Grid on Cards ── */}
      <div className="mb-20 text-left">
        <SectionReveal>
          <div className="mb-6">
            <h2 className="text-[20px] font-normal font-head text-[var(--text-primary)]">
              Partner Organizations & Consortia
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {partnersList.map((partner, idx) => (
            <SectionReveal key={idx} staggerIndex={idx}>
              <div className="craftly-card p-5 text-center flex flex-col items-center justify-center min-h-[100px] group cursor-default bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[2px] hover:border-[var(--accent-purple)] transition-all">
                <span className="font-head text-[15px] sm:text-[16px] font-medium text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">
                  {partner.name}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-subtle)] mt-1">
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
            <h2 className="text-[24px] sm:text-[28px] font-normal font-head text-[var(--text-primary)] mb-2">
              Sponsored Research Programs
            </h2>
            <p className="text-[15px] text-[var(--text-muted)]">
              Flagship collaborative programs, grant deliverables, and enterprise testbeds.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collaborationsData.map((collab, index) => (
            <SectionReveal key={collab.id} staggerIndex={index}>
              <div className="craftly-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden h-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] transition-all">
                <div>
                  {/* Media header thumbnail */}
                  <div className="relative h-48 w-full rounded-[2px] overflow-hidden bg-[var(--bg-page)] mb-6 border border-[var(--border-hairline)]">
                    <img
                      src={collab.image}
                      alt={collab.partner}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-mono font-medium bg-white/95 text-[var(--text-primary)] shadow-xs">
                        {collab.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-mono font-medium bg-[var(--accent-orange)] text-white">
                        {collab.grantAmount}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 pointer-events-none">
                      <h3 className="text-xl font-medium font-head text-white leading-tight">
                        {collab.partner}
                      </h3>
                      <p className="text-[11px] font-mono text-white/80">{collab.period}</p>
                    </div>
                  </div>

                  {/* Focus & Description */}
                  <div className="text-xs font-mono font-semibold text-[var(--text-subtle)] uppercase tracking-wider mb-2">
                    Focus: <span className="text-[var(--text-primary)] font-sans font-medium">{collab.focus}</span>
                  </div>
                  <p className="text-[14px] text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
                    {collab.description}
                  </p>

                  {/* Tangible Outcomes */}
                  <div className="rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] p-4 mb-4">
                    <div className="text-xs font-mono font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      Key Joint Deliverables:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {collab.outcomes.map((outcome, oIdx) => (
                        <span
                          key={oIdx}
                          className="px-2.5 py-1 rounded-[2px] text-[11px] font-mono bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[var(--accent-purple)]" />
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-subtle)]">
                    Alliance Status: <strong className="text-[var(--accent-orange)] font-semibold">Active</strong>
                  </span>
                  <span className="text-[var(--accent-orange)] font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Partnership Details <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
