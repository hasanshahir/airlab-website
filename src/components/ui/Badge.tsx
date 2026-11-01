import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  variant?: 'white' | 'dark' | 'outline' | 'orange' | 'purple' | 'aurora'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  className = '',
  variant = 'white',
  dot = false,
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-[11px] font-medium tracking-tight transition-all duration-150 select-none'

  const variantStyles = {
    white: 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xs',
    dark: 'bg-[var(--ink-dark)] text-white border border-transparent shadow-xs',
    outline: 'bg-transparent text-[var(--text-muted)] border border-[var(--border-hairline)]',
    orange: 'bg-[var(--accent-orange)] text-white border border-transparent shadow-xs',
    purple: 'bg-[var(--ink-dark)] text-white border border-transparent shadow-xs',
    aurora: 'bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20 shadow-xs',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse shrink-0" />
      )}
      {icon && <span className="shrink-0 w-3 h-3 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
