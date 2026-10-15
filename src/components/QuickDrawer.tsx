import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  X,
  Layers,
  Users,
  Search,
  Mail,
  ArrowUpRight,
} from 'lucide-react'
import projectsData from '../data/projects.json'
import teamData from '../data/team.json'

interface QuickDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'projects' | 'members'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function QuickDrawer({
  isOpen,
  onClose,
  initialTab = 'projects',
  onMouseEnter,
  onMouseLeave,
}: QuickDrawerProps) {
  const [tab, setTab] = useState<'projects' | 'members'>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberFilter, setMemberFilter] = useState<'All' | 'Faculty' | 'Research Interns'>('All')

  // Sync tab if initialTab changes when opening
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      setSearchQuery('')
    }
  }, [isOpen, initialTab])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Filtered projects
  const filteredProjects = projectsData.filter(p => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.funding.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })

  // Filtered members
  const filteredMembers = teamData.filter(m => {
    if (memberFilter !== 'All' && m.category !== memberFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.researchFocus && m.researchFocus.toLowerCase().includes(q))
    )
  })

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container from Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-xl sm:max-w-2xl bg-[var(--bg-surface)] border-l border-[var(--border-hairline)] shadow-2xl flex flex-col text-left text-[var(--text-primary)]"
            >
              {/* ── Drawer Header ── */}
              <div className="p-5 sm:p-6 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] shrink-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                    <div>
                      <h3 className="font-head text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                        AIR Lab Explorer
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Research Projects &amp; Scholars Directory
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={tab === 'projects' ? '/projects' : '/team'}
                      onClick={onClose}
                      className="h-8.5 px-3 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                      title={tab === 'projects' ? 'Go to full Projects page' : 'Go to full Members page'}
                    >
                      <span className="hidden sm:inline">Go to {tab === 'projects' ? 'Projects' : 'Team'}</span>
                      <span className="sm:hidden">Full Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={onClose}
                      className="w-8.5 h-8.5 rounded-[2px] border border-[var(--border-hairline)] hover:border-[var(--text-primary)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                      aria-label="Close drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Big Tab Selectors */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-page)] rounded-[2px] border border-[var(--border-hairline)]">
                  <button
                    onClick={() => setTab('projects')}
                    className={`py-2.5 px-3 rounded-[2px] text-xs sm:text-sm font-head font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tab === 'projects'
                        ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Projects ({projectsData.length})</span>
                  </button>

                  <button
                    onClick={() => setTab('members')}
                    className={`py-2.5 px-3 rounded-[2px] text-xs sm:text-sm font-head font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tab === 'members'
                        ? 'bg-[var(--text-primary)] text-white shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Lab Members ({teamData.length})</span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mt-3">
                  <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      tab === 'projects'
                        ? 'Search projects by title, supervisor, or field...'
                        : 'Search members by name, role, or research domain...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:border-[var(--accent-orange)] focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Sub-filter if members tab */}
                {tab === 'members' && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {(['All', 'Faculty', 'Research Interns'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setMemberFilter(f)}
                        className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-[2px] border transition-colors cursor-pointer ${
                          memberFilter === f
                            ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Drawer Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[var(--bg-page)]/40">
                {tab === 'projects' ? (
                  /* Projects View */
                  <div className="space-y-3.5">
                    {filteredProjects.length === 0 ? (
                      <div className="py-12 text-center text-xs font-mono text-[var(--text-subtle)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[2px]">
                        No projects match "{searchQuery}"
                      </div>
                    ) : (
                      filteredProjects.map(proj => (
                        <Link
                          key={proj.id}
                          to="/projects"
                          onClick={onClose}
                          className="block p-4 sm:p-5 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)] transition-all group shadow-2xs cursor-pointer text-left"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-wider uppercase bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20">
                              {proj.category}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--text-subtle)] font-medium">
                              {proj.status}
                            </span>
                          </div>

                          <h4 className="font-head font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug mb-1.5 flex items-center justify-between">
                            <span>{proj.title}</span>
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[var(--accent-orange)] transition-opacity shrink-0 ml-1.5" />
                          </h4>

                          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">
                            {proj.description}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[var(--border-hairline)] text-[11px] font-mono text-[var(--text-subtle)]">
                            <span>Status: <strong className="text-[var(--text-primary)]">{proj.status}</strong></span>
                            <span className="text-[var(--accent-orange)] font-medium group-hover:underline flex items-center gap-1">
                              <span>View in Projects</span>
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                ) : (
                  /* Members View */
                  <div className="space-y-3.5">
                    {filteredMembers.length === 0 ? (
                      <div className="py-12 text-center text-xs font-mono text-[var(--text-subtle)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[2px]">
                        No members match "{searchQuery}"
                      </div>
                    ) : (
                      filteredMembers.map(member => (
                        <Link
                          key={member.id}
                          to="/team"
                          onClick={onClose}
                          className="block p-4 sm:p-5 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--text-primary)] transition-all shadow-2xs flex items-start gap-4 group cursor-pointer text-left"
                        >
                          {/* Avatar / Photo */}
                          <div className="w-12 h-12 rounded-[2px] overflow-hidden bg-[var(--bg-page)] border border-[var(--border-hairline)] shrink-0 flex items-center justify-center font-head font-bold text-base text-[var(--text-primary)]">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  // Fallback to initials if image path fails
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <span>{member.name.charAt(0)}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-head font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-tight flex items-center gap-1.5">
                                <span>{member.name}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h4>
                              {member.isLead && (
                                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[var(--accent-orange)] text-white rounded-[2px]">
                                  LEAD
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[var(--accent-purple)] font-medium font-mono mb-1">
                              {member.role}
                            </p>

                            {member.researchFocus && (
                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mb-2 font-normal">
                                Focus: {member.researchFocus}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-hairline)]/60 text-[11px] font-mono">
                              {member.email ? (
                                <span className="inline-flex items-center gap-1 text-[var(--text-subtle)]">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </span>
                              ) : <span />}
                              <span className="text-[var(--text-primary)] font-semibold group-hover:underline flex items-center gap-1">
                                <span>Directory profile</span>
                                <span>&rarr;</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* ── Drawer Footer Link ── */}
              <div className="p-4 sm:p-5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] shrink-0">
                {tab === 'projects' ? (
                  <Link
                    to="/projects"
                    onClick={onClose}
                    className="w-full h-12 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>Open Full Projects Page</span>
                    <span className="font-mono text-base">↳</span>
                  </Link>
                ) : (
                  <Link
                    to="/team"
                    onClick={onClose}
                    className="w-full h-12 rounded-[2px] bg-[var(--text-primary)] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>Open Full Members Directory</span>
                    <span className="font-mono text-base">↳</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
