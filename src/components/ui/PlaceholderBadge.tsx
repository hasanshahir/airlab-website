import React from 'react'

interface PlaceholderBadgeProps {
  label?: string
  className?: string
}

export const PlaceholderBadge: React.FC<PlaceholderBadgeProps> = ({
  label = 'Needs Real Data',
  className = '',
}) => {
  return (
    <span
      title="This field uses placeholder sample data. Supply official records to replace."
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-medium bg-amber-500/15 text-amber-600 border border-amber-500/30 uppercase tracking-wider ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>{label}</span>
    </span>
  )
}

export default PlaceholderBadge
