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
    sm: 'h-8 px-4 text-xs',
    md: 'h-10 px-5 text-[13.5px]',
    lg: 'h-12 px-7 text-sm',
  }

  const variantStyles = {
    primary:
      'bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white font-semibold shadow-[0_2px_10px_-2px_rgba(123,44,191,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_6px_20px_-3px_rgba(123,44,191,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 transition-all duration-200',
    secondary:
      'bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[var(--border-hairline-dark)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 font-medium transition-all duration-200',
    outline:
      'bg-transparent hover:bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border-hairline-dark)] hover:-translate-y-0.5 font-medium transition-all duration-200',
    ghost:
      'bg-transparent hover:bg-[var(--surface-alt)] text-[var(--text-primary)] font-medium transition-colors duration-150',
  }

  const showArrow = Boolean(arrow)

  const sharedClasses = `group inline-flex items-center justify-center gap-2 rounded-full tracking-tight font-sans transition-all active:translate-y-[1px] active:scale-[0.98] select-none cursor-pointer whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

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
