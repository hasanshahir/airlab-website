import React from 'react'
import { Handshake } from 'lucide-react'
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-muted)] self-start sm:self-auto">
          <Handshake className="w-4 h-4 text-[var(--accent-orange)]" />
          <span>{sponsors.length} Strategic Alliances</span>
        </div>
      </div>

      {/* Logos-only grid with responsive 4-column layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
        {sponsors.map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url || '#'}
            target={sponsor.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            title={sponsor.name}
            aria-label={sponsor.name}
            className="group relative h-28 sm:h-36 px-6 py-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/50 hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer hover:-translate-y-1 overflow-hidden"
          >
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                className="max-h-16 sm:max-h-20 max-w-[85%] w-auto object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                loading="lazy"
              />
            ) : (
              <span className="font-sans font-bold text-sm tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors text-center">
                {sponsor.shortName || sponsor.name}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

export default SponsorsGrid
