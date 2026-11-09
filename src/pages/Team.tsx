import { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { getTeamMembers, getAlumniMembers } from '../data/airlabData';
import { getMemberAvatar } from '../lib/placeholders';
import type { TeamMemberData } from '../types/data';

export default function Team() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [allMembers, setAllMembers] = useState<TeamMemberData[]>(() => getTeamMembers());
  const [previousInterns, setPreviousInterns] = useState<any[]>(() => getAlumniMembers());

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/content/team').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('/api/content/previous-interns').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([teamData, prevData]) => {
      if (!active) return;
      if (Array.isArray(teamData) && teamData.length > 0) {
        setAllMembers(teamData);
      }
      if (Array.isArray(prevData) && prevData.length > 0) {
        setPreviousInterns(prevData);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const faculty = allMembers.filter((m) => m.category === 'Faculty' || (m.role && m.role.toLowerCase().includes('fac')) || (m.role && m.role.toLowerCase().includes('prof')));
  const interns = allMembers.filter((m) => m.category !== 'Faculty' && m.category !== 'Alumni');

  const setTab = (tab: string) => {
    if (tab === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <>
      {/* STUDIO UNLMTD TEAM MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>THE TEAM</span>
          <span>FACULTY, FELLOWS &amp; ALUMNI</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            THE PEOPLE
            <br />
            <span className="gradient liquid-word">
              BEHIND IT<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Principal Investigators, Faculty Supervisors, Active Research Fellows, and Alumni
            engineering sovereign AI systems at NED University.
          </p>
        </div>
      </section>

      {/* STUDIO UNLMTD FILTER TOOLS */}
      <section className="section portfolio-index" style={{ paddingBottom: '20px' }}>
        <div className="portfolio-tools">
          <div className="portfolio-filters" role="group" aria-label="Filter team by cohort">
            <button
              type="button"
              aria-pressed={activeTab === 'all'}
              onClick={() => setTab('all')}
            >
              All ({faculty.length + interns.length + previousInterns.length})
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'faculty'}
              onClick={() => setTab('faculty')}
            >
              Faculty &amp; PIs ({faculty.length})
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'interns'}
              onClick={() => setTab('interns')}
            >
              Active Fellows ({interns.length})
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'previous'}
              onClick={() => setTab('previous')}
            >
              Alumni ({previousInterns.length})
            </button>
          </div>
          <span className="portfolio-count">
            NED University · Department of CSIT
          </span>
        </div>
      </section>

      {/* FACULTY & PRINCIPAL INVESTIGATORS (STUDIO UNLMTD .founder SECTIONS) */}
      {(activeTab === 'all' || activeTab === 'faculty') &&
        faculty.map((member, idx) => {
          const isDark = idx % 2 === 1;
          return (
            <section
              key={member.id}
              className={`section founder ${isDark ? 'studio-dark' : ''}`}
            >
              <div className="section-label reveal is-visible">
                <span>{member.designation || member.role}</span>
                <span>{member.department || 'NED UNIVERSITY · CSIT'}</span>
              </div>
              <div className="founder-grid">
                <figure className="founder-portrait reveal is-visible">
                  <img
                    src={getMemberAvatar(member.image)}
                    alt={`${member.name}, ${member.role}`}
                    width="900"
                    height="1125"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                  />
                </figure>
                <div className="founder-copy">
                  <h2 className="founder-name reveal is-visible">{member.name}.</h2>
                  <p className="founder-line reveal is-visible">
                    {member.researchFocus || member.role}
                  </p>
                  <p className="founder-body reveal is-visible">
                    Supervising foundational and applied research at NED University’s Artificial
                    Intelligence &amp; Robotics Lab across{' '}
                    {member.researchFocus || 'machine learning and computer vision'}.
                  </p>
                  <dl className="founder-meta reveal is-visible">
                    <div>
                      <dt>DESIGNATION</dt>
                      <dd>{member.designation || member.role}</dd>
                    </div>
                    <div>
                      <dt>CONTACT &amp; LINKS</dt>
                      <dd>
                        {member.email ? (
                          <a href={`mailto:${member.email}`}>{member.email}</a>
                        ) : (
                          <span>Department of CSIT</span>
                        )}
                        {member.linkedin && (
                          <>
                            {' · '}
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              LinkedIn
                            </a>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          );
        })}

      {/* ACTIVE RESEARCH FELLOWS & INTERNS */}
      {(activeTab === 'all' || activeTab === 'interns') && (
        <section className="section founders-pause">
          <div className="section-label reveal is-visible">
            <span>ACTIVE COHORT</span>
            <span>{interns.length} RESEARCH FELLOWS &amp; INTERNS</span>
          </div>
          <div className="founders-intro">
            <h2 className="display reveal is-visible">
              RESEARCH
              <br />
              FELLOWS.
            </h2>
            <p className="reveal is-visible">
              Undergraduate &amp; postgraduate scholars
              <br />
              training models, curating datasets,
              <br />
              and deploying edge AI.
            </p>
          </div>

          <div
            className="founders-portraits"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '45px 30px',
            }}
          >
            {interns.map((fellow) => (
              <figure key={fellow.id} className="founders-portrait reveal is-visible">
                <img
                  src={getMemberAvatar(fellow.image)}
                  alt={`${fellow.name}, ${fellow.role}`}
                  width="600"
                  height="600"
                  loading="lazy"
                />
                <figcaption>
                  <strong>{fellow.name}</strong>
                  <span>
                    <span>{fellow.designation || fellow.role}</span>
                    {fellow.researchFocus && <span>{fellow.researchFocus}</span>}
                    {fellow.linkedin && (
                      <span>
                        <a
                          href={fellow.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link"
                          style={{ padding: 0, fontSize: '12px' }}
                        >
                          LinkedIn Profile
                        </a>
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="founders-note reveal is-visible">
            <p>
              Interested in joining the active cohort of research fellows at NED University AIR
              Lab?
            </p>
            <button type="button" className="text-link" onClick={openApplicationModal}>
              Apply for Fellowship
            </button>
          </div>
        </section>
      )}

      {/* ALUMNI / PREVIOUS INTERNS */}
      {(activeTab === 'all' || activeTab === 'previous') && previousInterns.length > 0 && (
        <section className="section studio-dark">
          <div className="section-label reveal is-visible">
            <span>ALUMNI ARCHIVE</span>
            <span>{previousInterns.length} GRADUATED FELLOWS</span>
          </div>
          <div className="editorial-pair" style={{ marginTop: '45px', marginBottom: '45px' }}>
            <h2 className="reveal is-visible">
              Graduated
              <br />
              <span className="gradient liquid-word">
                scholars<span className="dot">.</span>
              </span>
            </h2>
            <div className="reveal is-visible">
              <p>
                Former AIR Lab research fellows who contributed to our foundational datasets,
                clinical AI pipelines, and national grants before advancing to global graduate
                programs and industry R&amp;D roles.
              </p>
            </div>
          </div>

          <div
            className="founders-portraits"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '40px 28px',
            }}
          >
            {previousInterns.map((alum) => (
              <figure key={alum.id} className="founders-portrait reveal is-visible">
                <img
                  src={getMemberAvatar(alum.image)}
                  alt={alum.name}
                  width="500"
                  height="500"
                  loading="lazy"
                />
                <figcaption>
                  <strong style={{ color: '#fff' }}>{alum.name}</strong>
                  <span style={{ color: '#b9bbbe' }}>
                    <span>{alum.designation || alum.role}</span>
                    {alum.researchFocus && <span>{alum.researchFocus}</span>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
