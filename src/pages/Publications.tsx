import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPublications, getLabBlogs } from '../data/airlabData';

export default function Publications() {
  const publications = getPublications();
  const blogs = getLabBlogs();

  const [selectedYear, setSelectedYear] = useState<string>('all');

  const years = useMemo(() => {
    const ySet = Array.from(new Set(publications.map((p) => String(p.year)))).sort(
      (a, b) => Number(b) - Number(a)
    );
    return ['all', ...ySet];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    if (selectedYear === 'all') return publications;
    return publications.filter((p) => String(p.year) === selectedYear);
  }, [publications, selectedYear]);

  return (
    <>
      {/* STUDIO UNLMTD SERVICES / PUBLICATIONS MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>PUBLICATIONS &amp; RESEARCH OUTPUT</span>
          <span>{publications.length} PEER-REVIEWED PAPERS</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            WHAT WE
            <br />
            <span className="gradient liquid-word">
              PUBLISH<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Peer-reviewed journal articles, IEEE &amp; Springer conference proceedings, and open
            technical dispatches authored by NED University AIR Lab.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="section portfolio-index" style={{ paddingBottom: '20px' }}>
        <div className="portfolio-tools">
          <div className="portfolio-filters" role="group" aria-label="Filter by publication year">
            {years.map((yr) => (
              <button
                key={yr}
                type="button"
                aria-pressed={selectedYear === yr}
                onClick={() => setSelectedYear(yr)}
              >
                {yr === 'all' ? 'All Years' : yr}
              </button>
            ))}
            <a
              href="#blogs"
              style={{
                whiteSpace: 'nowrap',
                minHeight: '44px',
                padding: '8px 0',
                fontSize: '13px',
                color: 'var(--ink)',
                fontWeight: 600,
              }}
            >
              Research Blogs ↓
            </a>
          </div>
          <span className="portfolio-count">
            {filteredPublications.length}{' '}
            {filteredPublications.length === 1 ? 'publication' : 'publications'}
          </span>
        </div>
      </section>

      {/* PEER-REVIEWED PUBLICATIONS LIST (STUDIO UNLMTD SIGNL / EDITORIAL ARCHIVE STYLE) */}
      <section className="section" style={{ paddingTop: '10px' }}>
        <ol className="signl-signals" style={{ padding: 0 }}>
          {filteredPublications.map((pub, idx) => (
            <li key={pub.id} className="signl-signal reveal is-visible">
              <div className="signl-rank">{String(idx + 1).padStart(2, '0')}</div>
              <div className="signl-body">
                <ul className="signl-themes">
                  <li style={{ '--theme': '#219cf5' } as React.CSSProperties}>{pub.year}</li>
                  <li style={{ '--theme': '#7157f5' } as React.CSSProperties}>
                    {pub.type || 'Peer-Reviewed'}
                  </li>
                </ul>
                <h2>{pub.title}</h2>
                <div className="signl-retain">
                  <p>
                    <strong>Authors:</strong> {pub.authors}
                  </p>
                </div>
                <div className="signl-facts">
                  <p>
                    <strong>Venue / Journal:</strong> {pub.venue} ({pub.year})
                  </p>
                </div>
                {pub.link && (
                  <a
                    className="signl-source"
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Read Paper / DOI</span>
                    <span className="arrow-ne" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                )}
              </div>
              <div className="signl-thumb" style={{ alignSelf: 'start' }}>
                <div
                  style={{
                    padding: '18px',
                    border: '1px solid var(--line)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <div style={{ opacity: 0.55, marginBottom: '6px' }}>INDEXED VENUE</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.35 }}>
                    {pub.venue}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* RESEARCH BLOGS & TECHNICAL DISPATCHES (#blogs) */}
      <section id="blogs" className="section studio-dark">
        <div className="section-label reveal is-visible">
          <span>TECHNICAL DISPATCHES &amp; BLOGS</span>
          <span>ENGINEERING NOTES FROM THE LAB</span>
        </div>
        <div className="editorial-pair" style={{ marginTop: '45px', marginBottom: '45px' }}>
          <h2 className="reveal is-visible">
            Inside our
            <br />
            <span className="gradient liquid-word">
              engineering<span className="dot">.</span>
            </span>
          </h2>
          <div className="reveal is-visible">
            <p>
              Deep-dive technical notes on low-resource Urdu tokenization, TensorRT quantization on
              Jetson Orin, and explainable retinal OCT segmentation written by our research fellows.
            </p>
          </div>
        </div>

        <div className="capabilities-list">
          {blogs.map((blog, idx) => (
            <details key={blog.code} className="reveal is-visible" open={idx === 0}>
              <summary>
                <span>{String(idx + 1).padStart(2, '0')}</span>
                <h3>{blog.title}</h3>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="is-rich">
                <p>
                  <strong>
                    {blog.category} · {blog.date}
                  </strong>{' '}
                  — {blog.summary}
                </p>
                <p>
                  <strong>Author:</strong> {blog.author} ({blog.readTime}) ·{' '}
                  <Link className="text-link" to="/projects" style={{ padding: 0 }}>
                    View related project
                  </Link>
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
