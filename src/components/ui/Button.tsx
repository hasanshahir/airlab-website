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
      'bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white font-medium shadow-sm hover:shadow transition-all duration-150',
    secondary:
      'bg-[var(--bg-surface)] hover:bg-[#E8E2D8] text-[var(--text-primary)] border border-[var(--border-hairline)] font-medium transition-all duration-150',
    outline:
      'bg-transparent hover:bg-[rgba(10,50,53,0.06)] text-[var(--text-primary)] border border-[var(--border-hairline-dark)] font-medium transition-colors duration-150',
    ghost:
      'bg-transparent hover:bg-[rgba(10,50,53,0.06)] text-[var(--text-primary)] font-medium transition-colors duration-150',
  }

  const showArrow = arrow !== undefined ? arrow : variant === 'primary'

  const sharedClasses = `group inline-flex items-center justify-center gap-2 rounded-full tracking-tight font-sans transition-all active:translate-y-[1px] select-none cursor-pointer whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

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
