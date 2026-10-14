import React from 'react'

interface AuroraBackgroundProps {
  className?: string
  variant?: 'hero' | 'card' | 'compact' | 'subtle'
  style?: React.CSSProperties
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className = '',
  variant = 'hero',
  style = {},
}) => {
  if (variant === 'card') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] -z-10 ${className}`}
        style={style}
        aria-hidden="true"
      >
        <div
          className="absolute -top-1/4 -right-1/4 w-[140%] h-[140%] opacity-25 blur-[60px]"
          style={{
            background: 'var(--aurora)',
            maskImage: 'radial-gradient(circle at 60% 40%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 60% 40%, black 20%, transparent 70%)',
          }}
        />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={`absolute pointer-events-none overflow-hidden -z-10 ${className}`}
        style={style}
        aria-hidden="true"
      >
        <div
          className="w-full h-full opacity-30 blur-[50px]"
          style={{
            background: 'var(--aurora)',
            borderRadius: '999px',
          }}
        />
      </div>
    )
  }

  // Default: Hero Aurora Band (horizontal band ~55-70% width, height ~420px, blur 80px, opacity 0.88, slow drift)
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-visible -z-10 flex items-center justify-center ${className}`}
      style={{
        width: '100%',
        maxWidth: '1280px',
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        className="w-[90vw] max-w-[1000px] h-[320px] sm:h-[400px] rounded-[100%] opacity-55 blur-[85px] sm:blur-[105px] animate-aurora-drift"
        style={{
          background: 'var(--aurora)',
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 80%)',
          transformOrigin: 'center center',
        }}
      />
      {/* Soft central white gradient overlay to ensure perfect contrast and clean text reading */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(250, 250, 252, 0.45) 0%, transparent 75%)',
        }}
      />
    </div>
  )
}

export default AuroraBackground
