import React, { useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import {
  getProjects,
  getGrants,
  getPublications,
  getTeamMembers,
  getSponsors,
  RECENT_UPDATES,
} from '../data/airlabData';
import { getMemberAvatar, getProjectCover } from '../lib/placeholders';

const PROJECT_THEMES = [
  { bg: '#0b132b', fg: '#ffffff' },
  { bg: '#e9eeed', fg: '#0b0c0e' },
  { bg: '#161925', fg: '#ffffff' },
  { bg: '#f2ece4', fg: '#111215' },
  { bg: '#0f172a', fg: '#ffffff' },
];

export default function Home() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const openingProjectRef = useRef<HTMLAnchorElement | null>(null);

  const projects = getProjects();
  const grants = getGrants();
  const publications = getPublications();
  const team = getTeamMembers();
  const sponsors = getSponsors();

  const faculty = team.filter((m) => m.category === 'Faculty');
  const leads = faculty.length >= 2 ? faculty.slice(0, 2) : team.slice(0, 2);

  const featuredPrimary = projects[0];
  const featuredSecondary = projects.slice(1, 5);

  // Studio Unlmtd's exact `yl` scroll-linked --frame-inset animation on .opening-project
  useEffect(() => {
    const el = openingProjectRef.current;
    if (!el) return;

    let rafId = 0;
    const updateInset = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const progress = Math.min(1, Math.max(0, (vh * 0.94 - rect.top) / (vh * 0.6)));
      const eased = progress * progress * (3 - 2 * progress);
      const maxInset = window.innerWidth < 601 ? 6 : 13;
      const inset = ((1 - eased) * maxInset).toFixed(2);
      el.style.setProperty('--frame-inset', `${inset}%`);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateInset);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateInset();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const referenceNames = [
    ...sponsors.map((s) => s.name),
    'Higher Education Commission (HEC)',
    'IGNITE National Technology Fund',
    'NED University CSIT',
    'National Incubation Center Karachi',
    'Clinical Diagnostic Partners',
  ];

  return (
    <>
      {/* 1. STUDIO UNLMTD HERO */}
      <section className="home-hero">
        <div className="headline hero-headline">
          <h1 data-pour="">
            THE LIMITS
            <br />
            ARE NOW
            <br />
            <span className="pour">
              <span className="gradient liquid-word">
                OPPOR
                <span className="mobile-break">
                  -<br />
                </span>
                TUNITIES
              </span>
              <span className="word-dot"></span>
            </span>
          </h1>
        </div>
        <p className="tagline reveal is-visible">
          <span>100% HUMAN.</span> <span>100% AI.</span> <span>200% AIR LAB.</span>
        </p>
        <div className="hero-bottom reveal is-visible">
          <span>COMPUTER VISION. MULTILINGUAL LLMS. AUTONOMOUS ROBOTICS.</span>
          <span>NED UNIVERSITY · DEPARTMENT OF CSIT · KARACHI</span>
        </div>
      </section>

      {/* 2. STUDIO UNLMTD INTRO */}
      <section className="section home-intro" id="studio-intro">
        <div className="section-label reveal is-visible">
          <span>THE LAB</span>
        </div>
        <div className="home-intro-copy">
          <h2 className="reveal is-visible">
            We unite foundational AI research and real-world engineering. Without academic silos.
          </h2>
          <p className="reveal is-visible">
            <strong>
              Artificial Intelligence &amp; Robotics Lab (AIR Lab) is NED University’s flagship
              research and engineering studio. We take sovereign AI challenges from mathematical
              formulation to deployed clinical, linguistic, and autonomous systems.
            </strong>
          </p>
          <p className="reveal is-visible">
            At every stage, our Principal Investigators and Research Fellows direct the
            architecture, curate regional datasets, and validate benchmarks. High-throughput GPU
            acceleration lets us test more hypotheses, compress models for sub-5W edge hardware, and
            deliver production-grade systems.
          </p>
          <p className="reveal is-visible">
            No hand-offs, no black-box abstractions: the scholars who author the peer-reviewed
            papers are the engineers who deploy the models in hospitals, farms, and industrial
            field trials.
          </p>
        </div>
      </section>

      {/* 3. STUDIO UNLMTD REFERENCES / SPONSORS */}
      <section className="section home-references" aria-label="Sponsors and Institutional Partners">
        <div className="section-label reveal is-visible">
          <span>SPONSORS, GRANTS &amp; INSTITUTIONAL COLLABORATIONS</span>
        </div>
        <ul className="references-list reveal is-visible">
          {Array.from(new Set(referenceNames)).map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>

      {/* 4. STUDIO UNLMTD SELECTED WORK */}
      <section className="section work-section home-work" id="selected">
        <div className="section-label reveal is-visible">
          <span>SELECTED WORK &amp; BENCHMARKS</span>
          <span>{projects.length} ACTIVE &amp; COMPLETED SYSTEMS</span>
        </div>
        <div className="home-work-intro">
          <h2 className="display reveal is-visible">FEATURED.</h2>
          <div className="reveal is-visible">
            <p>
              Deployed machine learning systems, sovereign regional LLMs, medical diagnostic
              pipelines, and autonomous robotics engineered at AIR Lab.
            </p>
            <Link className="text-link" to="/projects">
              All projects ({projects.length})
            </Link>
          </div>
        </div>

        {/* Opening Full-Bleed Project with Scroll-Linked Inset */}
        {featuredPrimary && (
          <Link
            ref={openingProjectRef}
            className="project-link opening-project reveal is-visible"
            to="/projects"
            aria-label={`${featuredPrimary.title} — ${featuredPrimary.category}`}
          >
            <div
              className="project-visual no-blend"
              style={
                {
                  background: '#0b132b',
                  color: '#ffffff',
                } as React.CSSProperties
              }
            >
              <img
                src={getProjectCover(featuredPrimary.coverImage)}
                alt={featuredPrimary.title}
                width="1600"
                height="900"
                loading="eager"
              />
              <div className="visual-bottom" aria-hidden="true">
                <span>
                  {featuredPrimary.title.toUpperCase()} —{' '}
                  {(featuredPrimary.funding || featuredPrimary.category).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="project-caption">
              <h3>{featuredPrimary.title}</h3>
              <span className="project-kind">
                {featuredPrimary.category} · {featuredPrimary.funding || 'NED AIR Lab'}
              </span>
              <span>{featuredPrimary.status}</span>
            </div>
          </Link>
        )}

        {/* Secondary Featured Portfolio Grid */}
        <div className="portfolio-grid" style={{ marginTop: '65px' }}>
          {featuredSecondary.map((proj, idx) => {
            const theme = PROJECT_THEMES[(idx + 1) % PROJECT_THEMES.length];
            return (
              <Link
                key={proj.id}
                className="project-link reveal is-visible"
                to="/projects"
                aria-label={`${proj.title} — ${proj.category}`}
              >
                <div
                  className="project-visual no-blend"
                  style={
                    {
                      background: theme.bg,
                      color: theme.fg,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={getProjectCover(proj.coverImage)}
                    alt={proj.title}
                    width="1200"
                    height="900"
                    loading="lazy"
                  />
                  <div className="visual-bottom" aria-hidden="true">
                    <span>{proj.category.toUpperCase()}</span>
                  </div>
                </div>
                <div className="project-caption">
                  <h3>{proj.title}</h3>
                  <span>{proj.status}</span>
                  <span className="project-kind">
                    {proj.category}, {proj.funding || 'AIR Lab R&D'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-work-end reveal is-visible" style={{ marginTop: '48px' }}>
          <p className="editorial-note">
            {projects.length} research projects, {grants.length} national grants &amp;{' '}
            {publications.length} peer-reviewed publications in the archive
          </p>
          <Link className="text-link" to="/projects">
            View all projects
          </Link>
        </div>
      </section>

      {/* 5. STUDIO UNLMTD DARK DIFFERENCE SECTION */}
      <section className="section home-difference studio-dark">
        <div className="section-label reveal is-visible">
          <span>THE AIR LAB DIFFERENCE</span>
          <span>HUMAN DIRECTION. AI ACCELERATION.</span>
        </div>
        <div className="difference-heading">
          <h2 className="reveal is-visible">
            Your research deserves
            <br />
            <span className="gradient liquid-word">
              to go further<span className="dot">.</span>
            </span>
          </h2>
        </div>
        <div className="difference-points">
          <article className="reveal is-visible">
            <h3>What problem are we solving?</h3>
            <p>
              Before training a single parameter, we define the clinical, linguistic, or operational
              constraint. We curate sovereign Pakistani datasets where generic global benchmarks
              fail.
            </p>
          </article>
          <article className="reveal is-visible">
            <h3>Engineering guides our choices.</h3>
            <p>
              Our Principal Investigators and Fellows test multiple neural architectures in
              parallel, benchmarking accuracy against latency, memory footprint, and explainability.
            </p>
          </article>
          <article className="reveal is-visible">
            <h3>Systems that come to life in the field.</h3>
            <p>
              We do not stop at simulation. We quantize, compile, and deploy our models onto hospital
              workstations, NVIDIA Jetson UAVs, and RISC-V/FPGA edge nodes.
            </p>
          </article>
        </div>
      </section>

      {/* 6. STUDIO UNLMTD CAPABILITIES / OUTCOMES SECTION */}
      <section className="section capabilities-section home-capabilities studio-dark">
        <div className="section-label reveal is-visible">
          <span>WHAT WE PRODUCE</span>
          <span>FOUR RESEARCH PILLARS</span>
        </div>
        <div className="capabilities-layout">
          <div className="capabilities-heading">
            <h2 className="reveal is-visible">
              Four kinds
              <br />
              of proof.
            </h2>
            <p className="reveal is-visible">
              Depending on the domain, our work takes the shape of a clinical diagnostic tool, a
              regional foundation model, an autonomous robotic system, or a national research grant.
            </p>
          </div>
          <div>
            <ol className="outcomes-list">
              <li className="reveal is-visible">
                <Link to="/projects">
                  <span>01</span>
                  <div>
                    <h3>COMPUTER VISION &amp; CLINICAL AI</h3>
                    <p>Explainable diagnostic imaging and high-speed industrial inspection.</p>
                    <small>
                      Retinal OCT Segmentation · Chest Radiography · Smart Agriculture · Defect
                      Detection
                    </small>
                  </div>
                  <span className="link-dot" aria-hidden="true"></span>
                </Link>
              </li>
              <li className="reveal is-visible">
                <Link to="/projects">
                  <span>02</span>
                  <div>
                    <h3>MULTILINGUAL NLP &amp; URDU LLMS</h3>
                    <p>Sovereign language models and speech pipelines for South Asian dialects.</p>
                    <small>
                      Byte-Level Tokenization · LoRA Fine-Tuning · Urdu &amp; Sindhi Corpora · RAG
                      Systems
                    </small>
                  </div>
                  <span className="link-dot" aria-hidden="true"></span>
                </Link>
              </li>
              <li className="reveal is-visible">
                <Link to="/projects">
                  <span>03</span>
                  <div>
                    <h3>AUTONOMOUS ROBOTICS &amp; EDGE AI</h3>
                    <p>Real-time perception and hardware acceleration under strict power limits.</p>
                    <small>
                      Visual-Inertial Odometry · ROS2 Swarms · NVIDIA Jetson · TinyML &amp; FPGA
                      Co-Design
                    </small>
                  </div>
                  <span className="link-dot" aria-hidden="true"></span>
                </Link>
              </li>
              <li className="reveal is-visible">
                <Link to="/publications">
                  <span>04</span>
                  <div>
                    <h3>PUBLICATIONS &amp; NATIONAL GRANTS</h3>
                    <p>
                      {publications.length}+ peer-reviewed papers and {grants.length} funded R&amp;D
                      initiatives.
                    </p>
                    <small>
                      IEEE &amp; Springer Venues · HEC &amp; IGNITE Grants · Open Benchmarks ·
                      Student Fellowships
                    </small>
                  </div>
                  <span className="link-dot" aria-hidden="true"></span>
                </Link>
              </li>
            </ol>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginTop: '30px' }}>
              <Link className="text-link reveal is-visible" to="/publications">
                Explore publications &amp; papers
              </Link>
              <Link className="text-link reveal is-visible" to="/grants">
                Explore funded grants ({grants.length})
              </Link>
              <button
                type="button"
                className="text-link reveal is-visible"
                onClick={openApplicationModal}
              >
                Apply for research fellowship
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STUDIO UNLMTD QUOTE BAND */}
      <section className="section quote-band">
        <div className="quote-band-copy">
          <h2 className="quote-band-heading reveal is-visible">
            With AI, exploring costs less.
            <br />
            <span className="gradient liquid-word">
              Engineering
              <br className="mobile-break" /> matters more<span className="dot">.</span>
            </span>
          </h2>
          <Link className="text-link reveal is-visible" to="/about">
            How we work inside AIR Lab
          </Link>
        </div>
      </section>

      {/* 8. LIVE LABORATORY DISPATCHES (ACCORDION IN STUDIO UNLMTD CAPABILITIES-LIST STYLE) */}
      <section className="section editorial-section">
        <div className="section-label reveal is-visible">
          <span>LATEST DISPATCHES &amp; BENCHMARKS</span>
          <span>NED CSIT RESEARCH LOG</span>
        </div>
        <div className="capabilities-list" style={{ marginTop: '35px' }}>
          {RECENT_UPDATES.map((item, idx) => (
            <details key={item.code} className="reveal is-visible" open={idx === 0}>
              <summary>
                <span>{String(idx + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="is-rich">
                <p>
                  <strong>
                    {item.category} · {item.date}
                  </strong>{' '}
                  — {item.summary}
                </p>
                <p>
                  <strong>{item.department}:</strong>{' '}
                  {item.isApply ? (
                    <button
                      type="button"
                      className="text-link"
                      onClick={openApplicationModal}
                      style={{ padding: 0 }}
                    >
                      {item.ctaLabel}
                    </button>
                  ) : (
                    <Link className="text-link" to={item.to} style={{ padding: 0 }}>
                      {item.ctaLabel}
                    </Link>
                  )}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 9. STUDIO UNLMTD FOUNDERS / LEADERSHIP PAUSE */}
      <section className="section studio-teaser founders-pause">
        <div className="section-label reveal is-visible">
          <span>THE PEOPLE MAKING THE CALLS</span>
          <span>PRINCIPAL INVESTIGATORS &amp; LAB LEADERSHIP</span>
        </div>
        <div className="founders-intro">
          <h2 className="display reveal is-visible">
            TWO MINDS.
            <br />
            ONE DIRECTION.
          </h2>
          <p className="reveal is-visible">
            Academic rigor.
            <br />
            Engineering velocity.
            <br />
            On every project, from start to finish.
          </p>
        </div>
        <div className="founders-portraits">
          {leads.map((member) => (
            <figure key={member.id} className="founders-portrait reveal is-visible">
              <img
                src={getMemberAvatar(member.image)}
                alt={`${member.name}, ${member.role}`}
                width="900"
                height="900"
                loading="lazy"
              />
              <figcaption>
                <strong>{member.name}</strong>
                <span>
                  <span>{member.designation || member.role}</span>
                  <span>{member.researchFocus || member.department}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="founders-note reveal is-visible">
          <p>
            Supported by {faculty.length} faculty investigators, {team.length - faculty.length}{' '}
            research fellows, and {publications.length}+ peer-reviewed publications at NED
            University of Engineering &amp; Technology.
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link className="text-link" to="/team">
              Meet the full team ({team.length})
            </Link>
            <Link className="text-link" to="/about">
              About the Lab
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
