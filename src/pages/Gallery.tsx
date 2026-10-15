import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Maximize2 } from 'lucide-react'
import galleryData from '../data/gallery.json'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryData[0] | null>(null)

  // Safe scroll lock for lightbox modal
  useEffect(() => {
    if (selectedImage) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedImage(null)
      }
      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectedImage])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-12 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<Camera className="w-3.5 h-3.5 text-white" />}>
              MEDIA, SIGHTS & LAB LIFE
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-3 tracking-tight">
            Laboratory Gallery & Media
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Visual documentation of supercomputer commissioning, outdoor drone flight trials, hardware prototyping, and hackathons.
          </p>
        </SectionReveal>
      </div>

      {/* Simple, Filter-free Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[280px] gap-6 text-left">
        {galleryData.map((item, i) => (
          <div
            key={item.id}
            className={`${item.span || ''} h-full`}
          >
            <div
              onClick={() => setSelectedImage(item)}
              className="h-full relative rounded-[4px] overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-surface)] cursor-pointer group shadow-sm hover:border-[var(--accent-purple)] transition-all"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="p-1.5 rounded-[2px] bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                <h3 className="text-base sm:text-lg font-medium font-head text-white leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedImage && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="absolute inset-0 bg-black/70 backdrop-blur-[16px]"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-w-4xl w-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] overflow-hidden shadow-2xl z-10 text-left"
                >
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-[2px] bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20 cursor-pointer"
                    aria-label="Close image modal"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="max-h-[65vh] w-full bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      className="w-full h-full object-contain max-h-[65vh]"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-medium font-head text-[var(--text-primary)] mb-1">
                      {selectedImage.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">{selectedImage.desc}</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
