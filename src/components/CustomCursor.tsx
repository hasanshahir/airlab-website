import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Spring physics for the outer ring lag with snappy haptic response
  const springConfig = { damping: 22, stiffness: 350, mass: 0.45 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only run on desktop/devices with a fine pointer
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Check if hovering over an interactive element
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => {
      setIsClicking(true)
      // Haptic tactile pulse for supported browsers/hardware
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(12)
        } catch (_) {}
      }
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY, isVisible])

  // Don't render on touch / mobile devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  // Calculate dynamic scale with haptic feedback recoil on click
  let targetScale = 1
  if (isHovering && isClicking) {
    targetScale = 1.25 // haptic compression while hovering
  } else if (isHovering) {
    targetScale = 1.65 // expansive hover ring
  } else if (isClicking) {
    targetScale = 0.75 // haptic recoil click snap
  }

  return (
    <>
      {/* ── Center Dot: Precision target matching color theme ── */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -ml-1 -mt-1"
        style={{
          x: cursorX,
          y: cursorY,
          backgroundColor: 'var(--accent-orange)',
          boxShadow: '0 0 8px rgba(240, 78, 31, 0.65)',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isClicking ? 0.6 : isHovering ? 1.2 : 1,
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />

      {/* ── Outer Ring: Completely HOLLOW with crisp outline of the color theme & haptic spring recoil ── */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] -ml-4 -mt-4 flex items-center justify-center"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          backgroundColor: 'transparent',
          border: '1.75px solid var(--accent-orange)',
          boxShadow: isHovering
            ? '0 0 16px rgba(240, 78, 31, 0.45), inset 0 0 6px rgba(240, 78, 31, 0.15)'
            : '0 0 8px rgba(240, 78, 31, 0.25)',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: targetScale,
          borderColor: isClicking ? 'var(--accent-purple)' : 'var(--accent-orange)',
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 420,
          mass: 0.4,
        }}
      />
    </>
  )
}

export default CustomCursor
