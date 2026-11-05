import React from 'react'
import airLabFullLogo from '../assets/air-lab-logo.png'
import airLabMark from '../assets/air-lab-mark.png'

export interface AirLabLogoProps {
  className?: string
  height?: number | string
  variant?: 'lockup' | 'full' | 'mark'
  showSubtitle?: boolean
  light?: boolean
}

/**
 * Official AI Research Lab (NED University) Brand Logo
 * Clean transparent background with no dark boxes.
 */
export const AirLabLogo: React.FC<AirLabLogoProps> = ({
  className = '',
  height = 36,
  variant = 'lockup',
  showSubtitle = true,
  light = false,
}) => {
  const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 36

  // Variant: exact full stacked mark + text from uploaded asset (100% transparent)
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={airLabFullLogo}
          alt="AI Research Lab — NED University of Engineering and Technology"
          style={{ height: `${numericHeight}px`, width: 'auto' }}
          className="object-contain block drop-shadow-none"
        />
      </div>
    )
  }

  // Variant: mark alone (the iconic "ai" monogram ribbon)
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={airLabMark}
          alt="AIR Lab Mark"
          style={{ height: `${numericHeight}px`, width: 'auto' }}
          className="object-contain block"
        />
      </div>
    )
  }

  // Variant: 'lockup' (horizontal lockup: crisp 'ai' mark + official typography)
  // Optimal for navbars, banners, and tight headers
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={airLabMark}
        alt="AI Research Lab"
        style={{ height: `${numericHeight}px`, width: 'auto' }}
        className="object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
      />
      <div className="flex flex-col text-left leading-none justify-center">
        <span
          className={`font-head font-bold text-[15px] sm:text-[17px] tracking-tight transition-colors ${
            light
              ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
              : 'text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]'
          }`}
        >
          AI Research Lab
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] sm:text-[11px] font-sans tracking-tight mt-1 font-medium ${
              light
                ? 'text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            NED University of Engineering & Technology
          </span>
        )}
      </div>
    </div>
  )
}

export default AirLabLogo
