import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

export interface AccordionItem {
  q: string
  a: string
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpenIndex?: number | null
  className?: string
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenIndex = 0,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex)

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx))
  }

  return (
    <div className={`w-full divide-y divide-[var(--line)] border-y border-[var(--line)] ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div key={idx} className="group py-5 sm:py-6 transition-colors">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between gap-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] rounded-[2px]"
              aria-expanded={isOpen}
            >
              <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[var(--ink)] group-hover:text-[var(--accent-orange)] transition-colors font-sans">
                {item.q}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-7 h-7 rounded-[2px] bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink-2)] shadow-[var(--shadow-sm)] group-hover:border-[var(--accent-purple)]"
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pt-3 pb-1 text-[15px] sm:text-[16px] text-[var(--ink-2)] leading-relaxed max-w-3xl font-sans">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
