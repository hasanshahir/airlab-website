import React from 'react'
import { ExternalLink, Handshake } from 'lucide-react'
import { getSponsors } from '../lib/data'

export const SponsorsGrid: React.FC = () => {
  const sponsors = getSponsors()

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase font-bold text-[var(--accent-purple)]">
            COLLABORATIVE ALLIANCES
          </span>
          <h2 className="text-2xl sm:text-3xl font-head font-normal text-[var(--text-primary)] tracking-tight mt-1">
            Sponsors & Institutional Partners
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)]">
          <Handshake className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
          <span>{sponsors.length} Strategic Alliances</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {sponsors.map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url || '#'}
            target={sponsor.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group p-5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-purple)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] p-1.5 flex items-center justify-center overflow-hidden">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-mono font-bold text-xs text-[var(--accent-orange)]">
                      {sponsor.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[var(--bg-page)] text-[var(--text-subtle)] border border-[var(--border-hairline)]">
                  {sponsor.tier || 'Partner'}
                </span>
              </div>

              <h3 className="font-head text-[15px] sm:text-[16px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug">
                {sponsor.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-1 line-clamp-2">
                {sponsor.type}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--accent-orange)]">
              <span>Visit Website</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default SponsorsGrid
