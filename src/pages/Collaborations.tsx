import { Link } from 'react-router-dom';
import { getCollaborations, getGrants } from '../data/airlabData';

export default function Collaborations() {
  const collaborations = getCollaborations();
  const grants = getGrants();

  return (
    <>
      {/* STUDIO UNLMTD COLLABORATIONS MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>PARTNERS &amp; SPONSORS</span>
          <span>INSTITUTIONAL &amp; INDUSTRIAL R&amp;D</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            ALLIANCES &amp;
            <br />
            <span className="gradient liquid-word">
              PARTNERS<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            National funding bodies, clinical teaching hospitals, agricultural consortia, and
            technology enterprises partnering with NED University AIR Lab.
          </p>
        </div>
      </section>

      {/* COLLABORATIONS OUTCOME SECTIONS */}
      {collaborations.map((collab, idx) => {
        const isDark = idx % 2 === 1;
        return (
          <section
            key={collab.id}
            className={`section service outcome ${isDark ? 'studio-dark' : ''}`}
          >
            <div className="section-label reveal is-visible">
              <span>
                {String(idx + 1).padStart(2, '0')} / {collab.type.toUpperCase()}
              </span>
              <span>{collab.location || 'PAKISTAN · R&D ALLIANCE'}</span>
            </div>
            <h2 className="outcome-title display reveal is-visible">{collab.name}.</h2>
            <div className="outcome-grid">
              <div className="outcome-text">
                <p className="outcome-key reveal is-visible">
                  Strategic AI research, dataset engineering, and field deployment partnership.
                </p>
                <p className="service-body reveal is-visible">{collab.description}</p>
              </div>
              <div className="outcome-side">
                <div className="outcome-show reveal is-visible">
                  <span className="section-label">PARTNERSHIP TIER</span>
                  <p>{collab.type}</p>
                  {collab.website && (
                    <p className="outcome-case">
                      <a
                        className="text-link"
                        href={collab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit partner website
                      </a>
                    </p>
                  )}
                </div>
                <div className="outcome-deliver reveal is-visible">
                  <span className="section-label">JOINT COLLABORATION SCOPE</span>
                  <div className="outcome-offer">
                    <h3>Sponsored Benchmarks &amp; Datasets</h3>
                    <p>
                      Co-developing domain-specific evaluation datasets and edge-ready machine
                      learning models.
                    </p>
                  </div>
                  <div className="outcome-offer">
                    <h3>Fellowship &amp; Hardware Support</h3>
                    <p>
                      Supporting graduate and undergraduate research fellows with dedicated compute
                      and field testing access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="section quote-band">
        <div className="quote-band-copy">
          <h2 className="quote-band-heading reveal is-visible">
            Commission a joint
            <br />
            <span className="gradient liquid-word">
              research track<span className="dot">.</span>
            </span>
          </h2>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginTop: '36px' }}>
            <Link className="text-link" to="/contact">
              Start an institutional partnership
            </Link>
            <Link className="text-link" to="/grants">
              Explore {grants.length} funded grants
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
