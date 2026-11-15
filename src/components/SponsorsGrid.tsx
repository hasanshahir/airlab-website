import React, { useState, useEffect } from 'react'
import { getSponsors } from '../lib/data'
import type { Sponsor } from '../types/data'

export const SponsorsGrid: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>(() => getSponsors())

  useEffect(() => {
    let active = true
    fetch('/api/content/sponsors', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (active && Array.isArray(data) && data.length > 0) {
          setSponsors(data)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

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

      {/* Raw logos without circular containers */}
      <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center gap-8 sm:gap-12 md:gap-16 pt-2 pb-2">
        {sponsors.map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url || '#'}
            target={sponsor.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            title={sponsor.name}
            aria-label={sponsor.name}
            className="group flex items-center justify-center p-2 transition-transform duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
          >
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                className={`w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
                  sponsor.id === 'neduet'
                    ? 'h-14 sm:h-16 md:h-20 max-w-[130px]'
                    : sponsor.id === 'providus'
                    ? 'h-8 sm:h-9 md:h-11 max-w-[200px]'
                    : 'h-10 sm:h-12 md:h-14 max-w-[220px]'
                }`}
                loading="lazy"
              />
            ) : (
              <span className="font-sans font-bold text-sm sm:text-base tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors text-center">
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
