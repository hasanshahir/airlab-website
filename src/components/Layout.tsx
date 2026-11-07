import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import StudentApplicationModal from './StudentApplicationModal';
import QuickDrawer from './QuickDrawer';
import {
  mountLiquidWord,
  animateHeroPour,
  mountPageAnimations,
  getElementCenter,
  getMaxIrisRadius,
  syncMenuTheme,
} from '../lib/studioUnlmtdEngine';

export interface LayoutOutletContext {
  openApplicationModal: () => void;
  openDrawer: () => void;
}

interface SubPortalItem {
  label: string;
  desc: string;
  to: string;
  isModal?: 'apply' | 'drawer';
}

interface DropdownColumn {
  heading: string;
  items: SubPortalItem[];
}

const NAVBAR_DROPDOWNS: Record<'research' | 'people' | 'about', DropdownColumn[]> = {
  research: [
    {
      heading: 'EXPLORE PORTFOLIO',
      items: [
        {
          label: 'Projects Catalog',
          desc: 'Applied AI, edge perception, robotics, and healthcare',
          to: '/projects',
        },
        {
          label: 'Research Grants',
          desc: 'Sponsored research funding and national initiatives',
          to: '/grants',
        },
      ],
    },
    {
      heading: 'ARTICLES',
      items: [
        {
          label: 'Publications',
          desc: 'Peer-reviewed conference papers, journals, and citations',
          to: '/publications',
        },
        {
          label: 'Blogs',
          desc: 'Technical breakdowns, research notes, and lab stories',
          to: '/publications#blogs',
        },
      ],
    },
  ],
  people: [
    {
      heading: 'LAB MEMBERS',
      items: [
        {
          label: 'Faculty Leads',
          desc: 'Principal investigators, professors, and advisors',
          to: '/team?tab=faculty',
        },
        {
          label: 'Research Interns',
          desc: 'Active student researchers and lab fellows',
          to: '/team?tab=interns',
        },
        {
          label: 'Past Interns',
          desc: 'Past fellows and where they are today',
          to: '/team?tab=previous',
        },
      ],
    },
    {
      heading: 'COMMUNITY & SPOTLIGHT',
      items: [
        {
          label: 'Fellowship Program',
          desc: 'Internship trajectories and application tracks',
          to: '/interns',
        },
        {
          label: 'Performer of the Month',
          desc: 'Monthly research honors and milestones',
          to: '/performers',
        },
      ],
    },
  ],
  about: [
    {
      heading: 'ABOUT US',
      items: [
        {
          label: 'About AIR Lab',
          desc: 'Mission, foundational pillars, and department leadership',
          to: '/about',
        },
        {
          label: 'Collaborations',
          desc: 'Enterprise sponsors and academic research partners',
          to: '/collaborations',
        },
      ],
    },
    {
      heading: 'LIFE AT THE LAB',
      items: [
        {
          label: 'Lab Gallery',
          desc: 'Milestones, hackathons, and technical workshops',
          to: '/gallery',
        },
      ],
    },
  ],
};

const MENU_ITEMS: {
  num: string;
  word: string;
  line: string;
  to: string;
  match: string[];
  subLabel: string;
  subItems: SubPortalItem[];
}[] = [
  {
    num: '01',
    word: 'WORK',
    line: 'See what we mean — Projects, Clinical AI & Deployed Benchmarks.',
    to: '/projects',
    match: ['/projects', '/grants'],
    subLabel: 'RESEARCH',
    subItems: [
      {
        label: 'Projects Catalog',
        desc: 'Applied AI, edge perception, robotics, and healthcare',
        to: '/projects',
      },
      {
        label: 'Research Grants',
        desc: 'Sponsored research funding and national initiatives',
        to: '/grants',
      },
      {
        label: 'Publications',
        desc: 'Peer-reviewed conference papers, journals, and citations',
        to: '/publications',
      },
      {
        label: 'Research Blogs',
        desc: 'Technical breakdowns, research notes, and lab stories',
        to: '/publications#blogs',
      },
    ],
  },
  {
    num: '02',
    word: 'SERVICES',
    line: 'From idea to reality — Research Pillars, Publications & Grants.',
    to: '/publications',
    match: ['/publications', '/collaborations'],
    subLabel: 'CAPABILITIES',
    subItems: [
      {
        label: 'Publications & Citations',
        desc: 'IEEE, Elsevier, Springer & premier conference outputs',
        to: '/publications',
      },
      {
        label: 'Technical Dispatches & Blogs',
        desc: 'Architecture deep dives and field trial reports',
        to: '/publications#blogs',
      },
      {
        label: 'Sponsored Grants Ledger',
        desc: 'HEC NRPU, NCAI & national R&D funding awards',
        to: '/grants',
      },
      {
        label: 'Academic & Industry Partners',
        desc: 'Hospital networks, international labs & enterprise allies',
        to: '/collaborations',
      },
    ],
  },
  {
    num: '03',
    word: 'STUDIO',
    line: 'Two minds. One direction — About AIR Lab, Faculty, Fellows & Performers.',
    to: '/about',
    match: ['/about', '/team', '/interns', '/performers', '/gallery'],
    subLabel: 'PEOPLE & LAB',
    subItems: [
      {
        label: 'About AIR Lab',
        desc: 'Mission, foundational pillars, and department leadership',
        to: '/about',
      },
      {
        label: 'Faculty Leads',
        desc: 'Principal investigators, professors, and advisors',
        to: '/team?tab=faculty',
      },
      {
        label: 'Research Interns & Alumni',
        desc: 'Active student researchers and past fellows directory',
        to: '/team?tab=interns',
      },
      {
        label: 'Fellowship Program',
        desc: 'Internship trajectories and application tracks',
        to: '/interns',
      },
      {
        label: 'Performer of the Month',
        desc: 'Monthly research honors and milestones',
        to: '/performers',
      },
      {
        label: 'Lab Gallery',
        desc: 'Milestones, hackathons, and technical workshops',
        to: '/gallery',
      },
    ],
  },
  {
    num: '04',
    word: 'CONTACT',
    line: 'Give us a limit — Fellowships, R&D Partnerships & Direct Inquiry.',
    to: '/contact',
    match: ['/contact'],
    subLabel: 'CONNECT',
    subItems: [
      {
        label: 'Direct Lab Inquiry',
        desc: 'Schedule a research briefing or write us a message',
        to: '/contact',
      },
      {
        label: 'Apply for Fellowship',
        desc: 'Submit your student research application directly',
        to: '#apply',
        isModal: 'apply',
      },
      {
        label: 'Institutional R&D Partnerships',
        desc: 'Sponsor clinical AI, edge hardware, or LLM benchmarks',
        to: '/collaborations',
      },
      {
        label: 'Quick Index Drawer',
        desc: 'Open the full laboratory directory drawer',
        to: '#drawer',
        isModal: 'drawer',
      },
    ],
  },
];

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderDark, setIsHeaderDark] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [karachiTime, setKarachiTime] = useState('');
  const [headerDropdown, setHeaderDropdown] = useState<'research' | 'people' | 'about' | null>(null);
  const [menuHeadDropdown, setMenuHeadDropdown] = useState<'research' | 'people' | 'about' | null>(
    null
  );
  const [expandedMenuRow, setExpandedMenuRow] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const menuLiquidCleanupsRef = useRef<(() => void)[]>([]);
  const menuAnimationsRef = useRef<Animation[]>([]);
  const isClosingRef = useRef(false);

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

  const destroyMenuLiquids = useCallback(() => {
    menuLiquidCleanupsRef.current.forEach((fn) => fn());
    menuLiquidCleanupsRef.current = [];
  }, []);

  const cancelMenuAnimations = useCallback(() => {
    menuAnimationsRef.current.forEach((anim) => anim.cancel());
    menuAnimationsRef.current = [];
  }, []);

  // Force-close menu immediately on route change
  useEffect(() => {
    setHeaderDropdown(null);
    setMenuHeadDropdown(null);
    setExpandedMenuRow(null);
    cancelMenuAnimations();
    destroyMenuLiquids();
    isClosingRef.current = false;
    setIsMenuOpen(false);
    const dlg = dialogRef.current;
    if (dlg) {
      dlg.classList.remove('is-open', 'is-diving');
      dlg.style.clipPath = '';
      if (dlg.open) dlg.close();
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
  }, [location.pathname, location.search, location.hash, cancelMenuAnimations, destroyMenuLiquids]);

  // Mount WebGL Liquid Swirl on all `main .liquid-word` and `.site-footer .liquid-word`, plus Hero Pour & Scroll Reveals
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const mainEl = mainRef.current;
    const footerEl = footerRef.current;

    if (mainEl) {
      const pageCleanup = mountPageAnimations(mainEl);
      cleanups.push(pageCleanup);

      const pourCleanup = animateHeroPour(mainEl);
      if (pourCleanup) cleanups.push(pourCleanup);

      const words = mainEl.querySelectorAll<HTMLElement>('.liquid-word');
      words.forEach((w) => {
        const c = mountLiquidWord(w);
        if (c) cleanups.push(c);
      });
    }

    if (footerEl) {
      const footerWords = footerEl.querySelectorAll<HTMLElement>('.liquid-word');
      footerWords.forEach((w) => {
        const c = mountLiquidWord(w);
        if (c) cleanups.push(c);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [location.pathname]);

  // Header condensed state & dark section detection
  useEffect(() => {
    let rafId = 0;
    const checkScroll = () => {
      rafId = 0;
      const y = window.scrollY;
      document.documentElement.classList.toggle('is-condensed', y > 80);

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

  // Studio Unlmtd Circular Iris Menu Open Animation (Qo)
  const openMenu = () => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    cancelMenuAnimations();
    isClosingRef.current = false;
    setHeaderDropdown(null);

    syncMenuTheme(dlg, isHeaderDark);
    if (!dlg.open) {
      dlg.showModal();
    }
    document.body.style.overflow = 'hidden';
    setIsMenuOpen(true);
    dlg.classList.add('is-open');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = Array.from(dlg.querySelectorAll<HTMLElement>('.menu-word'));
    const numbers = Array.from(dlg.querySelectorAll<HTMLElement>('.menu-number'));
    const lines = Array.from(dlg.querySelectorAll<HTMLElement>('.menu-line, .menu-sub-toggle'));
    const foot = dlg.querySelector<HTMLElement>('.menu-foot');

    if (reduced) {
      dlg.style.clipPath = '';
      words.forEach((w) => {
        const c = mountLiquidWord(w);
        if (c) menuLiquidCleanupsRef.current.push(c);
      });
      return;
    }

    // 1. Circular iris clip-path from #menu-toggle .burger
    const origin = getElementCenter(toggleBtnRef.current);
    const maxR = getMaxIrisRadius(origin);
    const startTime = performance.now();
    const irisDuration = 920;

    const stepIrisOpen = (now: number) => {
      if (isClosingRef.current || !dlg.open) return;
      const p = Math.min(1, (now - startTime) / irisDuration);
      // power3.out
      const eased = 1 - Math.pow(1 - p, 3);
      const r = Math.max(0.01, maxR * eased);
      dlg.style.clipPath = `circle(${r.toFixed(1)}px at ${origin.x.toFixed(1)}px ${origin.y.toFixed(1)}px)`;
      if (p < 1) {
        requestAnimationFrame(stepIrisOpen);
      } else {
        dlg.style.clipPath = '';
        // Mount WebGL liquid swirl on menu words once iris settles
        destroyMenuLiquids();
        words.forEach((w) => {
          const c = mountLiquidWord(w);
          if (c) menuLiquidCleanupsRef.current.push(c);
        });
      }
    };
    requestAnimationFrame(stepIrisOpen);

    // 2. Staggered .menu-word slide up (yPercent: 108 -> 0)
    words.forEach((w, idx) => {
      const anim = w.animate(
        [{ transform: 'translateY(108%)' }, { transform: 'translateY(0%)' }],
        {
          duration: 800,
          delay: 140 + idx * 60,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }
      );
      menuAnimationsRef.current.push(anim);
    });

    // 3. Staggered .menu-number & .menu-line fade in
    numbers.forEach((num, idx) => {
      const anim = num.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        {
          duration: 750,
          delay: 250 + idx * 60,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }
      );
      menuAnimationsRef.current.push(anim);
    });

    lines.forEach((ln, idx) => {
      const anim = ln.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 0.68, transform: 'translateY(0px)' },
        ],
        {
          duration: 750,
          delay: 260 + idx * 50,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }
      );
      menuAnimationsRef.current.push(anim);
    });

    // 4. .menu-foot fade in
    if (foot) {
      const anim = foot.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        {
          duration: 500,
          delay: 560,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }
      );
      menuAnimationsRef.current.push(anim);
    }
  };

  // Studio Unlmtd Circular Iris Menu Close Animation (es)
  const closeMenu = () => {
    const dlg = dialogRef.current;
    if (!dlg || !dlg.open) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
      return;
    }
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setMenuHeadDropdown(null);
    setExpandedMenuRow(null);
    cancelMenuAnimations();
    destroyMenuLiquids();

    const finishClose = () => {
      isClosingRef.current = false;
      setIsMenuOpen(false);
      dlg.classList.remove('is-open', 'is-diving');
      dlg.style.clipPath = '';
      if (dlg.open) dlg.close();
      document.body.style.overflow = '';
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      finishClose();
      return;
    }

    dlg.classList.remove('is-open');
    const words = Array.from(dlg.querySelectorAll<HTMLElement>('.menu-word'));
    const metas = Array.from(
      dlg.querySelectorAll<HTMLElement>('.menu-number, .menu-line, .menu-sub-toggle, .menu-foot')
    );

    // 1. Slide .menu-word up and out (-108%) staggered from end
    words.forEach((w, idx) => {
      const revIdx = words.length - 1 - idx;
      const anim = w.animate(
        [{ transform: 'translateY(0%)' }, { transform: 'translateY(-108%)' }],
        {
          duration: 300,
          delay: revIdx * 20,
          easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
          fill: 'forwards',
        }
      );
      menuAnimationsRef.current.push(anim);
    });

    // 2. Fade out numbers, lines, footer
    metas.forEach((m) => {
      const anim = m.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 260,
        easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        fill: 'forwards',
      });
      menuAnimationsRef.current.push(anim);
    });

    // 3. Circular iris clip-path shrink to #menu-close .menu-close-lines
    const origin = getElementCenter(closeBtnRef.current);
    const maxR = getMaxIrisRadius(origin);
    const startTime = performance.now() + 45;
    const closeDuration = 480;

    const stepIrisClose = (now: number) => {
      if (!isClosingRef.current) return;
      if (now < startTime) {
        dlg.style.clipPath = `circle(${maxR.toFixed(1)}px at ${origin.x.toFixed(1)}px ${origin.y.toFixed(1)}px)`;
        requestAnimationFrame(stepIrisClose);
        return;
      }
      const p = Math.min(1, (now - startTime) / closeDuration);
      // power3.inOut
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const r = Math.max(0.01, maxR * (1 - eased));
      dlg.style.clipPath = `circle(${r.toFixed(2)}px at ${origin.x.toFixed(1)}px ${origin.y.toFixed(1)}px)`;
      if (p < 1) {
        requestAnimationFrame(stepIrisClose);
      } else {
        cancelMenuAnimations();
        finishClose();
      }
    };
    requestAnimationFrame(stepIrisClose);
  };

  // Mount liquid word immediately when hovering a menu item if iris is still opening
  const handleMenuRowHover = (e: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    const wordEl = e.currentTarget.querySelector<HTMLElement>('.menu-word');
    if (wordEl && !wordEl.querySelector('canvas.liquid')) {
      const c = mountLiquidWord(wordEl);
      if (c) menuLiquidCleanupsRef.current.push(c);
    }
  };

  // Reusable Categorized Navbar Dropdown Bar (matches https://airlab-website-peach.vercel.app/#/)
  const renderNavbarDropdowns = (
    activeKey: 'research' | 'people' | 'about' | null,
    setActiveKey: React.Dispatch<React.SetStateAction<'research' | 'people' | 'about' | null>>,
    insideMenu = false
  ) => {
    const handleNavigate = () => {
      setActiveKey(null);
      if (insideMenu) closeMenu();
    };

    const isResearchActive =
      location.pathname.includes('/projects') ||
      location.pathname.includes('/grants') ||
      location.pathname.includes('/publications');
    const isPeopleActive =
      location.pathname.includes('/team') ||
      location.pathname.includes('/interns') ||
      location.pathname.includes('/performers');
    const isAboutActive =
      location.pathname.includes('/about') ||
      location.pathname.includes('/collaborations') ||
      location.pathname.includes('/gallery');

    return (
      <nav className="header-nav-bar" aria-label="Categorized Laboratory Navigation">
        <Link
          to="/"
          onClick={handleNavigate}
          className={`nav-top-link ${location.pathname === '/' ? 'is-active' : ''}`}
        >
          Home
        </Link>

        {/* RESEARCH DROPDOWN */}
        <div
          className="nav-top-item"
          onMouseEnter={() => setActiveKey('research')}
          onMouseLeave={() => setActiveKey(null)}
        >
          <button
            type="button"
            className={`nav-top-trigger ${activeKey === 'research' || isResearchActive ? 'is-active' : ''}`}
            aria-expanded={activeKey === 'research'}
            onClick={() => setActiveKey(activeKey === 'research' ? null : 'research')}
          >
            <span>Research</span>
            <svg className="nav-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {activeKey === 'research' && (
            <div className="nav-dropdown-bridge">
              <div className="nav-dropdown-panel">
                {NAVBAR_DROPDOWNS.research.map((col) => (
                  <div key={col.heading}>
                    <div className="nav-dropdown-col-title">{col.heading}</div>
                    <div className="nav-dropdown-list">
                      {col.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="nav-dropdown-card"
                          onClick={handleNavigate}
                        >
                          <div className="nav-dropdown-card-head">
                            <span>{item.label}</span>
                            <span className="nav-dropdown-card-dot" aria-hidden="true"></span>
                          </div>
                          <p>{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PEOPLE DROPDOWN */}
        <div
          className="nav-top-item"
          onMouseEnter={() => setActiveKey('people')}
          onMouseLeave={() => setActiveKey(null)}
        >
          <button
            type="button"
            className={`nav-top-trigger ${activeKey === 'people' || isPeopleActive ? 'is-active' : ''}`}
            aria-expanded={activeKey === 'people'}
            onClick={() => setActiveKey(activeKey === 'people' ? null : 'people')}
          >
            <span>People</span>
            <svg className="nav-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {activeKey === 'people' && (
            <div className="nav-dropdown-bridge">
              <div className="nav-dropdown-panel">
                {NAVBAR_DROPDOWNS.people.map((col) => (
                  <div key={col.heading}>
                    <div className="nav-dropdown-col-title">{col.heading}</div>
                    <div className="nav-dropdown-list">
                      {col.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="nav-dropdown-card"
                          onClick={handleNavigate}
                        >
                          <div className="nav-dropdown-card-head">
                            <span>{item.label}</span>
                            <span className="nav-dropdown-card-dot" aria-hidden="true"></span>
                          </div>
                          <p>{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ABOUT DROPDOWN */}
        <div
          className="nav-top-item"
          onMouseEnter={() => setActiveKey('about')}
          onMouseLeave={() => setActiveKey(null)}
        >
          <button
            type="button"
            className={`nav-top-trigger ${activeKey === 'about' || isAboutActive ? 'is-active' : ''}`}
            aria-expanded={activeKey === 'about'}
            onClick={() => setActiveKey(activeKey === 'about' ? null : 'about')}
          >
            <span>About</span>
            <svg className="nav-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {activeKey === 'about' && (
            <div className="nav-dropdown-bridge">
              <div className="nav-dropdown-panel">
                {NAVBAR_DROPDOWNS.about.map((col) => (
                  <div key={col.heading}>
                    <div className="nav-dropdown-col-title">{col.heading}</div>
                    <div className="nav-dropdown-list">
                      {col.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="nav-dropdown-card"
                          onClick={handleNavigate}
                        >
                          <div className="nav-dropdown-card-head">
                            <span>{item.label}</span>
                            <span className="nav-dropdown-card-dot" aria-hidden="true"></span>
                          </div>
                          <p>{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/contact"
          onClick={handleNavigate}
          className={`nav-top-link ${location.pathname === '/contact' ? 'is-active' : ''}`}
        >
          Contact
        </Link>
      </nav>
    );
  };

  return (
    <>
      <div className="load-progress" aria-hidden="true"></div>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* STUDIO UNLMTD HEADER WITH CATEGORIZED MEGA-DROPDOWNS */}
      <header className={`site-header ${isHeaderDark ? 'is-dark' : ''}`}>
        <Link className="brand" to="/" aria-label="AIR Lab — Home">
          <span className="brand-wordmark">
            AIR LAB
            <small>NED UNIVERSITY · CSIT</small>
          </span>
        </Link>

        {renderNavbarDropdowns(headerDropdown, setHeaderDropdown, false)}

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
            ref={toggleBtnRef}
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

      {/* STUDIO UNLMTD FULL-SCREEN DIALOG MENU WITH IRIS ANIMATION, WEBGL SWIRL & SUB-DROPDOWNS */}
      <dialog
        id="site-menu"
        ref={dialogRef}
        className={`site-menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Navigation"
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
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

            {renderNavbarDropdowns(menuHeadDropdown, setMenuHeadDropdown, true)}

            <div className="menu-head-actions">
              <button
                id="menu-close"
                ref={closeBtnRef}
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
              const isExpanded = expandedMenuRow === item.num;
              return (
                <div key={item.num} className="menu-row-wrapper">
                  <div className="menu-row-main">
                    <Link
                      to={item.to}
                      className="menu-row-link"
                      aria-current={isCurrent ? 'page' : undefined}
                      onPointerEnter={handleMenuRowHover}
                      onFocus={handleMenuRowHover}
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

                    <button
                      type="button"
                      className="menu-sub-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedMenuRow(isExpanded ? null : item.num)}
                    >
                      <span>{item.subLabel}</span>
                      <svg
                        className="nav-chevron"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="menu-sub-drawer">
                      {item.subItems.map((sub) =>
                        sub.isModal ? (
                          <button
                            key={sub.label}
                            type="button"
                            className="menu-sub-item"
                            style={{ textAlign: 'left' }}
                            onClick={() => {
                              closeMenu();
                              if (sub.isModal === 'apply') setIsApplicationOpen(true);
                              if (sub.isModal === 'drawer') setIsDrawerOpen(true);
                            }}
                          >
                            <strong>
                              {sub.label}
                              <span style={{ color: '#219cf5', margin: 0 }}>↗</span>
                            </strong>
                            <span>{sub.desc}</span>
                          </button>
                        ) : (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            className="menu-sub-item"
                            onClick={closeMenu}
                          >
                            <strong>
                              {sub.label}
                              <span style={{ color: '#219cf5', margin: 0 }}>→</span>
                            </strong>
                            <span>{sub.desc}</span>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
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
      <main id="main" ref={mainRef} tabIndex={-1} data-route={location.pathname}>
        <Outlet
          context={{
            openApplicationModal: () => setIsApplicationOpen(true),
            openDrawer: () => setIsDrawerOpen(true),
          }}
        />
      </main>

      {/* STUDIO UNLMTD FOOTER */}
      <footer className="site-footer" ref={footerRef}>
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
