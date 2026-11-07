import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { getPerformers } from '../data/airlabData';
import { getMemberAvatar } from '../lib/placeholders';

export default function Performers() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const performers = getPerformers();

  return (
    <>
      {/* STUDIO UNLMTD PERFORMERS MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>MONTHLY HONORS</span>
          <span>NED AIR LAB EVALUATION COMMITTEE</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            TOP
            <br />
            <span className="gradient liquid-word">
              PERFORMERS<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Recognizing AIR Lab Research Fellows for breakthrough model benchmarks, dataset
            engineering, and peer-reviewed publications.
          </p>
        </div>
      </section>

      {/* ALTERNATING FOUNDER-STYLE SPOTLIGHT SECTIONS */}
      {performers.map((perf, idx) => {
        const isDark = idx % 2 === 1;
        return (
          <section
            key={perf.id}
            className={`section founder ${isDark ? 'studio-dark' : ''}`}
          >
            <div className="section-label reveal is-visible">
              <span>
                {String(idx + 1).padStart(2, '0')} · {perf.month.toUpperCase()}
              </span>
              <span>{perf.role.toUpperCase()}</span>
            </div>
            <div className="founder-grid">
              <figure className="founder-portrait reveal is-visible">
                <img
                  src={getMemberAvatar(perf.image)}
                  alt={perf.name}
                  width="800"
                  height="1000"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                />
              </figure>
              <div className="founder-copy">
                <h2 className="founder-name reveal is-visible">{perf.name}.</h2>
                <p className="founder-line reveal is-visible">
                  {perf.achievement || 'Excellence in Applied AI & Model Benchmarking'}
                </p>
                <p className="founder-body reveal is-visible">
                  {perf.description ||
                    'Honored by the AIR Lab Faculty Evaluation Committee for outstanding technical rigor, reproducible model evaluation, and research engineering leadership.'}
                </p>
                <dl className="founder-meta reveal is-visible">
                  <div>
                    <dt>RESEARCH TRACK</dt>
                    <dd>{perf.project || 'Department of CSIT, NED University'}</dd>
                  </div>
                  <div>
                    <dt>RECOGNITION</dt>
                    <dd>{perf.month}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        );
      })}

      <section className="section quote-band">
        <div className="quote-band-copy">
          <h2 className="quote-band-heading reveal is-visible">
            Ready to set the next
            <br />
            <span className="gradient liquid-word">
              benchmark<span className="dot">?</span>
            </span>
          </h2>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginTop: '36px' }}>
            <button type="button" className="text-link" onClick={openApplicationModal}>
              Apply for Research Fellowship
            </button>
            <Link className="text-link" to="/team">
              View full team directory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
