import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ExternalLink, GraduationCap, Users, Calendar, Tag, Search, Sparkles } from 'lucide-react'
import { getTeamMembers, getPreviousInterns } from '../lib/data'
import { TeamMemberEntity } from '../entities/TeamMemberEntity'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'
import StudentApplicationModal from '../components/StudentApplicationModal'
import AppleWatchCluster from '../components/AppleWatchCluster'

const Linkedin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

type TabType = 'all' | 'faculty' | 'interns' | 'previous'

export default function Team() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType
    const memberParam = searchParams.get('member')
    if (tabParam && ['all', 'faculty', 'interns', 'previous'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
    if (memberParam) {
      setHighlightedMemberId(memberParam)
      setTimeout(() => {
        const el = document.getElementById(`member-${memberParam}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
  }, [searchParams])

  const allMembersRaw = useMemo(() => getTeamMembers(), [])
  const sortedPreviousInterns = useMemo(() => getPreviousInterns(), [])

  const allMembers = useMemo(() => {
    const list = TeamMemberEntity.fromArray(allMembersRaw)
    return TeamMemberEntity.sortByRecent(list)
  }, [allMembersRaw])

  const facultyMembers = useMemo(() => {
    return allMembers.filter(m => m.isFacultyLead() || m.category === 'Faculty')
  }, [allMembers])

  const internMembers = useMemo(() => {
    return allMembers.filter(m => m.category === 'Research Interns')
  }, [allMembers])

  // Extract all unique research area tags across active members
  const allTags = useMemo(() => {
    const set = new Set<string>()
    allMembersRaw.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => set.add(t))
      }
    })
    return ['All', ...Array.from(set).sort()]
  }, [allMembersRaw])

  const filteredInterns = useMemo(() => {
    return internMembers.filter(intern => {
      const raw = allMembersRaw.find(m => m.id === intern.id)
      const matchesTag =
        selectedTag === 'All' ||
        (raw?.tags && Array.isArray(raw.tags) && raw.tags.includes(selectedTag))
      const matchesSearch =
        searchQuery === '' ||
        intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (intern.researchFocus && intern.researchFocus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (raw?.tags && raw.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      return matchesTag && matchesSearch
    })
  }, [internMembers, allMembersRaw, selectedTag, searchQuery])

  useEffect(() => {
    if (highlightedMemberId) {
      const timer = setTimeout(() => setHighlightedMemberId(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [highlightedMemberId])


  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'all', label: 'Overview', count: allMembers.length },
    { id: 'faculty', label: 'Faculty', count: facultyMembers.length },
    { id: 'interns', label: 'Research Interns', count: internMembers.length },
    { id: 'previous', label: 'Alumni Interns', count: sortedPreviousInterns.length },
  ]

  const handleOverviewClick = (member: TeamMemberEntity) => {
    const targetTab = member.getCategoryTab()
    setActiveTab(targetTab === 'faculty' ? 'faculty' : 'interns')
    setHighlightedMemberId(member.id)
    setTimeout(() => {
      const el = document.getElementById(`member-${member.id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
  }


  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-12 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<Users className="w-3.5 h-3.5 text-white" />}>
              RESEARCH FACULTY & SCHOLARS
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-3 tracking-tight">
            Our Research Team
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Faculty leads, research interns, and scholars driving foundational regional AI, computer vision, and autonomous robotics at NED University.
          </p>
        </SectionReveal>
      </div>

      {/* Tabs Control */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div className="inline-flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[2px] shadow-xs">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setHighlightedMemberId(null)
                }}
                className={`relative px-3.5 py-1.5 rounded-[2px] text-[13px] font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search bar inside interns tab */}
        {activeTab === 'interns' && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-subtle)]" />
            <input
              type="text"
              placeholder="Filter by name or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-8.5 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] transition-all"
            />
          </div>
        )}
      </div>

      {/* Tag Filter Pills (shown in interns tab) */}
      {activeTab === 'interns' && (
        <div className="mb-8 flex flex-wrap items-center gap-1.5 text-left">
          <span className="text-xs font-mono text-[var(--text-subtle)] mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[var(--accent-purple)]" /> Filter Tag:
          </span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-mono transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[var(--accent-purple)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        {/* TAB 1: ALL MEMBERS (CLUSTER) */}
        {activeTab === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <AppleWatchCluster
              members={allMembers}
              onSelectMember={handleOverviewClick}
            />
          </motion.div>
        )}

        {/* TAB 2: FACULTY */}
        {activeTab === 'faculty' && (
          <motion.div
            key="faculty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {facultyMembers.map(f => {
                const raw = allMembersRaw.find(m => m.id === f.id)
                const isHighlighted = highlightedMemberId === f.id
                return (
                  <div
                    id={`member-${f.id}`}
                    key={f.id}
                    className={`craftly-card p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group transition-all duration-200 bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-purple)] hover:shadow-xl ${
                      isHighlighted ? 'ring-2 ring-[var(--accent-orange)] shadow-xl' : ''
                    }`}
                  >
                    <div
                      onClick={() => {
                        if (f.hasLinkedIn()) window.open(f.getLinkedInUrl()!, '_blank')
                        else if (f.cvUrl) window.open(f.cvUrl, '_blank')
                        else if (f.hasEmail()) window.location.href = f.getEmailFallback()!
                      }}
                      title="Click to view profile / CV"
                      className="w-36 h-36 sm:w-44 sm:h-44 rounded-[4px] overflow-hidden border border-[var(--border-hairline)] shrink-0 shadow-sm bg-[var(--bg-page)] cursor-pointer group-hover:scale-102 transition-transform"
                    >
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-4 relative z-10 text-left">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-[2px] text-xs font-semibold bg-[var(--accent-purple)] text-white flex items-center gap-1.5 shadow-xs">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {f.role}
                          </span>
                          <span className="px-2.5 py-1 rounded-[2px] text-xs font-mono font-medium bg-[var(--bg-page)] text-[var(--accent-orange)] border border-[var(--border-hairline)] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Tenure: {raw?.tenure || '2020 — Present'}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-normal font-head text-[var(--text-primary)]">
                          {f.name}
                        </h2>
                        <p className="text-sm font-medium text-[var(--text-muted)] mt-1 font-mono">
                          {f.designation} · {f.department}
                        </p>

                        {/* Research Tags */}
                        {raw?.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {raw.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-[2px] text-[11px] font-mono bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-3 text-xs font-mono">
                        {f.hasLinkedIn() && (
                          <a
                            href={f.getLinkedInUrl()!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-4 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium inline-flex items-center gap-2 shadow-xs transition-colors"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>LinkedIn ↳</span>
                          </a>
                        )}
                        {f.hasEmail() && (
                          <a
                            href={`mailto:${f.email}`}
                            className="h-9 px-4 rounded-[2px] bg-[var(--bg-page)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] text-xs font-medium inline-flex items-center gap-2 border border-[var(--border-hairline)] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                            <span>{f.email}</span>
                          </a>
                        )}
                        {f.cvUrl && (
                          <a
                            href={f.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-9 px-4 rounded-[2px] bg-[var(--text-primary)] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Official CV</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: CURRENT RESEARCH INTERNS */}
        {activeTab === 'interns' && (
          <motion.div
            key="interns"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              {filteredInterns.map(intern => {
                const raw = allMembersRaw.find(m => m.id === intern.id)
                const isHighlighted = highlightedMemberId === intern.id
                const primaryUrl = intern.getPrimaryActionUrl()

                return (
                  <div
                    id={`member-${intern.id}`}
                    key={intern.id}
                    className={`craftly-card p-6 rounded-[4px] flex flex-col justify-between group hover:border-[var(--accent-purple)] hover:shadow-xl transition-all duration-200 bg-[var(--bg-surface)] border border-[var(--border-hairline)] ${
                      isHighlighted ? 'ring-2 ring-[var(--accent-orange)] shadow-xl' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <a
                          href={primaryUrl}
                          target={intern.hasLinkedIn() ? '_blank' : undefined}
                          rel={intern.hasLinkedIn() ? 'noopener noreferrer' : undefined}
                          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[4px] overflow-hidden shrink-0 bg-[var(--bg-page)] border border-[var(--border-hairline)] group-hover:border-[var(--accent-purple)] shadow-xs transition-all"
                        >
                          <img
                            src={intern.image}
                            alt={intern.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </a>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-[var(--accent-purple-light)] text-[var(--accent-purple)]">
                              {intern.role}
                            </span>
                            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono text-[var(--text-subtle)] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {raw?.tenure || intern.term}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-medium font-head text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
                            {intern.name}
                          </h3>

                          <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                            {intern.department}
                          </div>

                          {intern.researchFocus && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--bg-page)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20">
                                <Sparkles className="w-3 h-3 text-[var(--accent-purple)]" />
                                {intern.researchFocus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags List */}
                      {raw?.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {raw.tags.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTag(t)}
                              className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:border-[var(--accent-purple)] cursor-pointer"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact Links */}
                    <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      {intern.hasLinkedIn() ? (
                        <a
                          href={intern.getLinkedInUrl()!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7.5 px-3 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white font-medium flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>LinkedIn ↳</span>
                        </a>
                      ) : (
                        <span className="text-[var(--text-subtle)] text-xs italic">No LinkedIn</span>
                      )}

                      {intern.hasEmail() && (
                        <a
                          href={`mailto:${intern.email}`}
                          className="h-7.5 px-2.5 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors truncate max-w-[200px]"
                        >
                          <Mail className="w-3 h-3 text-[var(--accent-orange)]" />
                          <span className="truncate">{intern.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: PREVIOUS INTERNS & ALUMNI */}
        {activeTab === 'previous' && (
          <motion.div
            key="previous"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 text-left"
          >
            <div className="craftly-card overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px]">
              <div className="p-6 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium font-head text-[var(--text-primary)]">
                    Previous Research Interns & Alumni
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5 font-normal">
                    Scholars who completed applied AI and machine learning research tenures at AIR Lab.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-[2px] text-xs font-mono font-medium bg-[var(--accent-purple-light)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20 shrink-0">
                  {sortedPreviousInterns.length} Alumni Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[var(--border-hairline)] font-mono text-[11px] uppercase tracking-wider text-[var(--text-subtle)] bg-[var(--bg-page)]">
                      <th className="py-3.5 px-6 font-medium">Name</th>
                      <th className="py-3.5 px-6 font-medium">Tenure & Department</th>
                      <th className="py-3.5 px-6 font-medium">Email</th>
                      <th className="py-3.5 px-6 text-right font-medium">LinkedIn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {sortedPreviousInterns.map((p: any) => (
                      <tr
                        key={p.id}
                        id={`member-${p.id}`}
                        className={`hover:bg-[var(--bg-page)] transition-colors ${
                          highlightedMemberId === p.id ? 'bg-[var(--accent-orange)]/15 ring-2 ring-[var(--accent-orange)]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-6 font-medium text-[var(--text-primary)]">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-6 text-[var(--text-muted)] font-mono text-xs">
                          {p.tenure || 'Former Research Intern'} • {p.department}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs text-[var(--text-muted)]">
                          <a href={`mailto:${p.email}`} className="text-[var(--accent-orange)] hover:underline flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[var(--accent-orange)]" />
                            {p.email}
                          </a>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <a
                            href={p.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[var(--bg-page)] text-[var(--accent-purple)] hover:bg-[var(--accent-purple)] hover:text-white transition-all text-xs font-mono border border-[var(--border-hairline)]"
                          >
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn ↳</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  )
}
