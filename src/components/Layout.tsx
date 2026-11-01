import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ExternalLink,
  Mail,
  ChevronDown,
  Layers,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Building,
  Image as GalleryIcon,
} from 'lucide-react'
import AirLabLogo from './AirLabLogo'
import StudentApplicationModal from './StudentApplicationModal'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Secret 7-tap easter egg to open Admin Login
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<number | null>(null)

  const handleLogoTap = (e: React.MouseEvent) => {
    tapCountRef.current += 1

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
    }

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
      setScrolled(window.scrollY > 10)
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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased flex flex-col selection:bg-[var(--accent-orange)] selection:text-white">
      {/* ── 0. Accessibility Skip Link ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-5 py-2.5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold shadow-lg outline-none"
      >
        Skip to main content
      </a>

      {/* ── 1. Restyled Top Vacancy Ribbon ── */}
      <aside aria-label="Announcement" className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] text-xs font-medium py-2.5 px-4 sm:px-8 relative z-30">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 h-6 px-3 rounded-full bg-[var(--ink-dark)] text-white text-[11px] font-semibold tracking-tight shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse shrink-0" />
              Applications Open
            </span>
            <span className="text-[13px] text-[var(--text-muted)] font-normal">
              Student Research Internship & Fellowship Vacancies Open for Fall 2026 — NEDUET CSIT
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <a
              href="mailto:contact@airlab.neduet.edu.pk"
              className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>contact@airlab.neduet.edu.pk</span>
            </a>
            <span className="text-[var(--border-hairline)]">|</span>
            <a
              href="https://cct.neduet.edu.pk/AIR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
            >
              <span>NED University</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* ── 2. Slim Sticky Navbar with Ai2-Inspired Themed Mega Dropdowns ── */}
      <header
        ref={navRef}
        className={`sticky top-0 z-40 h-[72px] transition-all duration-200 ${scrolled
            ? 'bg-[var(--bg-surface-glass)] backdrop-blur-md border-b border-[var(--border-hairline)] shadow-[0_4px_20px_rgba(10,50,53,0.04)]'
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
          <nav className="hidden lg:flex items-center gap-2">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-[14px] font-medium transition-all ${isActive
                  ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                }`
              }
            >
              Home
            </NavLink>

            {/* Research Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('research')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'research' ? null : 'research')}
                className={`px-3.5 py-2 rounded-full text-[14px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${activeDropdown === 'research' || location.pathname.includes('/projects') || location.pathname.includes('/grants') || location.pathname.includes('/publications')
                    ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                  }`}
                aria-expanded={activeDropdown === 'research'}
              >
                <span>Research</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'research' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'research' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1.5 w-[520px] bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6 z-50"
                  >
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        EXPLORE & PORTFOLIO
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/projects"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Layers className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Projects Catalog</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Applied AI, edge perception, robotics, and healthcare
                          </p>
                        </Link>

                        <Link
                          to="/grants"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Award className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Active Grants</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Sponsored research funding and national initiatives
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        SCHOLARSHIP & OUTPUT
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/publications"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <BookOpen className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Publications</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Peer-reviewed conference papers, journals, and citations
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
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'people' ? null : 'people')}
                className={`px-3.5 py-2 rounded-full text-[14px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${activeDropdown === 'people' || location.pathname.includes('/team') || location.pathname.includes('/interns') || location.pathname.includes('/performers')
                    ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                  }`}
                aria-expanded={activeDropdown === 'people'}
              >
                <span>People</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'people' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'people' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1.5 w-[560px] bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6 z-50"
                  >
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        LAB MEMBERS
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/team?tab=faculty"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Users className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Faculty Leads</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Principal investigators, professors, and advisors
                          </p>
                        </Link>

                        <Link
                          to="/team?tab=all"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Sparkles className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Overview Cluster</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Interactive visual team network overview
                          </p>
                        </Link>

                        <Link
                          to="/team?tab=interns"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <GraduationCap className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Research Interns</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Active student researchers and lab fellows
                          </p>
                        </Link>

                        <Link
                          to="/team?tab=previous"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Users className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Alumni Interns</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Past fellows and where they are today
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        COMMUNITY & SPOTLIGHT
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/interns"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <GraduationCap className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Fellowship Program</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Internship trajectories and application tracks
                          </p>
                        </Link>

                        <Link
                          to="/performers"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Award className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
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
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                className={`px-3.5 py-2 rounded-full text-[14px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${activeDropdown === 'about' || location.pathname.includes('/about') || location.pathname.includes('/collaborations') || location.pathname.includes('/gallery')
                    ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                  }`}
                aria-expanded={activeDropdown === 'about'}
              >
                <span>About</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'about' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1.5 w-[520px] bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6 z-50"
                  >
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        INSTITUTION
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/about"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Building className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>About AIR Lab</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Mission, foundational pillars, and department leadership
                          </p>
                        </Link>

                        <Link
                          to="/collaborations"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <Building className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
                            <span>Collaborations</span>
                          </div>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">
                            Enterprise sponsors and academic research partners
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-orange)] font-bold mb-3">
                        LIFE AT THE LAB
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/gallery"
                          className="block p-2.5 rounded-2xl hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-center gap-2 font-medium text-[13.5px] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]">
                            <GalleryIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
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
                `px-3.5 py-2 rounded-full text-[14px] font-medium transition-all ${isActive
                  ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right Action CTA: Pill Apply Now button */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="hidden sm:inline-flex text-[13.5px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors items-center gap-1.5 px-3 py-1.5 rounded-full"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>Inquiries</span>
            </Link>

            <button
              onClick={() => setApplyModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-[13.5px] font-medium tracking-tight transition-all duration-150 cursor-pointer shadow-sm active:translate-y-[1px]"
            >
              <span>Apply Now</span>
              <span className="text-[12px] leading-none transition-transform duration-150 group-hover:translate-x-0.5">
                ↳
              </span>
            </button>

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
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left"
                  >
                    <span>Research</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'research' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordion === 'research' && (
                    <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                      <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Projects Catalog
                      </Link>
                      <Link to="/grants" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Active Grants
                      </Link>
                      <Link to="/publications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Publications
                      </Link>
                    </div>
                  )}
                </div>

                {/* People Accordion */}
                <div className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === 'people' ? null : 'people')}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left"
                  >
                    <span>People</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'people' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordion === 'people' && (
                    <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                      <Link to="/team?tab=all" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Overview Cluster
                      </Link>
                      <Link to="/team?tab=faculty" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Faculty Leads
                      </Link>
                      <Link to="/team?tab=interns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Research Interns
                      </Link>
                      <Link to="/team?tab=previous" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Alumni Interns
                      </Link>
                      <Link to="/interns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Fellowship Program
                      </Link>
                      <Link to="/performers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Performer of the Month
                      </Link>
                    </div>
                  )}
                </div>

                {/* About Accordion */}
                <div className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === 'about' ? null : 'about')}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] text-left"
                  >
                    <span>About</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordion === 'about' && (
                    <div className="p-3 bg-[var(--bg-surface-elevated)] space-y-1">
                      <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        About AIR Lab
                      </Link>
                      <Link to="/collaborations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Collaborations
                      </Link>
                      <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        Lab Gallery
                      </Link>
                    </div>
                  )}
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
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-orange)] flex items-center gap-1.5 font-mono"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  <span>contact@airlab.neduet.edu.pk</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setApplyModalOpen(true)
                  }}
                  className="w-full sm:w-auto h-10 px-6 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold"
                >
                  Apply Now ↳
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

      {/* ── 4. Structured Multi-Column Ai2-Inspired Footer (Deep Ink Band) ── */}
      <footer className="w-full bg-[var(--ink-dark)] text-[var(--text-on-dark)] pt-20 pb-14 relative font-sans border-t border-[var(--border-hairline)]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-16 border-b border-white/10">
            {/* Column 1: Lab Charter & Location */}
            <div className="space-y-4">
              <Link to="/" onClick={handleLogoTap} className="inline-block" aria-label="AIR Lab Home">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold text-lg font-head">
                    AI
                  </div>
                  <div>
                    <div className="text-base font-bold tracking-tight text-white font-head leading-none">AIR Lab</div>
                    <div className="text-[11px] text-white/60 tracking-wider uppercase font-mono mt-1">NED UNIVERSITY · CSIT</div>
                  </div>
                </div>
              </Link>
              <p className="text-[13.5px] text-[var(--text-on-dark-muted)] leading-relaxed max-w-sm">
                The Artificial Intelligence Research Laboratory, Department of Computer Science & Information Technology (CSIT), NED University of Engineering & Technology. Advancing foundation models, edge perception, and robotics.
              </p>
              <div className="pt-2 text-[12px] text-white/60 space-y-1.5 font-mono">
                <div>NED University Main Campus, Karachi 75270</div>
                <div>
                  <a
                    href="mailto:contact@airlab.neduet.edu.pk"
                    className="text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1.5 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>contact@airlab.neduet.edu.pk</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Research */}
            <div>
              <h5 className="text-[12px] font-bold uppercase tracking-wider text-white/50 mb-4 font-mono">
                Research
              </h5>
              <ul className="space-y-2.5 text-[14px] text-[var(--text-on-dark-muted)]">
                <li><Link to="/about" className="hover:text-white transition-colors">About AIR Lab</Link></li>
                <li><Link to="/projects" className="hover:text-white transition-colors">Projects Catalog</Link></li>
                <li><Link to="/grants" className="hover:text-white transition-colors">Active Grants</Link></li>
                <li><Link to="/publications" className="hover:text-white transition-colors">Publications</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Lab Gallery</Link></li>
              </ul>
            </div>

            {/* Column 3: People & Partners */}
            <div>
              <h5 className="text-[12px] font-bold uppercase tracking-wider text-white/50 mb-4 font-mono">
                People & Partners
              </h5>
              <ul className="space-y-2.5 text-[14px] text-[var(--text-on-dark-muted)]">
                <li><Link to="/team" className="hover:text-white transition-colors">Faculty & Scholars</Link></li>
                <li><Link to="/collaborations" className="hover:text-white transition-colors">Collaborations & Industry</Link></li>
                <li><Link to="/performers" className="hover:text-white transition-colors">Performers of the Month</Link></li>
                <li><Link to="/interns" className="hover:text-white transition-colors">Research Interns</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Coordination</Link></li>
              </ul>
            </div>

            {/* Column 4: NED CSIT & Inquiries */}
            <div>
              <h5 className="text-[12px] font-bold uppercase tracking-wider text-white/50 mb-4 font-mono">
                NED CSIT & Inquiries
              </h5>
              <ul className="space-y-2.5 text-[14px] text-[var(--text-on-dark-muted)]">
                <li>
                  <a
                    href="https://cct.neduet.edu.pk/AIR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Department Website <ExternalLink className="w-3 h-3 text-white/40" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.neduet.edu.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    NED University <ExternalLink className="w-3 h-3 text-white/40" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="hover:text-[var(--accent-orange)] transition-colors cursor-pointer text-left text-white/90"
                  >
                    Apply for Internship
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:contact@airlab.neduet.edu.pk"
                    className="text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <Mail className="w-3 h-3" />
                    <span>contact@airlab.neduet.edu.pk</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Subdued Brand Signature */}
          <div className="pt-10 pb-4 text-center select-none overflow-hidden">
            <span className="block text-[clamp(44px,11vw,110px)] font-bold tracking-tight text-white/[0.04] font-head leading-none whitespace-nowrap">
              AIR LAB NEDUET
            </span>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[12px] text-white/50 gap-3 pt-6 border-t border-white/10 font-mono">
            <div>
              &copy; {new Date().getFullYear()} Artificial Intelligence Research Lab &bull; Department of CSIT, NED University.
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:contact@airlab.neduet.edu.pk" className="hover:text-[var(--accent-orange)] transition-colors">
                contact@airlab.neduet.edu.pk
              </a>
              <span>&bull;</span>
              <span>Karachi, Pakistan</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Student Application Modal */}
      <StudentApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  )
}
