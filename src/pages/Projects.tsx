import React, { useState, useMemo, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { getProjects, getGrants } from '../data/airlabData';
import { getProjectCover } from '../lib/placeholders';
import type { ProjectItem, Grant } from '../types/data';

const PORTFOLIO_THEMES = [
  { bg: '#0b132b', fg: '#ffffff' },
  { bg: '#e9eeed', fg: '#0b0c0e' },
  { bg: '#161925', fg: '#ffffff' },
  { bg: '#f2ece4', fg: '#111215' },
  { bg: '#111827', fg: '#ffffff' },
  { bg: '#eae6df', fg: '#0b0c0e' },
];

export default function Projects() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const [projects, setProjects] = useState<ProjectItem[]>(() => getProjects());
  const [grants, setGrants] = useState<Grant[]>(() => getGrants());

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/content/projects').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('/api/content/grants').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([projsData, grantsData]) => {
      if (!active) return;
      if (Array.isArray(projsData) && projsData.length > 0) {
        setProjects(projsData);
      }
      if (Array.isArray(grantsData) && grantsData.length > 0) {
        setGrants(grantsData);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
    return ['all', 'Ongoing', 'Finished', ...cats];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    if (selectedCategory === 'Ongoing' || selectedCategory === 'Finished') {
      return projects.filter((p) => p.status === selectedCategory);
    }
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <>
      {/* STUDIO UNLMTD PORTFOLIO HEADING */}
      <section className="section portfolio-heading">
        <div className="section-label reveal is-visible">
          <span>PORTFOLIO</span>
          <span>NED UNIVERSITY · AIR LAB</span>
        </div>
        <h1 className="reveal is-visible" data-fit="">
          Work.
        </h1>
        <p className="reveal is-visible">
          Selected AI research systems, clinical diagnostic pipelines, multilingual LLMs, and
          autonomous robotics engineered from start to finish.
        </p>
      </section>

      {/* STUDIO UNLMTD PORTFOLIO INDEX */}
      <section className="section portfolio-index" aria-label="Projects">
        <div className="portfolio-tools">
          <div className="portfolio-filters" role="group" aria-label="Filter by discipline">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
          <span className="portfolio-count" role="status" aria-live="polite">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {/* SELECTED PROJECT EDITORIAL SHEET (IF CLICKED) */}
        {activeProject && (
          <div
            className="editorial-sheet reveal is-visible"
            style={{
              margin: '0 0 65px',
              padding: '36px',
              background: '#f4f4f5',
              borderTop: '2px solid #000',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span className="section-label" style={{ marginBottom: '10px', display: 'block' }}>
                  {activeProject.category.toUpperCase()} · {activeProject.status.toUpperCase()}
                </span>
                <h2
                  style={{
                    fontSize: 'clamp(28px, 3.6vw, 52px)',
                    fontWeight: 900,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.02,
                  }}
                >
                  {activeProject.title}
                </h2>
              </div>
              <button
                type="button"
                className="sheet-online"
                onClick={() => setActiveProject(null)}
                style={{ '--project-ink': '#000', '--project-bg': '#fff' } as React.CSSProperties}
              >
                Close Case Study ×
              </button>
            </div>

            <p style={{ maxWidth: '75ch', fontSize: '17px', lineHeight: 1.65 }}>
              {activeProject.description}
            </p>

            <dl>
              <div>
                <dt>Status</dt>
                <dd>{activeProject.status}</dd>
              </div>
              <div>
                <dt>Funding / Sponsor</dt>
                <dd>{activeProject.funding || 'NED University AIR Lab'}</dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>{activeProject.startDate || activeProject.timeTaken || '2024 – Present'}</dd>
              </div>
              {activeProject.teamMembers && activeProject.teamMembers.length > 0 && (
                <div>
                  <dt>Research Team</dt>
                  <dd>
                    <ul className="sheet-pills">
                      {activeProject.teamMembers.map((member: string) => (
                        <li key={member}>{member}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="portfolio-grid">
          {filteredProjects.map((proj, idx) => {
            const theme = PORTFOLIO_THEMES[idx % PORTFOLIO_THEMES.length];
            return (
              <a
                key={proj.id}
                href={`#project-${proj.id}`}
                className="project-link reveal is-visible"
                aria-label={`${proj.title} — ${proj.category}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveProject(proj);
                  window.scrollTo({ top: 280, behavior: 'smooth' });
                }}
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
                    loading={idx < 2 ? 'eager' : 'lazy'}
                  />
                  <div className="visual-bottom" aria-hidden="true">
                    <span>
                      {proj.category.toUpperCase()} — {proj.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="project-caption">
                  <h3>{proj.title}</h3>
                  <span>{proj.startDate || proj.status}</span>
                  <span className="project-kind">
                    {proj.category} · {proj.funding || 'NED AIR Lab'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <p className="portfolio-empty">No projects in this discipline yet.</p>
        )}
      </section>

      {/* NATIONAL GRANTS & SPONSORED R&D TEASER */}
      <section className="section studio-dark">
        <div className="section-label reveal is-visible">
          <span>SPONSORED R&amp;D</span>
          <span>{grants.length} NATIONAL &amp; INDUSTRIAL GRANTS</span>
        </div>
        <div className="editorial-pair" style={{ marginTop: '45px' }}>
          <h2 className="reveal is-visible">
            Backed by national
            <br />
            <span className="gradient liquid-word">
              funding<span className="dot">.</span>
            </span>
          </h2>
          <div className="reveal is-visible">
            <p>
              Our projects are supported by competitive grants from the Higher Education Commission
              (HEC), IGNITE National Technology Fund, and industry partners across Pakistan.
            </p>
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginTop: '24px' }}>
              <Link className="text-link" to="/grants">
                Inspect all funded grants ({grants.length})
              </Link>
              <button type="button" className="text-link" onClick={openApplicationModal}>
                Join a project as a Fellow
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
