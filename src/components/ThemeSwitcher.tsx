import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Sun, Moon, Check, Sparkles, X } from 'lucide-react'
import { useTheme, THEME_OPTIONS } from './ThemeProvider'

export default function ThemeSwitcher() {
  const { palette, setPalette, isDark, toggleDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-3 w-80 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-2xl p-4 shadow-2xl shadow-black/40 text-[var(--fg)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Lab Theme Interface</h4>
                  <p className="text-[10px] text-[var(--fg-sub)]">Select engineering color palette</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md hover:bg-[var(--fg)]/10 flex items-center justify-center text-[var(--fg-sub)] hover:text-[var(--fg)] transition-colors"
                aria-label="Close theme panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-between mb-3 px-2 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
              <span className="text-xs font-mono font-medium">Display Mode:</span>
              <button
                onClick={toggleDark}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer shadow-sm"
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Dark Tech</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Tech</span>
                  </>
                )}
              </button>
            </div>

            {/* Palette Grid */}
            <div className="space-y-1.5">
              {THEME_OPTIONS.map(opt => {
                const isSelected = palette === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPalette(opt.id)
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/50 text-[var(--fg)] shadow-sm'
                        : 'hover:bg-[var(--fg)]/5 border border-transparent text-[var(--fg-sub)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center -space-x-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: opt.accent }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: opt.subAccent }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: opt.tertiary }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight font-mono flex items-center gap-1.5">
                          {opt.name}
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-ping" />}
                        </div>
                        <div className="text-[10px] text-[var(--fg-sub)] line-clamp-1">{opt.description}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[var(--primary)] shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-xl shadow-xl shadow-black/30 hover:border-[var(--primary)] transition-all cursor-pointer"
        aria-label="Change theme"
      >
        <div className="flex items-center -space-x-1">
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20 animate-pulse"
            style={{ backgroundColor: activeTheme.accent }}
          />
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20"
            style={{ backgroundColor: activeTheme.subAccent }}
          />
        </div>
        <span className="text-xs font-mono font-bold tracking-tight text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
          {activeTheme.name.split(' ')[0]}
        </span>
        <Palette className="w-3.5 h-3.5 text-[var(--fg-sub)] group-hover:text-[var(--primary)] transition-colors" />
      </motion.button>
    </div>
  )
}
