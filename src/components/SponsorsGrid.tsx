import React from 'react'
import { getSponsors } from '../lib/data'

export const SponsorsGrid: React.FC = () => {
  const sponsors = getSponsors()
  if (!sponsors || sponsors.length === 0) return null

  return (
    <div className="w-full">
      <div className="mb-8">
        <div>
          <span className="text-xs font-sans uppercase font-bold text-[var(--accent-orange)] tracking-wider">
            COLLABORATIVE ALLIANCES
          </span>
          <h2 className="text-2xl sm:text-3xl font-head font-semibold text-[var(--text-primary)] tracking-tight mt-1">
            Sponsors & Institutional Partners
          </h2>
        </div>
      </div>

      {/* Logos-only circular cards centered with tighter spacing */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto">
        {sponsors.map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url || '#'}
            target={sponsor.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            title={sponsor.name}
            aria-label={sponsor.name}
            className="group relative w-28 h-28 sm:w-34 sm:h-34 md:w-36 md:h-36 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/60 hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:-translate-y-1.5 hover:scale-105 p-5 sm:p-6 shadow-xs overflow-hidden shrink-0"
          >
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                className="max-h-14 sm:max-h-18 max-w-[78%] w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <span className="font-sans font-bold text-xs sm:text-sm tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors text-center px-2">
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
