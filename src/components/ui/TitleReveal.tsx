import React, { useRef } from 'react'
import { useFirstReveal } from '../../lib/useFirstReveal'
import { TextReveal } from './cascade-text'

interface TitleRevealProps {
  text?: string
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span'
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  waitForPreloader?: boolean
  hoverColor?: string
  direction?: 'up' | 'down'
}

/**
 * Progressive left-to-right blur reveal on first appearance combined with
 * interactive character-cascade purple hover interaction (`cascade-text.tsx`).
 */
export default function TitleReveal({
  text,
  children,
  as: Tag = 'h1',
  className = '',
  style,
  delay = 0,
  waitForPreloader = false,
  hoverColor = 'var(--accent-orange)',
  direction = 'up',
}: TitleRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const isRevealed = useFirstReveal(rootRef, waitForPreloader)

  const rawString =
    typeof text === 'string'
      ? text
      : typeof children === 'string'
      ? children
      : ''

  if (!rawString) {
    return React.createElement(Tag, { className, style }, children)
  }

  const adaptiveHoverStagger = Math.min(24, Math.max(10, Math.round(320 / Math.max(1, rawString.length))))
  const adaptiveRevealStagger = Math.min(26, Math.max(11, Math.round(420 / Math.max(1, rawString.length))))

  return React.createElement(
    Tag,
    {
      ref: rootRef as React.Ref<HTMLHeadingElement>,
      className,
      style,
    },
    <TextReveal
      as="span"
      text={rawString}
      revealed={isRevealed}
      blurOnReveal
      revealDelay={Math.round(delay * 1000)}
      revealStagger={adaptiveRevealStagger}
      revealDuration={520}
      staggerDelay={adaptiveHoverStagger}
      duration={260}
      hoverColor={hoverColor}
      direction={direction}
      className="inline-block"
    />
  )
}
