import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  Users,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProjects, getTeamMembers } from '../lib/data'
import type { ProjectItem, TeamMemberData } from '../types/data'
import { getProjectCover, DEFAULT_PROJECT_COVER } from '../lib/placeholders'

function parseDateScore(dateStr?: string): number {
  if (!dateStr) return 0
  const months: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  }
  const lower = dateStr.toLowerCase()
  const yearMatch = lower.match(/\b(19\d\d|20\d\d)\b/)
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 0
  let month = 0
  for (const [m, num] of Object.entries(months)) {
    if (lower.includes(m)) {
      month = num
      break
    }
  }
  return year * 100 + month
}

// Canonical research area mappings for all projects ensuring 100% reliable categorization
const CANONICAL_PROJECT_AREAS: Record<string, string[]> = {
  'PRJ-7': [
    'Cyber',
    'Adversarial AI',
    'Efficient Computing & TinyML',
    'AI Safety & Alignment',
  ],
  'PRJ-8': [
    'Foundational Models & NLP',
    'Efficient Computing & TinyML',
    'Cyber',
    'Development',
  ],
  'PRJ-9': [
    'Adversarial AI',
    'Cyber',
    'AI Safety & Alignment',
    'Foundational Models & NLP',
  ],
  'PRJ-10': [
    'Foundational Models & NLP',
    'Development',
    'Efficient Computing & TinyML',
  ],
  'PRJ-NED-SAC': [
    'Cyber',
    'Efficient Computing & TinyML',
    'Development',
    'AI Safety & Alignment',
  ],
  'PRJ-1': [
    'Foundational Models & NLP',
    'Cyber',
    'AI Safety & Alignment',
    'Development',
  ],
  'PRJ-2': [
    'Cyber',
    'Development',
    'Foundational Models & NLP',
    'Adversarial AI',
  ],
  'PRJ-3': [
    'Development',
    'Cyber',
    'Adversarial AI',
    'Foundational Models & NLP',
  ],
  'PRJ-4': [
    'Foundational Models & NLP',
    'Efficient Computing & TinyML',
    'Development',
    'AI Safety & Alignment',
  ],
  'PRJ-5': [
    'Development',
    'Cyber',
    'Foundational Models & NLP',
  ],
  'PRJ-6': [
    'Foundational Models & NLP',
    'Development',
    'AI Safety & Alignment',
  ],
}

function getProjectAreas(project: ProjectItem): string[] {
  if (Array.isArray(project.areas) && project.areas.length > 0) {
    return project.areas
  }
  const idStr = String(project.id)
  if (CANONICAL_PROJECT_AREAS[idStr]) {
    return CANONICAL_PROJECT_AREAS[idStr]
  }
  const cleanId = idStr.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  for (const [key, areas] of Object.entries(CANONICAL_PROJECT_AREAS)) {
    if (key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanId) {
      return areas
    }
  }
  return []
}

function projectMatchesResearchArea(project: ProjectItem, targetArea: string): boolean {
  const normTarget = targetArea.trim().toLowerCase()
  const areas = getProjectAreas(project).map(a => a.toLowerCase())
  if (areas.some(a => a === normTarget || a.includes(normTarget) || normTarget.includes(a))) {
    return true
  }

  // Check tags
  const tags = (project.tags || []).map(t => t.toLowerCase())
  if (tags.some(t => t.includes(normTarget) || normTarget.includes(t))) {
    return true
  }

  // Keyword match fallback based on the 6 core research areas
  const text = `${project.title} ${project.description}`.toLowerCase()
  if (normTarget.includes('foundational') || normTarget.includes('nlp')) {
    return text.includes('nlp') || text.includes('llm') || text.includes('slm') || text.includes('language model') || text.includes('tokenizer')
  }
  if (normTarget.includes('adversarial')) {
    return text.includes('adversarial') || text.includes('poisoning') || text.includes('jailbreak') || text.includes('attack') || text.includes('vulnerabilit')
  }
  if (normTarget.includes('cyber')) {
    return text.includes('cyber') || text.includes('security') || text.includes('investigation') || text.includes('forensics') || text.includes('defense') || text.includes('telemetry')
  }
  if (normTarget.includes('development')) {
    return text.includes('development') || text.includes('platform') || text.includes('system') || text.includes('agent') || text.includes('software') || text.includes('microservices')
  }
  if (normTarget.includes('efficient') || normTarget.includes('tinyml')) {
    return text.includes('tinyml') || text.includes('edge') || text.includes('quantization') || text.includes('offline') || text.includes('hardware') || text.includes('fpga') || text.includes('embedded')
  }
  if (normTarget.includes('safety') || normTarget.includes('alignment')) {
    return text.includes('safety') || text.includes('alignment') || text.includes('privacy') || text.includes('unbiased') || text.includes('fairness') || text.includes('robust')
  }
  return false
}

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeArea, setActiveArea] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0)

  // Old visible categories that the user sees in the filter pills row
  const visibleCategories = ['All', 'Funded', 'Undergraduate', 'Postgraduate']

  const [projectsData, setProjectsData] = useState<ProjectItem[]>(() => {
    const list = getProjects()
    return list.map(p => ({
      ...p,
      areas: getProjectAreas(p),
    }))
  })
  const [allMembers, setAllMembers] = useState<TeamMemberData[]>(() => getTeamMembers())

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/content/projects').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/content/team').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([projs, team]) => {
      if (!active) return
      if (Array.isArray(projs) && projs.length > 0) {
        const localList = getProjects()
        const merged = projs.map(p => {
          const local = localList.find(lp => String(lp.id) === String(p.id))
          const areas = (Array.isArray(p.areas) && p.areas.length > 0)
            ? p.areas
            : (local?.areas || getProjectAreas(p))
          return {
            ...local,
            ...p,
            areas,
          }
        })
        setProjectsData(merged)
      }
      if (Array.isArray(team) && team.length > 0) setAllMembers(team)
    })
    return () => { active = false }
  }, [])

  // Synchronize activeArea with URL query parameter (?area=...) when directed from Home cards
  useEffect(() => {
    const getParam = (name: string): string | null => {
      const fromParams = searchParams.get(name)
      if (fromParams) return fromParams

      // Fallback check in hash if present (e.g. #/projects?area=Cyber)
      if (typeof window !== 'undefined' && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1]
        const params = new URLSearchParams(hashQuery)
        const p = params.get(name)
        if (p) return p
      }

      // Fallback check in search if present (e.g. ?area=Cyber#/projects)
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search)
        const p = params.get(name)
        if (p) return p
      }

      return null
    }

    const areaParam = getParam('area')
    const catParam = getParam('category')

    if (areaParam) {
      setActiveArea(decodeURIComponent(areaParam))
      setActiveCategory('All')
    } else if (catParam) {
      const match = visibleCategories.find(c => c.toLowerCase() === decodeURIComponent(catParam).toLowerCase())
      setActiveCategory(match || 'All')
      setActiveArea(null)
    } else {
      setActiveArea(null)
    }
  }, [searchParams])

  const handleCategoryChange = (cat: string) => {
    setActiveArea(null)
    setActiveCategory(cat)
    const next = new URLSearchParams(searchParams)
    next.delete('area')
    if (cat === 'All') {
      next.delete('category')
    } else {
      next.set('category', cat)
    }
    setSearchParams(next)
  }

  // Handle direct deep-linking from home cards (e.g. /projects#PRJ-1 or #PRJ-6)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash) return
      const cleanHash = hash.split('?')[0].replace('/projects', '').replace(/^\/+/, '')
      if (!cleanHash) return
      const matched = projectsData.find(
        p =>
          String(p.id).toLowerCase() === cleanHash.toLowerCase() ||
          String(p.id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanHash.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      )
      if (matched) {
        setActiveArea(null)
        setActiveCategory('All')
        setSelectedProject(matched)
        setTimeout(() => {
          const el = document.getElementById(String(matched.id))
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 150)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [projectsData])

  // Prevent background layout shift & lock scroll safely when modal is open
  useEffect(() => {
    if (selectedProject) {
      const scrollY = window.scrollY
      const originalOverflow = document.body.style.overflow
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedProject(null)
      }
      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = ''
        window.scrollTo(0, scrollY)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectedProject])

  const filtered = useMemo(() => {
    const list = projectsData.filter(p => {
      // 1. Invisible Research Area filter (active only when user clicked a card's "View Projects" link)
      if (activeArea) {
        if (!projectMatchesResearchArea(p, activeArea)) {
          return false
        }
      }

      // 2. Visible category filter ('All', 'Funded', 'Undergraduate', 'Postgraduate')
      if (!activeArea && activeCategory !== 'All') {
        const cat = p.category?.toLowerCase() || ''
        if (cat !== activeCategory.toLowerCase()) {
          return false
        }
      }

      // 3. Search query filter
      if (query.trim() !== '') {
        const q = query.toLowerCase()
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          Boolean(p.funding && p.funding.toLowerCase().includes(q)) ||
          Boolean(p.tags?.some(t => t.toLowerCase().includes(q))) ||
          getProjectAreas(p).some(a => a.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }

      return true
    })

    // Sort: Ongoing projects at the top, Finished / older projects at the bottom; within groups, most recent first
    return list.slice().sort((a, b) => {
      const isOngoingA = a.status === 'Ongoing'
      const isOngoingB = b.status === 'Ongoing'

      if (isOngoingA && !isOngoingB) return -1
      if (!isOngoingA && isOngoingB) return 1

      const scoreA = Math.max(parseDateScore(a.startDate), parseDateScore(a.timeTaken), parseDateScore(a.endDate))
      const scoreB = Math.max(parseDateScore(b.startDate), parseDateScore(b.timeTaken), parseDateScore(b.endDate))

      return scoreB - scoreA
    })
  }, [projectsData, activeArea, activeCategory, query])

  // Resolve team members associated with selected project
  const projectMembers = useMemo(() => {
    if (!selectedProject?.memberIds) return []
    return selectedProject.memberIds
      .map(id => allMembers.find(m => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
  }, [selectedProject, allMembers])

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* ── Section Header ── */}
      <div className="mb-14 text-left max-w-3xl">
        <h1 className="text-3xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-4 font-head">
          Applied AI Systems & Projects
        </h1>

        <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
          From funded research to student-built systems, every project at AIR Lab is designed to solve a real problem for the people of Pakistan.
        </p>
      </div>

      {/* ── Category Filter Pills & Search ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 mb-8 pb-6 border-b border-[var(--border-hairline)]">
        {/* Category Pills (Old visible filters restored: All, Funded, Undergraduate, Postgraduate) */}
        <div className="flex flex-wrap items-center gap-2">
          {visibleCategories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                activeCategory === cat && !activeArea
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input (Pill Shaped) */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            placeholder="Search projects, grants..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] transition-all"
          />
        </div>
      </div>

      {/* Active Core Research Area Banner (Only visible when directed from Home card's View Projects link) */}
      {activeArea && (
        <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent-orange)]/40 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
            <span className="text-[var(--text-muted)]">Categorized by Core Research Area:</span>
            <span className="font-semibold text-[var(--accent-orange)] text-sm">{activeArea}</span>
            <span className="text-[var(--text-subtle)] text-[11px]">({filtered.length} projects)</span>
          </div>
          <button
            onClick={() => handleCategoryChange('All')}
            className="text-[11px] font-semibold text-[var(--accent-orange)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Show all projects</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Project Cards Grid (Generous 28px Rounded Stone Cards) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + query}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          {filtered.map(proj => {
            const isOngoing = proj.status === 'Ongoing'
            return (
              <div
                key={proj.id}
                id={String(proj.id)}
                onClick={() => {
                  setSelectedProject(proj)
                  setActiveGalleryIndex(0)
                }}
                className="group bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl p-6 flex flex-col justify-between hover:border-[var(--accent-orange)]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer relative"
              >
                <div>
                  {/* Image Cover Banner */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[var(--bg-page)] mb-5 border border-[var(--border-hairline)]">
                    <img
                      src={getProjectCover(proj.coverImage || proj.images?.[0])}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PROJECT_COVER
                      }}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Status badge (Ongoing / Finished) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[11px] font-sans font-semibold text-[var(--text-primary)] shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                        {proj.category}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-sans font-semibold flex items-center gap-1.5 ${
                          isOngoing
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--ink-dark)] text-white'
                        }`}
                      >
                        {isOngoing ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {proj.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug mb-2.5 font-head line-clamp-2">
                    {proj.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-5 line-clamp-3 font-normal">
                    {proj.description}
                  </p>

                  {/* Metadata Specs */}
                  <div className="space-y-1.5 mb-5 text-[12px] font-sans text-[var(--text-muted)] bg-[var(--bg-page)] p-3.5 rounded-2xl border border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-subtle)]">Timeline:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {proj.startDate} — {proj.endDate || 'Present'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-subtle)]">Funding:</span>
                      <span className="font-semibold text-[var(--accent-orange)] truncate max-w-[180px]">
                        {proj.funding}
                      </span>
                    </div>
                    {proj.pi && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-subtle)]">PI:</span>
                        <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                          {proj.pi}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-sans">
                  <span className="text-[var(--text-subtle)] uppercase tracking-wider text-[11px] font-medium">
                    {proj.category}
                  </span>
                  <span className="text-[var(--accent-orange)] font-semibold inline-flex items-center gap-1.5 group-hover:underline">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-[var(--border-hairline)] rounded-3xl bg-[var(--bg-surface)]">
          <p className="text-sm font-sans text-[var(--text-muted)]">
            {query ? `No projects match "${query}".` : 'No projects published yet.'}
          </p>
        </div>
      )}

      {/* ── Project Gallery & Specs Modal ── */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
                onClick={() => setSelectedProject(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left relative my-auto font-sans"
                >
                  <div className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] flex items-center justify-between select-none">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-sans font-semibold">
                        {selectedProject.status}
                      </span>
                      <span className="text-xs font-sans text-[var(--text-muted)]">
                        airlab.neduet.edu.pk/projects/{selectedProject.id}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-1.5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
                      aria-label="Close project modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                    {/* Image Gallery Viewer */}
                    {selectedProject.images && selectedProject.images.length > 0 && (
                      <div className="mb-6">
                        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-[var(--bg-page)] border border-[var(--border-hairline)] mb-3">
                          <img
                            src={getProjectCover(selectedProject.images[activeGalleryIndex] || selectedProject.coverImage)}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PROJECT_COVER
                            }}
                            alt={`${selectedProject.title} preview ${activeGalleryIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {selectedProject.images.length > 1 && (
                          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                            {selectedProject.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveGalleryIndex(idx)}
                                className={`w-20 h-14 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                                  activeGalleryIndex === idx
                                    ? 'border-[var(--accent-orange)] ring-2 ring-[var(--accent-orange)]'
                                    : 'border-[var(--border-hairline)] opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 font-head">
                      {selectedProject.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-8 font-normal">
                      {selectedProject.description}
                    </p>

                    {/* Specs Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans mb-8">
                      {selectedProject.areas && selectedProject.areas.length > 0 && (
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl col-span-1 sm:col-span-2">
                          <span className="text-[var(--text-subtle)] block mb-2 font-semibold">CORE RESEARCH AREAS</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProject.areas.map(area => (
                              <span
                                key={area}
                                className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                        <span className="text-[var(--text-subtle)] block mb-1">PROJECT TIMELINE</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {selectedProject.startDate} — {selectedProject.endDate || 'Ongoing'}
                          {selectedProject.timeTaken ? ` (${selectedProject.timeTaken})` : ''}
                        </span>
                      </div>
                      <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                        <span className="text-[var(--text-subtle)] block mb-1">GRANT & FUNDING SOURCE</span>
                        <Link to="/grants" onClick={() => setSelectedProject(null)} className="font-semibold text-[var(--accent-orange)] hover:underline">
                          {selectedProject.funding} &rarr;
                        </Link>
                        {selectedProject.grantAmount && selectedProject.grantAmount !== 'NA' && (
                          <div className="text-[11px] text-[var(--text-primary)] font-bold mt-1">
                            Amount: {selectedProject.grantAmount}
                          </div>
                        )}
                      </div>
                      {selectedProject.pi && (
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                          <span className="text-[var(--text-subtle)] block mb-1">PRINCIPAL INVESTIGATOR</span>
                          <span className="font-semibold text-[var(--text-primary)]">{selectedProject.pi}</span>
                        </div>
                      )}
                      <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                        <span className="text-[var(--text-subtle)] block mb-1">STATUS</span>
                        <span className="font-semibold text-[var(--accent-orange)]">{selectedProject.status} Review</span>
                      </div>
                      <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                        <span className="text-[var(--text-subtle)] block mb-1">PROJECT CATEGORY</span>
                        <span className="font-semibold text-[var(--text-primary)]">{selectedProject.category}</span>
                      </div>
                      {selectedProject.funderUrl && (
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl">
                          <span className="text-[var(--text-subtle)] block mb-1">SPONSOR WEBSITE</span>
                          <a
                            href={selectedProject.funderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--ink-dark)] hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* ── Student Researchers & Engineers Section ── */}
                    {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 && (
                      <div className="mb-6 pt-6 border-t border-[var(--border-hairline)]">
                        <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3.5 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Student Researchers & Engineers
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {selectedProject.teamMembers.map((member, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl flex items-center justify-between text-xs font-sans"
                            >
                              <span className="font-semibold text-[var(--text-primary)]">{member}</span>
                              <span className="text-[10px] text-[var(--ink-dark)] bg-white px-2 py-0.5 rounded-full border border-[var(--border-hairline)]">
                                Researcher
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Project Team Members Section ── */}
                    {projectMembers.length > 0 && (
                      <div className="mb-2 pt-6 border-t border-[var(--border-hairline)]">
                        <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3.5 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[var(--ink-dark)]" /> Project Leads & Team
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {projectMembers.map(member => (
                            <div
                              key={member.id}
                              className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-2xl flex items-center gap-3 group/member hover:border-[var(--accent-orange)] transition-all"
                            >
                              <img
                                src={member.image || './pfp/marvi.jpeg'}
                                alt={member.name}
                                className="w-12 h-12 rounded-xl object-cover border border-[var(--border-hairline)] shrink-0 bg-white"
                                onError={e => {
                                  ;(e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" fill="%23E5E1EA"/><text x="50%" y="55%" font-size="14" font-family="sans-serif" fill="%237A7A82" dominant-baseline="middle" text-anchor="middle">AI</text></svg>'
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-xs text-[var(--text-primary)] truncate font-head group-hover/member:text-[var(--accent-orange)] transition-colors">
                                  {member.name}
                                </div>
                                <div className="text-[11px] text-[var(--text-muted)] truncate font-sans">
                                  {member.role || member.category}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Link
                                    to={`/team?member=${member.id}`}
                                    onClick={() => setSelectedProject(null)}
                                    className="text-[10px] font-sans text-[var(--accent-orange)] hover:underline inline-flex items-center gap-0.5 font-semibold"
                                  >
                                    Profile &rarr;
                                  </Link>
                                  {member.linkedin && (
                                    <a
                                      href={member.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-sans text-[var(--text-subtle)] hover:text-[var(--ink-dark)] inline-flex items-center gap-0.5"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] flex items-center justify-end">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-6 py-2.5 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:translate-y-[1px]"
                    >
                      <X className="w-4 h-4" />
                      <span>Close</span>
                    </button>
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
