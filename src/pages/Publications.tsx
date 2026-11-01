import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Copy, Check, Award, FileText, Download, ExternalLink, Search } from 'lucide-react'
import { getPublications } from '../lib/data'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'

export default function Publications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const pubData = useMemo(() => getPublications(), [])

  // Enforce sorted order: recent papers at top (descending by year, then by id)
  const sortedPublications = useMemo(() => {
    return [...pubData].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.id - a.id
    })
  }, [pubData])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sortedPublications
    const q = searchQuery.toLowerCase()
    return sortedPublications.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.authors.toLowerCase().includes(q) ||
      p.venue.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    )
  }, [sortedPublications, searchQuery])

  const copyBibtex = (p: typeof pubData[0]) => {
    const bib = `@${p.type === 'Journal' ? 'article' : 'inproceedings'}{air_${p.id},\n  title={${p.title}},\n  author={${p.authors}},\n  ${p.type === 'Journal' ? 'journal' : 'booktitle'}={${p.venue}},\n  year={${p.year}}\n}`
    navigator.clipboard.writeText(bib)
    setCopiedId(p.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<BookOpen className="w-3.5 h-3.5 text-white" />}>
              PEER-REVIEWED SCIENTIFIC OUTPUT
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Research Papers & Publications
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Groundbreaking peer-reviewed journals, international conference proceedings, and foundational preprints sorted chronologically by most recent first.
          </p>
        </SectionReveal>
      </div>

      {/* Search & Count Bar */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6 text-left">
        <div className="text-xs font-mono text-[var(--text-muted)]">
          Showing <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> publications sorted by year
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            placeholder="Search papers, authors, venues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] transition-all"
          />
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {filtered.map((pub, i) => {
              const isJournal = pub.type === 'Journal'
              return (
                <div
                  key={pub.id}
                  className="p-8 sm:p-10 flex flex-col md:flex-row md:items-start justify-between gap-6 group hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200 text-left bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  <div className="space-y-3.5 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isJournal ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20">
                          <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                          Journal Paper
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[var(--ink-dark)] text-white">
                          <FileText className="w-3.5 h-3.5" />
                          Conference Proceeding
                        </span>
                      )}

                      {'impactFactor' in pub && pub.impactFactor && (
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]">
                          {pub.impactFactor}
                        </span>
                      )}

                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[var(--bg-page)] text-[var(--accent-orange)] border border-[var(--border-hairline)]">
                        Year: {pub.year}
                      </span>
                    </div>

                    {/* Paper Title */}
                    <h2 className="text-[20px] sm:text-[22px] font-semibold font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug">
                      {pub.title}
                    </h2>

                    {/* Venue */}
                    <div className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                      <span className="text-[var(--ink-dark)] font-bold font-mono text-xs">VENUE:</span>
                      <span>{pub.venue}</span>
                    </div>

                    {/* Authors */}
                    <p className="text-xs sm:text-[13.5px] font-mono text-[var(--text-muted)]">
                      Authors: <span className="text-[var(--text-primary)] font-semibold">{pub.authors}</span>
                    </p>

                    {/* DOI */}
                    {pub.doi && (
                      <div className="text-xs font-mono text-[var(--text-subtle)]">
                        DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-orange)] hover:underline">{pub.doi}</a>
                      </div>
                    )}

                    {/* Abstract snippet */}
                    {pub.abstract && (
                      <p className="text-xs sm:text-[14px] text-[var(--text-muted)] italic leading-relaxed pt-1 font-normal">
                        "{pub.abstract}"
                      </p>
                    )}

                    {/* Tags */}
                    {pub.tags && Array.isArray(pub.tags) && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {pub.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-0.5 rounded-full text-[11px] font-mono bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Read Link, PDF, BibTeX Cite */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--border-hairline)]">
                    {pub.link && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-4 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Read Paper</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {pub.pdf && (
                      <a
                        href={pub.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-4 rounded-full bg-[var(--ink-dark)] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    )}

                    <button
                      onClick={() => copyBibtex(pub)}
                      className="h-9 px-4 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface)] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap font-medium"
                      title="Copy BibTeX Citation"
                    >
                      {copiedId === pub.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                          <span className="text-[var(--accent-orange)] font-semibold">Citation Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)]">
            <p className="text-sm font-mono text-[var(--text-muted)]">No publications matched your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
