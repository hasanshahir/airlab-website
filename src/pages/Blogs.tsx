import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Search,
  Sparkles,
  Calendar,
  User,
  Tag,
  ArrowRight,
  X,
} from 'lucide-react'
import SectionReveal from '../components/ui/SectionReveal'
import rawBlogs from '../data/blogs.json'

export interface BlogPost {
  _id?: string
  id?: string | number
  title: string
  link?: string
  author?: string
  date?: string
  excerpt?: string
  content?: string
  tag?: string
  tags?: string[]
  readTime?: string
  order?: number
  published?: boolean
  image?: string
}

export default function Blogs() {
  const [blogsData, setBlogsData] = useState<BlogPost[]>(() =>
    Array.isArray(rawBlogs) ? (rawBlogs as BlogPost[]) : []
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [activePost, setActivePost] = useState<BlogPost | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/content/blogs')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (!active) return
        if (Array.isArray(data) && data.length > 0) {
          setBlogsData(data)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    blogsData.forEach(blog => {
      if (blog.tag) set.add(blog.tag.trim())
      if (Array.isArray(blog.tags)) {
        blog.tags.forEach(t => t && set.add(t.trim()))
      }
    })
    return ['All', ...Array.from(set)]
  }, [blogsData])

  // Filtered & sorted blogs (newest date first)
  const filtered = useMemo(() => {
    const sorted = [...blogsData].sort((a, b) => {
      const timeA = a.date ? Date.parse(a.date) : NaN
      const timeB = b.date ? Date.parse(b.date) : NaN
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeB !== timeA) {
        return timeB - timeA
      }
      return (a.order ?? 0) - (b.order ?? 0)
    })

    return sorted.filter(blog => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        blog.title?.toLowerCase().includes(q) ||
        blog.author?.toLowerCase().includes(q) ||
        blog.date?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.tag?.toLowerCase().includes(q) ||
        (Array.isArray(blog.tags) && blog.tags.some(t => t.toLowerCase().includes(q)))

      const blogTags = [
        blog.tag?.toLowerCase(),
        ...(Array.isArray(blog.tags) ? blog.tags.map(t => t.toLowerCase()) : []),
      ].filter(Boolean)

      const matchesTag =
        selectedTag === 'All' || blogTags.includes(selectedTag.toLowerCase())

      return matchesSearch && matchesTag
    })
  }, [blogsData, searchQuery, selectedTag])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* ── Section Header ── */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-subtle)] mb-4 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>DISPATCHES & FIELD NOTES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.1] font-head">
            Research Blogs & Dispatches
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] mt-4 leading-relaxed font-normal">
            In-depth architectural breakdowns, engineering postmortems, and field deployment dispatches authored by AIR Lab scientists and researchers.
          </p>
        </SectionReveal>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-[var(--border-hairline)] pb-6 text-left">
        {/* Tag Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[var(--ink-dark)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            placeholder="Search articles, topics, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] transition-all"
          />
        </div>
      </div>

      {/* ── Blogs Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)]">
          <Sparkles className="w-8 h-8 text-[var(--accent-orange)] mx-auto mb-3 opacity-60" />
          <p className="text-sm sm:text-base font-sans font-medium text-[var(--text-primary)]">
            {searchQuery || selectedTag !== 'All'
              ? 'No blog posts match your filter criteria.'
              : 'No blog posts published yet.'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            {searchQuery || selectedTag !== 'All'
              ? 'Try adjusting your search keywords or switching category filters.'
              : 'Our researchers are crafting deep dives and postmortems. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filtered.map((blog, idx) => {
            const tags = [
              blog.tag,
              ...(Array.isArray(blog.tags) ? blog.tags : []),
            ].filter(Boolean) as string[]
            const itemKey = blog._id || blog.id || blog.title || idx

            const handleCardClick = () => {
              if (blog.link && !blog.content && !blog.excerpt) {
                window.open(blog.link, '_blank', 'noopener,noreferrer')
              } else {
                setActivePost(blog)
              }
            }

            return (
              <article
                key={itemKey}
                onClick={handleCardClick}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer overflow-hidden"
              >
                <div>
                  {blog.image && (
                    <div className="w-full h-48 overflow-hidden bg-[var(--bg-page)] border-b border-[var(--border-hairline)]">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-7 pb-0">
                    <div className="flex items-center justify-between text-xs text-[var(--text-subtle)] mb-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        <span>{blog.readTime || 'Research Dispatch'}</span>
                      </div>
                      {blog.date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{blog.date}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug mb-3">
                      {blog.title}
                    </h3>

                    {blog.excerpt && (
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-normal mb-5 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {tags.map(t => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)] font-medium inline-flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-[var(--accent-orange)]" />
                            <span>{t}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mx-7 my-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{blog.author || 'AIR Lab'}</span>
                  </span>
                  {blog.link ? (
                    <a
                      href={blog.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] group-hover:translate-x-0.5 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ── Article Detail Modal ── */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl p-6 sm:p-10 shadow-2xl z-10 max-h-[85vh] overflow-y-auto text-left"
            >
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-4">
                <span className="inline-flex items-center gap-1 text-[var(--accent-orange)] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {activePost.readTime || 'Research Dispatch'}
                </span>
                {activePost.date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {activePost.date}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {activePost.author || 'AIR Lab'}
                </span>
              </div>

              {activePost.image && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--border-hairline)] max-h-64 bg-[var(--bg-page)]">
                  <img
                    src={activePost.image}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-bold font-head text-[var(--text-primary)] tracking-tight mb-4 leading-snug">
                {activePost.title}
              </h2>

              {activePost.tag && (
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-[var(--bg-surface)] text-[var(--accent-orange)] border border-[var(--border-hairline)]">
                    #{activePost.tag}
                  </span>
                </div>
              )}

              {(activePost.content || activePost.excerpt) && (
                <div className="prose prose-sm text-[var(--text-primary)] leading-relaxed space-y-4 pt-4 border-t border-[var(--border-hairline)]">
                  <p className="text-base text-[var(--text-muted)] font-normal leading-relaxed">
                    {activePost.content || activePost.excerpt}
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[var(--border-hairline)] flex items-center justify-end gap-3">
                {activePost.link && (
                  <a
                    href={activePost.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setActivePost(null)}
                  className="px-5 py-2 rounded-full bg-[var(--ink-dark)] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
