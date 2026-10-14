import React from 'react'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: React.ReactNode
  delay?: number
  staggerIndex?: number
  className?: string
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  delay = 0,
  staggerIndex = 0,
  className = '',
}) => {
  const totalDelay = delay + staggerIndex * 0.06

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.5,
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
