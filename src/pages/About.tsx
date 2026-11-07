import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import {
  getLabFacilities,
  getTeamMembers,
  getProjects,
  getGrants,
  getPublications,
} from '../data/airlabData';
import { getMemberAvatar } from '../lib/placeholders';

const LAB_PROCESS = [
  {
    num: '01',
    ai: '15%',
    title: 'Define',
    who: 'Principal Investigators',
    body: 'Frame the clinical, linguistic, or robotic constraint. Establish ethical governance and sovereign dataset protocols.',
  },
  {
    num: '02',
    ai: '45%',
    title: 'Curate',
    who: 'Fellows + Data Pipelines',
    body: 'Collect, clean, and annotate regional Urdu/Sindhi corpora, medical radiographs, and multi-sensor robotics telemetry.',
  },
  {
    num: '03',
    ai: '85%',
    title: 'Train',
    who: 'GPU Cluster + Researchers',
    body: 'Explore transformer, diffusion, and vision architectures in parallel across our multi-node CUDA compute cluster.',
  },
  {
    num: '04',
    ai: '75%',
    title: 'Compress',
    who: 'Edge AI Engineers',
    body: 'Apply quantization-aware training, pruning, and TensorRT/FPGA compilation for sub-5W embedded inference.',
  },
  {
    num: '05',
    ai: '55%',
    title: 'Validate',
    who: 'Clinical & Field Partners',
    body: 'Stress-test models in hospital radiology workflows, agricultural field plots, and GPS-denied UAV trials.',
  },
  {
    num: '06',
    ai: '25%',
    title: 'Publish',
    who: 'Faculty & Scholars',
    body: 'Release peer-reviewed IEEE/Springer papers, open-weight checkpoints, and reproducible benchmarks.',
  },
];

export default function About() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const facilities = getLabFacilities();
  const team = getTeamMembers();
  const projects = getProjects();
  const grants = getGrants();
  const publications = getPublications();

  const faculty = team.filter((m) => m.category === 'Faculty');
  const leads = faculty.slice(0, 2);

  return (
    <>
      {/* 1. STUDIO UNLMTD PAGE TOP */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>THE LAB</span>
          <span>NED UNIVERSITY · DEPARTMENT OF CSIT</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            THE MINDS.
            <br />
            <span className="gradient liquid-word">
              UNLMTD<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Artificial Intelligence &amp; Robotics Lab (AIR Lab) is NED University’s premier center
            for sovereign machine learning, clinical vision, and autonomous systems.
          </p>
        </div>
      </section>

      {/* 2. STUDIO UNLMTD WHY SECTION */}
      <section className="section studio-why">
        <div className="section-label reveal is-visible">
          <span>WHY WE BUILT AIR LAB</span>
        </div>
        <h2 className="story-heading reveal is-visible">
          Academic depth.
          <br />
          One shared
          <br />
          <span className="gradient liquid-word">
            conviction<span className="dot">.</span>
          </span>
        </h2>
        <div className="studio-why-copy intro-paragraphs">
          <p className="lead reveal is-visible">
            In traditional academia, papers stop at simulation. In commercial software shops, speed
            replaces mathematical rigor.
          </p>
          <p className="reveal is-visible">
            We founded AIR Lab at the Department of Computer Science &amp; Information Technology
            (CSIT), NED University of Engineering &amp; Technology, to bridge both worlds: PhD-led
            theoretical research paired with relentless hardware and software engineering.
          </p>
        </div>
        <div className="convictions">
          <article className="reveal is-visible">
            <span className="section-label">01</span>
            <h3>Sovereign datasets &amp; regional AI.</h3>
            <p>
              Global foundation models underperform on South Asian languages, local clinical
              demographics, and regional crops. We build datasets and models from the ground up for
              Pakistan.
            </p>
          </article>
          <article className="reveal is-visible">
            <span className="section-label">02</span>
            <h3>Hardware-in-the-loop validation.</h3>
            <p>
              Every algorithm we design is benchmarked on real silicon—from NVIDIA RTX GPU clusters
              down to Jetson Orin Nano, ARM Cortex-M, and FPGA edge accelerators.
            </p>
          </article>
          <article className="reveal is-visible">
            <span className="section-label">03</span>
            <h3>Mentoring the next generation.</h3>
            <p>
              Our undergraduate and postgraduate research fellows co-author international papers and
              lead national HEC &amp; IGNITE grant deliverables before they graduate.
            </p>
          </article>
        </div>
      </section>

      {/* 3. STUDIO UNLMTD PROCESS SECTION (WITH --ai BARS) */}
      <section className="section studio-what studio-dark">
        <div className="section-label reveal is-visible">
          <span>HOW WE WORK</span>
          <span>HUMAN DIRECTION. AI ACCELERATION.</span>
        </div>
        <div className="editorial-pair">
          <h2 className="reveal is-visible">
            Faculty direct.
            <br />
            <span className="gradient liquid-word">
              Compute accelerates<span className="dot">.</span>
            </span>
          </h2>
          <div className="reveal is-visible">
            <p>
              We never train models blindly. Principal Investigators set the mathematical hypotheses
              and evaluation criteria; high-throughput GPU pipelines accelerate architecture search,
              fine-tuning, and edge quantization.
            </p>
            <p>
              You work directly with the investigators and fellows who write the code and validate
              the hardware.
            </p>
          </div>
        </div>

        <ol
          className="process is-visible"
          style={{ '--steps': 6 } as React.CSSProperties}
        >
          {LAB_PROCESS.map((step, idx) => (
            <li
              key={step.num}
              className="process-step reveal is-visible"
              style={
                {
                  '--ai': step.ai,
                  '--i': idx,
                } as React.CSSProperties
              }
            >
              <span className="process-num">{step.num}</span>
              <span className="process-bar" aria-hidden="true">
                <i></i>
              </span>
              <h3>{step.title}</h3>
              <p className="process-who">{step.who}</p>
              <p className="process-body">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="process-legend reveal is-visible" aria-hidden="true">
          <span>Human scientific direction</span>
          <span>GPU &amp; AI acceleration</span>
        </div>
      </section>

      {/* 4. STUDIO UNLMTD YEARS / SCALE SECTION */}
      <section className="section studio-who">
        <div className="section-label reveal is-visible">
          <span>RESEARCH SCALE &amp; INFRASTRUCTURE</span>
        </div>
        <div className="years">
          <span className="years-number gradient liquid-word reveal is-visible">
            {projects.length + grants.length}+
          </span>
          <h2 className="years-title reveal is-visible">
            deployed AI systems
            <br />
            &amp; national grants
            <br />
            engineered at NED.
          </h2>
        </div>
        <p className="years-note reveal is-visible">
          Backed by {publications.length}+ peer-reviewed publications, {faculty.length} faculty
          investigators, and dedicated deep learning and robotics laboratories in Karachi.
        </p>
      </section>

      {/* 5. PRINCIPAL INVESTIGATORS / FOUNDER SECTIONS */}
      {leads.map((lead, idx) => {
        const isDark = idx % 2 === 1;
        return (
          <section
            key={lead.id}
            className={`section founder ${isDark ? 'studio-dark' : ''}`}
          >
            <div className="section-label reveal is-visible">
              <span>{lead.designation || lead.role}</span>
              <span>{lead.department}</span>
            </div>
            <div className="founder-grid">
              <figure className="founder-portrait reveal is-visible">
                <img
                  src={getMemberAvatar(lead.image)}
                  alt={`${lead.name}, ${lead.role}`}
                  width="900"
                  height="1125"
                  loading="lazy"
                />
              </figure>
              <div className="founder-copy">
                <h3 className="founder-name reveal is-visible">{lead.name}.</h3>
                <p className="founder-line reveal is-visible">
                  {lead.researchFocus ||
                    'Directing foundational AI research, clinical computer vision, and sovereign ML systems at NED University.'}
                </p>
                <p className="founder-body reveal is-visible">
                  Leading interdisciplinary research teams across computer vision, natural language
                  processing, and embedded edge intelligence, bridging academic breakthroughs with
                  national industrial and healthcare deployment.
                </p>
                <dl className="founder-meta reveal is-visible">
                  <div>
                    <dt>FOCUS AREAS</dt>
                    <dd>{lead.researchFocus || 'Deep Learning · Computer Vision · NLP'}</dd>
                  </div>
                  <div>
                    <dt>CONNECT &amp; DIRECTORY</dt>
                    <dd>
                      <Link to="/team">Full Faculty Profile</Link>
                      {lead.email && (
                        <>
                          {' · '}
                          <a href={`mailto:${lead.email}`}>{lead.email}</a>
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

      {/* 6. LABORATORY COMPUTE & HARDWARE INFRASTRUCTURE */}
      <section className="section studio-work-with">
        <div className="section-label reveal is-visible">
          <span>LABORATORY INFRASTRUCTURE</span>
          <span>COMPUTE &amp; ROBOTICS TESTBEDS</span>
        </div>
        <div className="editorial-pair">
          <h2 className="reveal is-visible">
            Built for
            <br />
            <span className="gradient liquid-word">
              real silicon<span className="dot">.</span>
            </span>
          </h2>
          <div className="reveal is-visible">
            <p>
              Our laboratory at the Department of CSIT houses multi-GPU training servers, embedded
              Jetson robotics rigs, FPGA acceleration boards, and clinical imaging workstations.
            </p>
          </div>
        </div>

        <div className="editorial-three">
          {facilities.map((fac, idx) => (
            <article key={fac.code} className="reveal is-visible">
              <span>
                {String(idx + 1).padStart(2, '0')} · {fac.metrics}
              </span>
              <h3>{fac.unit}</h3>
              <p>
                <strong>{fac.spec}:</strong> {fac.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="sectors reveal is-visible" aria-label="Research Domains">
          <span>Computer Vision</span>
          <span>Medical Diagnostics</span>
          <span>Urdu &amp; Regional LLMs</span>
          <span>Autonomous UAVs</span>
          <span>TinyML &amp; FPGA</span>
          <span>Smart Agriculture</span>
          <span>Industrial Inspection</span>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginTop: '45px' }}>
          <Link className="text-link" to="/team">
            Explore full team directory ({team.length})
          </Link>
          <Link className="text-link" to="/gallery">
            Explore laboratory visual archive
          </Link>
          <button type="button" className="text-link" onClick={openApplicationModal}>
            Apply for research fellowship
          </button>
        </div>
      </section>
    </>
  );
}
