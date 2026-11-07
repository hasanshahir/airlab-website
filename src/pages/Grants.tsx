import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { getGrants, getSponsors } from '../data/airlabData';

export default function Grants() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const grants = getGrants();
  const sponsors = getSponsors();

  return (
    <>
      {/* STUDIO UNLMTD SERVICES/OUTCOMES MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>GRANTS &amp; FUNDING</span>
          <span>SPONSORED RESEARCH LEDGER</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            NATIONAL
            <br />
            <span className="gradient liquid-word">
              GRANTS<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Competitive national research awards, industry-sponsored benchmarks, and sovereign
            compute funding powering NED University AIR Lab.
          </p>
        </div>
      </section>

      {/* INDEX NAV BAR */}
      <nav className="services-index" aria-label="Grants Index">
        {grants.map((grant, idx) => (
          <a key={grant.id} href={`#grant-${grant.id}`}>
            <span>{String(idx + 1).padStart(2, '0')}</span>
            {grant.funder}
          </a>
        ))}
      </nav>

      {/* ALTERNATING LIGHT / DARK OUTCOME SECTIONS FOR EACH GRANT */}
      {grants.map((grant, idx) => {
        const isDark = idx % 2 === 1;
        const num = String(idx + 1).padStart(2, '0');
        return (
          <section
            key={grant.id}
            id={`grant-${grant.id}`}
            className={`section service outcome ${isDark ? 'studio-dark' : ''}`}
          >
            <div className="section-label reveal is-visible">
              <span>
                {num} / {grant.status.toUpperCase()} GRANT
              </span>
              <span>{grant.duration}</span>
            </div>
            <h2 className="outcome-title display reveal is-visible">{grant.funder}.</h2>
            <div className="outcome-grid">
              <div className="outcome-text">
                <p className="outcome-key reveal is-visible">{grant.title}</p>
                <p className="service-body reveal is-visible">{grant.description}</p>
                {grant.programTitle && (
                  <p className="service-body reveal is-visible">
                    <strong>Program:</strong> {grant.programTitle}
                  </p>
                )}
              </div>
              <div className="outcome-side">
                <div className="outcome-show reveal is-visible">
                  <span className="section-label">GRANT ALLOCATION &amp; LEADERSHIP</span>
                  <p>{grant.amount || 'Sponsored National Grant'}</p>
                  <p className="outcome-case">
                    <Link className="text-link" to="/projects">
                      Principal Investigator: {grant.leadInvestigator || 'AIR Lab Directorate'}
                    </Link>
                  </p>
                </div>
                <div className="outcome-deliver reveal is-visible">
                  <span className="section-label">DELIVERABLES &amp; SCOPE</span>
                  <div className="outcome-offer">
                    <h3>Datasets &amp; Model Weights</h3>
                    <p>
                      Curated regional datasets, benchmark evaluations, and reproducible training
                      pipelines.
                    </p>
                  </div>
                  <div className="outcome-offer">
                    <h3>Field Deployment &amp; Publications</h3>
                    <p>
                      Hardware-in-the-loop validation and peer-reviewed publications at
                      international AI venues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* PAIR CARDS — SPONSORS & FELLOWSHIP FUNDING */}
      <section className="section editorial-section pair-section">
        <div className="section-label reveal is-visible">
          <span>PARTNERSHIP MODEL</span>
          <span>INSTITUTIONAL &amp; INDUSTRIAL ALLIANCES</span>
        </div>
        <div className="editorial-pair">
          <h2 className="reveal is-visible">
            Two ways to
            <br />
            <span className="gradient liquid-word">
              partner<span className="dot">.</span>
            </span>
          </h2>
          <div className="reveal is-visible">
            <p>
              We collaborate with national funding agencies, hospitals, agricultural institutes, and
              technology enterprises across {sponsors.length}+ active sponsorship programs.
            </p>
            <p>
              Every grant directly funds graduate and undergraduate research fellowships, GPU
              compute infrastructure, and open-source regional benchmarks.
            </p>
          </div>
        </div>
        <div className="pair-cards">
          <article className="pair-card reveal is-visible">
            <span className="pair-card-eyebrow">FOR INSTITUTIONS &amp; INDUSTRY</span>
            <h3>
              <span className="gradient liquid-word">SPONSOR A RESEARCH TRACK.</span>
            </h3>
            <div className="pair-card-body">
              <p>
                Commission custom computer vision, Urdu LLM, or embedded edge AI research supervised
                by NED University Principal Investigators.
              </p>
              <p>
                Includes dedicated research fellows, milestone deliverables, and IP/deployment
                handover.
              </p>
              <div style={{ marginTop: '12px' }}>
                <Link className="text-link" to="/collaborations">
                  View institutional partners
                </Link>
              </div>
            </div>
          </article>
          <article className="pair-card reveal is-visible">
            <span className="pair-card-eyebrow">FOR SCHOLARS &amp; ENGINEERS</span>
            <h3>
              <span className="gradient liquid-word">FUNDED FELLOWSHIPS.</span>
            </h3>
            <div className="pair-card-body">
              <p>
                Work directly on HEC and IGNITE funded research grants with full access to our GPU
                compute cluster and robotics testbeds.
              </p>
              <p>
                Author peer-reviewed publications and graduate with deployed production systems in
                your portfolio.
              </p>
              <div style={{ marginTop: '12px' }}>
                <button type="button" className="text-link" onClick={openApplicationModal}>
                  Apply for a funded fellowship
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
