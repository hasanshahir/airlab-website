import React from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  to?: string
  href?: string
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  arrow,
  to,
  href,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-11 px-5 text-sm',
  }

  // Reference style: Vivid orange primary with white text, hairline secondary, weight 500
  const variantStyles = {
    primary:
      'bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white border border-[var(--accent-orange)] font-medium shadow-xs transition-colors',
    secondary:
      'bg-transparent hover:bg-[rgba(17,17,17,0.04)] text-[var(--text-primary)] border border-[var(--border-hairline)] font-medium transition-colors',
    outline:
      'bg-transparent hover:bg-[rgba(17,17,17,0.04)] text-[var(--text-primary)] border border-[var(--border-hairline)] font-medium transition-colors',
    ghost:
      'bg-transparent hover:bg-[rgba(17,17,17,0.04)] text-[var(--text-primary)] font-medium transition-colors',
  }

  const showArrow = arrow !== undefined ? arrow : variant === 'primary'

  const sharedClasses = `group inline-flex items-center justify-center gap-1.5 rounded-[2px] tracking-tight font-sans transition-all active:translate-y-[1px] select-none cursor-pointer whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {showArrow && (
        <span className="text-[12px] leading-none transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 font-sans shrink-0">
          ↳
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={sharedClasses}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={sharedClasses} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }

  return (
    <button className={sharedClasses} {...props}>
      {content}
    </button>
  )
}

export default Button
