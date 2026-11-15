import React from 'react'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: React.ReactNode
  delay?: number
  staggerIndex?: number
  blur?: boolean
  className?: string
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  delay = 0,
  staggerIndex = 0,
  blur = true,
  className = '',
}) => {
  const totalDelay = delay + staggerIndex * 0.06

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
        ...(blur ? { filter: 'blur(8px)' } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
      }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.55,
        delay: totalDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default SectionReveal
