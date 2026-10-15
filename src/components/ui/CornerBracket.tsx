import React from 'react'

interface CornerBracketProps {
  children: React.ReactNode
  tag?: string
  className?: string
  tagColor?: string
}

export const CornerBracket: React.FC<CornerBracketProps> = ({
  children,
  tag = 'AIR Lab',
  className = '',
  tagColor = 'bg-[var(--accent-orange)] text-white',
}) => {
  return (
    <span className={`relative inline-flex items-center px-4 sm:px-5 py-1 sm:py-1.5 my-1 font-semibold select-none font-head ${className}`}>
      {/* Top-Left Corner */}
      <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-t-2 border-l-2 border-[var(--accent-purple)] pointer-events-none" />

      {/* Top-Right Corner */}
      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-t-2 border-r-2 border-[var(--accent-orange)] pointer-events-none" />

      {/* Bottom-Left Corner */}
      <span className="absolute -bottom-1.5 -left-1.5 sm:-bottom-2 sm:-left-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-b-2 border-l-2 border-[var(--accent-purple)] pointer-events-none" />

      {/* Bottom-Right Corner */}
      <span className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-b-2 border-r-2 border-[var(--accent-orange)] pointer-events-none" />

      {/* Highlighted Content */}
      <span className="text-[var(--text-primary)] relative z-10 whitespace-nowrap">{children}</span>

      {/* Signature Pill / Tag Next to it */}
      {tag && (
        <span
          className={`ml-2 sm:ml-3 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-medium rounded-[2px] tracking-tight shrink-0 select-none align-middle ${tagColor}`}
        >
          {tag}
        </span>
      )}
    </span>
  )
}

export default CornerBracket
