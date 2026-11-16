import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Mail,
  ChevronDown,
  Layers,
  Award,
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  Building,
  Image as GalleryIcon,
  ArrowUp,
} from 'lucide-react'
import AirLabLogo from './AirLabLogo'
import airLabMark from '../assets/air-lab-mark.png'
import ParticleField from './ParticleField'
import Preloader from './Preloader'
import ScrollIndicator from './ScrollIndicator'
import StudentApplicationModal from './StudentApplicationModal'
import { useVacancySettings } from '../lib/vacancy'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const vacancy = useVacancySettings()
  const isClosed = vacancy.status === 'Closed'

  // Secret 7-tap easter egg on the logo to open Admin Portal
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogoTap = (e: React.MouseEvent) => {
    tapCountRef.current += 1

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
    }

    // Reset tap sequence if idle for more than 2 seconds
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, 2000)

    if (tapCountRef.current >= 7) {
      e.preventDefault()
      tapCountRef.current = 0
      navigate('/admin')
    }
  }


  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      setShowBackToTop(y > 540)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveDropdown(null)
    setMobileMenuOpen(false)
  }, [location.pathname, location.search])

  // Close dropdown on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setMobileMenuOpen(false)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased flex flex-col selection:bg-[var(--accent-orange)] selection:text-white relative">
      <Preloader />
      <ScrollIndicator />
      <ParticleField />
      {/* ── 0. Accessibility Skip Link ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-5 py-2.5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold shadow-lg outline-none"
      >
        Skip to main content
      </a>

      {/* ── 1. Dynamic Horizontally Scrolling Vacancy Ribbon ── */}
      <aside aria-label="Announcement" className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] text-xs font-medium py-2 px-4 sm:px-8 relative z-30 overflow-hidden">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="overflow-hidden whitespace-nowrap select-none">
              <div className="animate-ribbon-scroll">
                {/* Segment 1 */}
                <div className="flex items-center gap-8 pr-8 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 font-semibold text-xs tracking-tight ${isClosed ? 'text-rose-500' : 'text-[var(--accent-orange)]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isClosed ? 'bg-rose-500' : 'bg-[var(--accent-orange)] animate-pulse'}`} />
                    {isClosed && vacancy.ribbonLabel.toLowerCase().includes('open') ? 'Applications Closed:' : vacancy.ribbonLabel}
                  </span>
                  <span className="text-[13px] text-[var(--text-muted)] font-normal">
                    {isClosed ? vacancy.closedMessage : vacancy.ribbonText}
                  </span>
                  <span className="text-[var(--border-hairline)]">•</span>
                  <span className="text-[12.5px] text-[var(--text-muted)] font-normal">
                    Artificial Intelligence Research Lab — Department of CSIT, NED University of Engineering & Technology
                  </span>
                  <span className="text-[var(--border-hairline)]">•</span>
                </div>

                {/* Segment 2 (seamless infinite loop mirror) */}
                <div className="flex items-center gap-8 pr-8 shrink-0" aria-hidden="true">
                  <span className={`inline-flex items-center gap-1.5 font-semibold text-xs tracking-tight ${isClosed ? 'text-rose-500' : 'text-[var(--accent-orange)]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isClosed ? 'bg-rose-500' : 'bg-[var(--accent-orange)] animate-pulse'}`} />
                    {isClosed && vacancy.ribbonLabel.toLowerCase().includes('open') ? 'Applications Closed:' : vacancy.ribbonLabel}
                  </span>
                  <span className="text-[13px] text-[var(--text-muted)] font-normal">
                    {isClosed ? vacancy.closedMessage : vacancy.ribbonText}
                  </span>
                  <span className="text-[var(--border-hairline)]">•</span>
                  <span className="text-[12.5px] text-[var(--text-muted)] font-normal">
                    Artificial Intelligence Research Lab — Department of CSIT, NED University of Engineering & Technology
                  </span>
                  <span className="text-[var(--border-hairline)]">•</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <a
              href="mailto:contact@airlab.neduet.edu.pk"
              className="inline-flex items-center gap-1.5 text-[12px] font-sans text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>contact@airlab.neduet.edu.pk</span>
            </a>
            <span className="text-[var(--border-hairline)]">|</span>
            <a
              href="https://cct.neduet.edu.pk/AIR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-sans text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
            >
              <span>NED University</span>
            </a>
          </div>
        </div>
      </aside>

      {/* ── 2. Slim Sticky Navbar with Ai2-Inspired Themed Mega Dropdowns ── */}
      <header
        ref={navRef}
        className={`sticky top-0 z-40 h-[72px] transition-all duration-200 ${scrolled
          ? 'bg-[var(--bg-surface-glass)] backdrop-blur-md border-b border-[var(--border-hairline)] shadow-sm'
          : 'bg-[var(--bg-page)] border-b border-[var(--border-hairline)]'
          }`}
      >
        <div className="max-w-[1240px] h-full mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo with 7-tap admin easter egg */}
          <Link
            to="/"
            onClick={handleLogoTap}
            className="flex items-center gap-2 group shrink-0 select-none cursor-pointer"
            aria-label="AIR Lab Home"
          >
            <AirLabLogo height={36} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors ${isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavActivePill"
                      className="absolute inset-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs -z-10"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">Home</span>
                </>
              )}
            </NavLink>

            {/* Research Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('research')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {(() => {
                const isSectionActive =
                  location.pathname.includes('/projects') ||
                  location.pathname.includes('/grants') ||
                  location.pathname.includes('/publications') ||
                  location.pathname.includes('/blogs')
                const isOpen = activeDropdown === 'research'
                return (
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : 'research')}
                    className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${isOpen || isSectionActive
                      ? 'text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                      }`}
                    aria-expanded={isOpen}
                  >
                    {isSectionActive && (
                      <motion.span
                        layoutId="desktopNavActivePill"
                        className="absolute inset-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">Research</span>
                    <ChevronDown className={`relative z-10 w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                )
              })()}

              <AnimatePresence>
                {activeDropdown === 'research' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 440, damping: 30 }}
                    className="absolute top-full left-0 mt-2 w-[530px] max-w-[calc(100vw-2rem)] bg-[var(--bg-surface-elevated)]/98 backdrop-blur-xl border border-[var(--border-hairline)] rounded-3xl p-6 shadow-[0_24px_48px_-12px_rgba(16,0,43,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] grid grid-cols-2 gap-6 z-50 before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3"
                  >
                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        EXPLORE PORTFOLIO
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/projects"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Layers className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Projects Catalog</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Applied AI, edge perception, robotics, and healthcare
                          </p>
                        </Link>

                        <Link
                          to="/grants"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Award className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Research Grants</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Sponsored research funding and national initiatives
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        ARTICLES
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/publications"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <BookOpen className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Publications</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Peer-reviewed conference papers, journals, and citations
                          </p>
                        </Link>

                        <Link
                          to="/blogs"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Blogs</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Technical breakdowns, research notes, and lab stories
                          </p>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* People Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('people')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {(() => {
                const isSectionActive =
                  location.pathname.includes('/team') ||
                  location.pathname.includes('/interns') ||
                  location.pathname.includes('/performers')
                const isOpen = activeDropdown === 'people'
                return (
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : 'people')}
                    className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${isOpen || isSectionActive
                      ? 'text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                      }`}
                    aria-expanded={isOpen}
                  >
                    {isSectionActive && (
                      <motion.span
                        layoutId="desktopNavActivePill"
                        className="absolute inset-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">People</span>
                    <ChevronDown className={`relative z-10 w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                )
              })()}

              <AnimatePresence>
                {activeDropdown === 'people' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 440, damping: 30 }}
                    className="absolute top-full left-0 mt-2 w-[560px] max-w-[calc(100vw-2rem)] bg-[var(--bg-surface-elevated)]/98 backdrop-blur-xl border border-[var(--border-hairline)] rounded-3xl p-6 shadow-[0_24px_48px_-12px_rgba(16,0,43,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] grid grid-cols-2 gap-6 z-50 before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3"
                  >
                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        LAB MEMBERS
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/team?tab=faculty"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Users className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Faculty Leads</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Principal investigators, professors, and advisors
                          </p>
                        </Link>

                        <Link
                          to="/team?tab=interns"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <GraduationCap className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Research Interns</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Active student researchers and lab fellows
                          </p>
                        </Link>

                        <Link
                          to="/team?tab=previous"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Users className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Past Interns</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Past fellows and where they are today
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        COMMUNITY & SPOTLIGHT
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/performers"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Award className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Performer of the Month</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Monthly research honors and milestones
                          </p>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About & Community Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('about')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {(() => {
                const isSectionActive =
                  location.pathname.includes('/about') ||
                  location.pathname.includes('/gallery')
                const isOpen = activeDropdown === 'about'
                return (
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : 'about')}
                    className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${isOpen || isSectionActive
                      ? 'text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                      }`}
                    aria-expanded={isOpen}
                  >
                    {isSectionActive && (
                      <motion.span
                        layoutId="desktopNavActivePill"
                        className="absolute inset-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">About</span>
                    <ChevronDown className={`relative z-10 w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                )
              })()}

              <AnimatePresence>
                {activeDropdown === 'about' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 440, damping: 30 }}
                    className="absolute top-full left-0 mt-2 w-[520px] max-w-[calc(100vw-2rem)] bg-[var(--bg-surface-elevated)]/98 backdrop-blur-xl border border-[var(--border-hairline)] rounded-3xl p-6 shadow-[0_24px_48px_-12px_rgba(16,0,43,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] grid grid-cols-2 gap-6 z-50 before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3"
                  >
                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        ABOUT US
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/about"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <Building className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>About AIR Lab</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Mission, foundational pillars, and department leadership
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3 px-2.5">
                        LIFE AT THE LAB
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/gallery"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                            <GalleryIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] group-hover:scale-110 transition-all" />
                            <span>Lab Gallery</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Milestones, hackathons, and technical workshops
                          </p>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Contact Link */}
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors ${isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavActivePill"
                      className="absolute inset-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xs -z-10"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">Contact</span>
                </>
              )}
            </NavLink>
          </nav>

          {/* Right Action CTA: Apply Now */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setApplyModalOpen(true)}
              className="inline-flex items-center justify-center h-9 sm:h-10 px-3.5 sm:px-5 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs sm:text-[13.5px] font-semibold tracking-tight transition-colors duration-150 cursor-pointer shadow-[0_2px_10px_-2px_rgba(123,44,191,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_18px_-3px_rgba(123,44,191,0.55),inset_0_1px_0_rgba(255,255,255,0.3)] whitespace-nowrap"
            >
              <span>Apply Now</span>
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Accordion Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden absolute top-[72px] left-0 right-0 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-hairline)] px-6 py-6 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="space-y-2 mb-6">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  Home
                </Link>

                {/* Research Accordion */}
                <div className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === 'research' ? null : 'research')}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left cursor-pointer"
                  >
                    <span>Research</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'research' ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileAccordion === 'research' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                          <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Projects Catalog
                          </Link>
                          <Link to="/grants" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Research Grants
                          </Link>
                          <Link to="/publications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Publications
                          </Link>
                          <Link to="/blogs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Blogs
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* People Accordion */}
                <div className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === 'people' ? null : 'people')}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left cursor-pointer"
                  >
                    <span>People</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'people' ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileAccordion === 'people' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                          <Link to="/team?tab=faculty" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Faculty Leads
                          </Link>
                          <Link to="/team?tab=interns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Research Interns
                          </Link>
                          <Link to="/team?tab=previous" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Past Interns
                          </Link>
                          <Link to="/performers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Performer of the Month
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* About Accordion */}
                <div className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === 'about' ? null : 'about')}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left cursor-pointer"
                  >
                    <span>About</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'about' ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileAccordion === 'about' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            About AIR Lab
                          </Link>
                          <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            Lab Gallery
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  Contact
                </Link>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href="mailto:contact@airlab.neduet.edu.pk"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-orange)] flex items-center gap-1.5 font-sans"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  <span>contact@airlab.neduet.edu.pk</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setApplyModalOpen(true)
                  }}
                  className="w-full sm:w-auto h-10 px-6 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── 3. Main Outlet ── */}
      <main id="main-content" className="flex-1 relative">
        <Outlet />
      </main>

      {/* ── 4. Clean Compact Footer (Deep Ink Band) ── */}
      <footer className="w-full bg-[var(--ink-dark)] text-[var(--text-on-dark)] pt-14 pb-10 relative font-sans border-t border-[var(--border-hairline)]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pb-10 border-b border-white/10">
            {/* Left: Lab Identity, Address, Contact Info & LinkedIn */}
            <div className="space-y-4">
              <Link to="/" onClick={handleLogoTap} className="inline-block select-none group" aria-label="AIR Lab Home">
                <div className="flex items-center gap-3">
                  <img
                    src={airLabMark}
                    alt="AIR Lab Mark"
                    className="w-10 h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />
                  <div>
                    <div className="text-base font-bold tracking-tight text-white font-head leading-none group-hover:text-white/80 transition-colors">AIR Lab</div>
                    <div className="text-[11px] text-white/60 tracking-wider uppercase font-sans mt-1">NED UNIVERSITY · CSIT</div>
                  </div>
                </div>
              </Link>

              <div className="pt-1 text-[13px] text-white/80 space-y-2 font-sans">
                <div>NED University Main Campus, Karachi 75270</div>
                <div>
                  <a
                    href="mailto:contact@airlab.neduet.edu.pk"
                    className="text-white/90 hover:text-white hover:underline inline-flex items-center gap-2 font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-white/75" />
                    <span>contact@airlab.neduet.edu.pk</span>
                  </a>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow AIR Lab on LinkedIn for latest updates"
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>Follow us on LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Right: NED CSIT & Inquiries */}
            <div>
              <h5 className="text-[12px] font-bold uppercase tracking-wider text-white/50 mb-4 font-sans">
                NED CSIT &amp; Inquiries
              </h5>
              <ul className="space-y-2.5 text-[14px] text-white/75">
                <li>
                  <Link to="/contact" className="text-white hover:text-white/80 transition-colors font-semibold inline-flex items-center gap-1.5">
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://cct.neduet.edu.pk/AIR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Department Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.neduet.edu.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    NED University
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[12px] text-white/55 gap-3 pt-6 font-sans">
            <div>
              &copy; {new Date().getFullYear()} Artificial Intelligence Research Lab &bull; Department of CSIT, NED University.
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:contact@airlab.neduet.edu.pk" className="hover:text-white transition-colors">
                contact@airlab.neduet.edu.pk
              </a>
              <span>&bull;</span>
              <span>Karachi, Pakistan</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back-to-Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top"
            title="Back to top"
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[var(--bg-surface-elevated)]/95 backdrop-blur-md border border-[var(--border-hairline-dark)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] shadow-[0_8px_24px_-4px_rgba(16,0,43,0.18)] flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global Student Application Modal */}
      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  )
}
