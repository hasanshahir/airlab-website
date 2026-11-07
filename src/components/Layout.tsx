import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import StudentApplicationModal from './StudentApplicationModal';
import QuickDrawer from './QuickDrawer';

export interface LayoutOutletContext {
  openApplicationModal: () => void;
  openDrawer: () => void;
}

const MENU_ITEMS = [
  {
    num: '01',
    word: 'WORK',
    line: 'See what we mean — Projects, Clinical AI & Deployed Benchmarks.',
    to: '/projects',
    match: ['/projects', '/grants'],
  },
  {
    num: '02',
    word: 'SERVICES',
    line: 'From idea to reality — Research Pillars, Publications & Grants.',
    to: '/publications',
    match: ['/publications', '/collaborations'],
  },
  {
    num: '03',
    word: 'STUDIO',
    line: 'Two minds. One direction — About AIR Lab, Faculty, Fellows & Performers.',
    to: '/about',
    match: ['/about', '/team', '/interns', '/performers', '/gallery'],
  },
  {
    num: '04',
    word: 'CONTACT',
    line: 'Give us a limit — Fellowships, R&D Partnerships & Direct Inquiry.',
    to: '/contact',
    match: ['/contact'],
  },
];

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderDark, setIsHeaderDark] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [karachiTime, setKarachiTime] = useState('');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const location = useLocation();

  // Live Karachi clock
  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setKarachiTime(formatted);
      } catch {
        setKarachiTime('12:00');
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to top or hash on route navigation
  useEffect(() => {
    setIsMenuOpen(false);
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    document.body.style.overflow = '';

    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.pathname, location.search, location.hash]);

  // Header condensed state & dark section detection
  useEffect(() => {
    let rafId = 0;
    const checkScroll = () => {
      rafId = 0;
      const y = window.scrollY;
      document.documentElement.classList.toggle('is-condensed', y > 80);

      // Check if header overlaps a .studio-dark section
      const headerHeight = y > 80 ? 72 : 118;
      const sampleY = headerHeight * 0.5;
      const darkSections = document.querySelectorAll('.studio-dark');
      let overDark = false;
      darkSections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= sampleY && rect.bottom >= sampleY) {
          overDark = true;
        }
      });
      setIsHeaderDark(overDark);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(checkScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  // Append .link-dot to all .text-link elements automatically like Studio Unlmtd's Pl()
  useEffect(() => {
    const links = document.querySelectorAll('.text-link');
    links.forEach((el) => {
      if (!el.querySelector('.link-dot')) {
        const dot = document.createElement('span');
        dot.className = 'link-dot';
        dot.setAttribute('aria-hidden', 'true');
        el.appendChild(dot);
      }
    });
  });

  const openMenu = () => {
    setIsMenuOpen(true);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="load-progress" aria-hidden="true"></div>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* STUDIO UNLMTD HEADER */}
      <header className={`site-header ${isHeaderDark ? 'is-dark' : ''}`}>
        <Link className="brand" to="/" aria-label="AIR Lab — Home">
          <span className="brand-wordmark">
            AIR LAB
            <small>NED UNIVERSITY · CSIT</small>
          </span>
        </Link>

        <div className="header-right">
          <Link className="header-contact" to="/contact">
            LET’S TALK<span className="link-dot" aria-hidden="true"></span>
          </Link>
          <button
            type="button"
            className="header-contact"
            onClick={() => setIsApplicationOpen(true)}
          >
            FELLOWSHIP<span className="link-dot" aria-hidden="true"></span>
          </button>
          <button
            id="menu-toggle"
            className="menu-toggle"
            type="button"
            aria-haspopup="dialog"
            aria-controls="site-menu"
            aria-expanded={isMenuOpen}
            onClick={openMenu}
          >
            <span className="menu-label">MENU</span>
            <span className="burger" aria-hidden="true">
              <i></i>
              <i></i>
            </span>
          </button>
        </div>
      </header>

      {/* STUDIO UNLMTD FULL-SCREEN DIALOG MENU */}
      <dialog
        id="site-menu"
        ref={dialogRef}
        className={`site-menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Navigation"
        onClose={() => {
          setIsMenuOpen(false);
          document.body.style.overflow = '';
        }}
      >
        <div className="menu-body">
          <div className="menu-head">
            <Link className="brand" to="/" aria-label="AIR Lab — Home" onClick={closeMenu}>
              <span className="brand-wordmark">
                AIR LAB
                <small>NED UNIVERSITY · CSIT</small>
              </span>
            </Link>
            <div className="menu-head-actions">
              <button
                id="menu-close"
                className="menu-close"
                type="button"
                onClick={closeMenu}
              >
                <span>CLOSE</span>
                <span className="menu-close-lines" aria-hidden="true">
                  <i></i>
                  <i></i>
                </span>
              </button>
            </div>
          </div>

          <nav aria-label="Main pages">
            {MENU_ITEMS.map((item) => {
              const isCurrent = item.match.includes(location.pathname);
              return (
                <Link
                  key={item.num}
                  to={item.to}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={closeMenu}
                >
                  <span className="menu-number">{item.num}</span>
                  <span className="menu-entry">
                    <span className="menu-word-mask">
                      <span className="menu-word liquid-word">
                        {item.word}
                        <span className="menu-dot"></span>
                      </span>
                    </span>
                    <small className="menu-line">{item.line}</small>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="menu-foot">
            <span>HUMAN DIRECTION. AI ACCELERATION.</span>
            <div className="menu-foot-right">
              <span className="menu-time">
                Karachi <time>{karachiTime}</time>
              </span>
              <div className="language-switch" aria-label="Laboratory Portals">
                <Link to="/team" onClick={closeMenu}>
                  TEAM
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/grants" onClick={closeMenu}>
                  GRANTS
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/interns" onClick={closeMenu}>
                  FELLOWS
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/performers" onClick={closeMenu}>
                  PERFORMERS
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/collaborations" onClick={closeMenu}>
                  PARTNERS
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/gallery" onClick={closeMenu}>
                  GALLERY
                </Link>
              </div>
            </div>
          </div>
        </div>
      </dialog>

      {/* MAIN CONTENT */}
      <main id="main" tabIndex={-1} data-route={location.pathname}>
        <Outlet
          context={{
            openApplicationModal: () => setIsApplicationOpen(true),
            openDrawer: () => setIsDrawerOpen(true),
          }}
        />
      </main>

      {/* STUDIO UNLMTD FOOTER */}
      <footer className="site-footer">
        <div className="footer-top">
          <span className="section-label reveal is-visible">YOUR TURN.</span>
          <p className="footer-story reveal is-visible">
            Every sovereign AI system started as a limit someone decided not to accept. What’s yours?
          </p>
          <Link
            className="footer-cta reveal is-visible"
            to="/contact"
            style={{ '--cta-chars': 8 } as React.CSSProperties}
          >
            <span className="gradient liquid-word">
              GIVE US
              <br />A LIMIT<span className="word-dot"></span>
            </span>
          </Link>
        </div>

        <div className="footer-dark studio-dark">
          <div className="footer-col">
            <span className="section-label">STUDIO &amp; LAB</span>
            <address className="footer-address">
              <span>Department of CSIT, AIR Lab</span>
              <span>NED University of Engineering &amp; Technology</span>
              <span>University Road, Karachi 75270, Pakistan</span>
            </address>
            <a
              className="text-link"
              href="https://maps.google.com/?q=NED+University+of+Engineering+and+Technology+Karachi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
            </a>
            <span className="footer-gps" aria-label="GPS coordinates">
              24.9339° N, 67.1116° E
            </span>
          </div>

          <div className="footer-col">
            <span className="section-label">FOLLOW &amp; ARCHIVES</span>
            <ul className="footer-links">
              <li>
                <span className="social-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.6 5.9v7.5H1.1V5.9h2.5ZM2.4 2.4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5Zm5.5 3.5v1c.4-.7 1.2-1.2 2.3-1.2 1.8 0 3 1.1 3 3.4v4.3h-2.5V9.6c0-1-.4-1.7-1.3-1.7-.9 0-1.5.6-1.5 1.7v3.8H5.4V5.9h2.5Z"></path>
                  </svg>
                </span>
                <a
                  className="text-link"
                  href="https://www.neduet.edu.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn — NED AIR Lab
                </a>
              </li>
              <li>
                <span className="social-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M15.4 4.7a2 2 0 0 0-1.4-1.4C12.8 3 8 3 8 3s-4.8 0-6 .3A2 2 0 0 0 .6 4.7 21 21 0 0 0 .3 8c0 1.1.1 2.2.3 3.3a2 2 0 0 0 1.4 1.4c1.2.3 6 .3 6 .3s4.8 0 6-.3a2 2 0 0 0 1.4-1.4c.2-1.1.3-2.2.3-3.3 0-1.1-.1-2.2-.3-3.3ZM6.5 10.1V5.9L10.4 8l-3.9 2.1Z"></path>
                  </svg>
                </span>
                <Link className="text-link" to="/gallery">
                  Lab Showreel &amp; Media
                </Link>
              </li>
              <li>
                <span className="social-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M9.3 6.8 14.5 1h-1.2L8.8 6 5.2 1H1l5.5 7.8L1 15h1.2l4.8-5.4L10.8 15H15L9.3 6.8Zm-1.7 1.9-.6-.8L2.7 1.9h1.9l3.6 5 .6.8 4.6 6.5h-1.9L7.6 8.7Z"></path>
                  </svg>
                </span>
                <Link className="text-link" to="/publications">
                  Research Papers &amp; Code
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <span className="section-label">LET’S TALK</span>
            <ul className="footer-links">
              <li>
                <a className="text-link" href="mailto:airlab@neduet.edu.pk">
                  airlab@neduet.edu.pk
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  Apply for research fellowship
                </button>
              </li>
              <li>
                <Link className="text-link" to="/contact#write">
                  Write us a message
                </Link>
              </li>
              <li>
                <Link className="text-link" to="/collaborations">
                  Institutional R&amp;D partnerships
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <span className="section-label">PORTALS</span>
            <ul className="footer-languages" aria-label="Directory">
              <li>
                <Link
                  to="/projects"
                  aria-current={location.pathname === '/projects' ? 'page' : undefined}
                >
                  WORK
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  aria-current={location.pathname === '/team' ? 'page' : undefined}
                >
                  TEAM
                </Link>
              </li>
              <li>
                <Link
                  to="/grants"
                  aria-current={location.pathname === '/grants' ? 'page' : undefined}
                >
                  GRANTS
                </Link>
              </li>
              <li>
                <Link
                  to="/performers"
                  aria-current={location.pathname === '/performers' ? 'page' : undefined}
                >
                  HONORS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="brand-wordmark" style={{ fontSize: '15px' }}>
            AIR LAB
          </span>
          <span>100% HUMAN. 100% AI. 200% UNLMTD.</span>
          <span className="footer-copy">© 2026 AIR LAB — NED UNIVERSITY</span>
          <span className="footer-legal">
            <Link to="/about">Charter</Link>
            <Link to="/interns">Fellowships</Link>
            <button
              type="button"
              className="footer-consent"
              onClick={() => setIsDrawerOpen(true)}
            >
              Quick Index
            </button>
          </span>
        </div>
      </footer>

      <StudentApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
      />
      <QuickDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
