import React from 'react'
import { ExternalLink, Handshake } from 'lucide-react'
import { getSponsors } from '../lib/data'

export const SponsorsGrid: React.FC = () => {
  const sponsors = getSponsors()
  if (!sponsors || sponsors.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-sans uppercase font-bold text-[var(--accent-orange)] tracking-wider">
            COLLABORATIVE ALLIANCES
          </span>
          <h2 className="text-2xl sm:text-3xl font-head font-semibold text-[var(--text-primary)] tracking-tight mt-1">
            Sponsors & Institutional Partners
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-muted)]">
          <Handshake className="w-4 h-4 text-[var(--accent-orange)]" />
          <span>{sponsors.length} Strategic Alliances</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sponsors.map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url || '#'}
            target={sponsor.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 px-2.5 py-1.5 min-w-[56px] max-w-[150px] rounded-xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center overflow-hidden shrink-0">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      className="h-8 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-sans font-bold text-xs text-[var(--accent-orange)]">
                      {sponsor.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-sans px-3 py-0.5 rounded-full bg-[var(--bg-page)] text-[var(--text-subtle)] border border-[var(--border-hairline)]">
                  {sponsor.tier || 'Partner'}
                </span>
              </div>

              <h3 className="font-head text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug">
                {sponsor.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-sans mt-1 line-clamp-2">
                {sponsor.type}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-sans text-[var(--accent-orange)] font-semibold">
              <span className="group-hover:underline">Visit Sponsor Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default SponsorsGrid
