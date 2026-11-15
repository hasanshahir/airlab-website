import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryItem } from '../types/data'
import SectionReveal from '../components/ui/SectionReveal'
import TitleReveal from '../components/ui/TitleReveal'

const GALLERY_FILTERS = ['All', 'Visit', 'Session', 'Mentoring', 'Lab'] as const
type GalleryFilter = (typeof GALLERY_FILTERS)[number]

const BENTO_SPANS = [
  'sm:col-span-2',
  'sm:col-span-1',
  'sm:col-span-1',
  'sm:col-span-2',
  'sm:col-span-1',
  'sm:col-span-1',
  'sm:col-span-1',
] as const

interface GalleryPhotoCard {
  key: string
  title: string
  cat: Exclude<GalleryFilter, 'All'>
  date?: string
  caption: string
  url: string
  span?: string
}

function normalizeGalleryCategory(cat?: string, title?: string): Exclude<GalleryFilter, 'All'> {
  const c = (cat || '').trim().toLowerCase()
  const t = (title || '').trim().toLowerCase()
  if (c === 'visit' || c.includes('visit') || c.includes('campus') || c.includes('ceremony') || c.includes('performer')) {
    return 'Visit'
  }
  if (c === 'session' || c.includes('session') || c.includes('sprint') || c.includes('student')) {
    return 'Session'
  }
  if (c === 'mentoring' || c.includes('mentor') || c.includes('academic') || c.includes('review') || c.includes('sync') || t.includes('mentor') || t.includes('review') || t.includes('sync')) {
    return 'Mentoring'
  }
  if (c === 'laboratory' || c.includes('lab') || c.includes('compute') || c.includes('hardware')) {
    return 'Lab'
  }
  return 'Lab'
}

function expandGalleryItems(items: GalleryItem[]): GalleryPhotoCard[] {
  const cards: GalleryPhotoCard[] = []
  for (const item of items) {
    const cat = normalizeGalleryCategory(item.cat, item.title)
    const rawPhotos = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.url
        ? [item.url]
        : []

    const normalized = rawPhotos
      .map(entry => {
        if (typeof entry === 'string') {
          return { url: entry.trim(), caption: '' }
        }
        if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
          return { url: entry.url.trim(), caption: (entry.caption || '').trim() }
        }
        return null
      })
      .filter((p): p is { url: string; caption: string } => Boolean(p && p.url))

    normalized.forEach((photo, idx) => {
      cards.push({
        key: `${item._id || item.id}-${idx}`,
        title: item.title,
        cat,
        date: item.date,
        caption: photo.caption || item.desc || '',
        url: photo.url,
        span: normalized.length === 1 ? item.span : undefined,
      })
    })
  }
  return cards
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('All')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/content/gallery', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : []))
      .then(d => {
        if (!active) return
        if (Array.isArray(d)) {
          setGalleryItems(d)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const allCards = useMemo(() => expandGalleryItems(galleryItems), [galleryItems])

  const filteredCards = useMemo(() => {
    if (activeFilter === 'All') return allCards
    return allCards.filter(card => card.cat === activeFilter)
  }, [allCards, activeFilter])

  const selectedCard = selectedIndex !== null ? filteredCards[selectedIndex] ?? null : null

  const goPrev = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev === null || filteredCards.length <= 1) return prev
      return (prev - 1 + filteredCards.length) % filteredCards.length
    })
  }, [filteredCards.length])

  const goNext = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev === null || filteredCards.length <= 1) return prev
      return (prev + 1) % filteredCards.length
    })
  }, [filteredCards.length])

  // Safe scroll lock & keyboard navigation for lightbox modal
  useEffect(() => {
    if (selectedIndex === null) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null)
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedIndex, goPrev, goNext])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-10 text-left max-w-3xl">
        <TitleReveal
          as="h1"
          waitForPreloader
          className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight"
        >
          Laboratory Gallery & Media
        </TitleReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Visual documentation of laboratory infrastructure, mentoring sessions, technical sprints, and campus visits.
          </p>
        </SectionReveal>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-10 flex flex-wrap items-center gap-2.5 text-left">
        {GALLERY_FILTERS.map(filter => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter)
                setSelectedIndex(null)
              }}
              className={`h-10 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-sm'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {/* Image Grid with 24px Rounded Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-dense auto-rows-[300px] gap-6 text-left">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-full rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] animate-pulse"
            />
          ))
        ) : filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)]">
            <p className="text-sm font-sans text-[var(--text-muted)]">
              {allCards.length === 0
                ? 'No gallery photos published yet.'
                : 'No media items found in this category.'}
            </p>
          </div>
        ) : (
          filteredCards.map((card, i) => (
            <div
              key={card.key}
              className={`${card.span || BENTO_SPANS[i % BENTO_SPANS.length]} h-full`}
            >
              <div
                onClick={() => setSelectedIndex(i)}
                className="h-full relative rounded-3xl overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-surface)] cursor-pointer group shadow-sm hover:border-[var(--accent-orange)]/50 hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <img
                  src={card.url}
                  alt={card.caption || card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 left-4 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold backdrop-blur-sm border border-white/15">
                    {card.cat}
                  </span>
                </div>

                <div className="absolute top-4 right-4 pointer-events-none">
                  <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center shadow-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                  <h3 className="text-base sm:text-lg font-semibold font-head text-white leading-tight mb-1">
                    {card.title}
                  </h3>
                  {card.caption && (
                    <p className="text-xs text-white/80 line-clamp-1">{card.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedCard && selectedIndex !== null && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedIndex(null)}
                  className="absolute inset-0 bg-black/75 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-w-4xl w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl overflow-hidden shadow-2xl z-10 text-left"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(null)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20 cursor-pointer shadow-md"
                    aria-label="Close image modal"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative max-h-[65vh] w-full bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedCard.url}
                      alt={selectedCard.caption || selectedCard.title}
                      className="w-full h-full object-contain max-h-[65vh]"
                    />

                    {filteredCards.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          aria-label="Previous photo"
                          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          aria-label="Next photo"
                          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-[11px] font-semibold">
                          {selectedCard.cat}
                        </span>
                        {selectedCard.date && (
                          <span className="text-xs text-[var(--text-muted)]">{selectedCard.date}</span>
                        )}
                      </div>
                      {filteredCards.length > 1 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {selectedIndex + 1} / {filteredCards.length}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-head text-[var(--text-primary)] mb-2">
                      {selectedCard.title}
                    </h3>
                    {selectedCard.caption && (
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{selectedCard.caption}</p>
                    )}
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
