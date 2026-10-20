import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ExternalLink, Mail } from 'lucide-react'
import AirLabLogo from './AirLabLogo'
import ParticleField from './ParticleField'
import StudentApplicationModal from './StudentApplicationModal'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileMenuOpen(prev => (prev ? false : prev))
  }, [location.pathname])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Team', path: '/team' },
    { name: 'Projects', path: '/projects' },
    { name: 'Grants', path: '/grants' },
    { name: 'Publications', path: '/publications' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-backdrop)] py-0 lg:py-6 px-0 lg:px-8 selection:bg-[var(--accent-orange)] selection:text-white font-sans antialiased">
      <div className="max-w-[1440px] mx-auto min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] border-x border-[var(--border-hairline)] shadow-2xl relative">
        <ParticleField />

        {/* ── 1. Vacancy Ribbon ── */}
        <div className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] text-xs font-medium py-2 px-4 sm:px-6 relative z-30">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-[2px] bg-[var(--text-primary)] text-white text-[11px] font-medium tracking-tight">
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
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
              >
                <Mail className="w-3 h-3 text-[var(--accent-orange)]" />
                <span>contact@airlab.neduet.edu.pk</span>
              </a>
              <span className="text-[var(--border-hairline)]">|</span>
              <a
                href="https://cct.neduet.edu.pk/AIR"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
              >
                NED Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* ── 2. Sticky Navbar ── */}
        <header
          className={`sticky top-0 z-40 h-[64px] transition-all duration-200 ${
            scrolled
              ? 'bg-[var(--bg-surface-glass)] backdrop-blur-[16px] border-b border-[var(--border-hairline)] shadow-[0_1px_3px_rgba(17,17,17,0.03)]'
              : 'bg-[var(--bg-surface-glass)] backdrop-blur-[16px] border-b border-transparent'
          }`}
        >
          <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between gap-4">
            <Link to="/" onClick={handleLogoTap} className="flex items-center gap-2 group shrink-0 select-none">
              <AirLabLogo height={34} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `relative text-[14px] font-medium transition-colors py-1 ${
                      isActive
                        ? 'text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.name}</span>
                      {isActive && (
                        <motion.span
                          layoutId="navDot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[var(--accent-orange)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4 shrink-0">
              <a
                href="mailto:contact@airlab.neduet.edu.pk"
                className="hidden md:inline-flex text-[13.5px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>Contact</span>
              </a>

              <button
                onClick={() => setApplyModalOpen(true)}
                className="group inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-[13px] font-medium tracking-tight transition-all duration-150 cursor-pointer shadow-xs active:translate-y-[1px]"
              >
                <span>Apply Now</span>
                <span className="text-[12px] leading-none transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5">↳</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-purple)] transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Sheet */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden absolute top-[64px] left-0 right-0 bg-[rgba(250,250,251,0.96)] backdrop-blur-[24px] border-b border-[var(--border-hairline)] px-6 py-6 shadow-xl"
              >
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {navLinks.map(link => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2.5 rounded-[2px] text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[var(--accent-orange)] text-white'
                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </div>

                <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <a
                    href="mailto:contact@airlab.neduet.edu.pk"
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-orange)] flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    <span>contact@airlab.neduet.edu.pk</span>
                  </a>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setApplyModalOpen(true)
                    }}
                    className="h-8 px-4 rounded-[2px] bg-[var(--accent-orange)] text-white text-xs font-medium"
                  >
                    Apply Now ↳
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 relative">
          <Outlet />
        </main>

        {/* ── Footer ── */}
        <footer className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] pt-16 pb-12 relative font-sans">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 sm:pb-16 border-b border-[var(--border-hairline)]">
              {/* Column 1 */}
              <div className="space-y-3.5">
                <Link to="/" className="inline-block py-0.5">
                  <AirLabLogo height={34} />
                </Link>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-sm">
                  The Artificial Intelligence Research Laboratory, Department of Computer Science & Information Technology (CSIT), NED University of Engineering & Technology. Advancing foundation models, edge perception, and robotics.
                </p>
                <div className="pt-1 text-[12px] text-[var(--text-subtle)] space-y-1.5 font-mono">
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

              {/* Column 2 */}
              <div>
                <h5 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-4 font-head">
                  Research
                </h5>
                <ul className="space-y-2.5 text-[13.5px] text-[var(--text-muted)]">
                  <li><Link to="/projects" className="hover:text-[var(--accent-orange)] transition-colors">Projects Catalog</Link></li>
                  <li><Link to="/grants" className="hover:text-[var(--accent-orange)] transition-colors">Active Grants</Link></li>
                  <li><Link to="/publications" className="hover:text-[var(--accent-orange)] transition-colors">Publications</Link></li>
                  <li><Link to="/gallery" className="hover:text-[var(--accent-orange)] transition-colors">Lab Gallery</Link></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h5 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-4 font-head">
                  People
                </h5>
                <ul className="space-y-2.5 text-[13.5px] text-[var(--text-muted)]">
                  <li><Link to="/team" className="hover:text-[var(--accent-orange)] transition-colors">Faculty & Scholars</Link></li>
                  <li><Link to="/performers" className="hover:text-[var(--accent-orange)] transition-colors">Performers of the Month</Link></li>
                  <li><Link to="/interns" className="hover:text-[var(--accent-orange)] transition-colors">Research Interns</Link></li>
                  <li><Link to="/contact" className="hover:text-[var(--accent-orange)] transition-colors">Contact Coordination</Link></li>
                </ul>
              </div>

              {/* Column 4 */}
              <div>
                <h5 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-4 font-head">
                  NED CSIT & Inquiries
                </h5>
                <ul className="space-y-2.5 text-[13.5px] text-[var(--text-muted)]">
                  <li>
                    <a href="https://cct.neduet.edu.pk/AIR" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-orange)] transition-colors inline-flex items-center gap-1">
                      Official Portal <ExternalLink className="w-3 h-3 text-[var(--text-subtle)]" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.neduet.edu.pk" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-orange)] transition-colors inline-flex items-center gap-1">
                      NED University <ExternalLink className="w-3 h-3 text-[var(--text-subtle)]" />
                    </a>
                  </li>
                  <li>
                    <button onClick={() => setApplyModalOpen(true)} className="hover:text-[var(--accent-orange)] transition-colors cursor-pointer text-left">
                      Internship Portal
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

            <div className="pt-10 pb-4 text-center select-none overflow-hidden">
              <span className="block text-[clamp(48px,12vw,120px)] font-bold tracking-tight text-[rgba(17,17,17,0.035)] font-head leading-none whitespace-nowrap">
                AIR LAB NEDUET
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[12px] text-[var(--text-subtle)] gap-3 pt-4 border-t border-[var(--border-hairline)] font-mono">
              <div>
                &copy; {new Date().getFullYear()} Artificial Intelligence Research Lab &bull; Department of CSIT, NED University.
              </div>
              <div className="flex items-center gap-3">
                <a href="mailto:contact@airlab.neduet.edu.pk" className="hover:text-[var(--accent-orange)]">
                  contact@airlab.neduet.edu.pk
                </a>
                <span>&bull;</span>
                <span>Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </footer>

        <StudentApplicationModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
        />
      </div>
    </div>
  )
}
