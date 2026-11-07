import { Link, useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { getTeamMembers, getPreviousInterns } from '../data/airlabData';
import { getMemberAvatar } from '../lib/placeholders';

export default function Interns() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const allMembers = getTeamMembers();
  const activeInterns = allMembers.filter((m) => m.category !== 'Faculty');
  const alumni = getPreviousInterns();

  return (
    <>
      {/* STUDIO UNLMTD FELLOWSHIPS MASTHEAD */}
      <section className="section page-top">
        <div className="section-label reveal is-visible">
          <span>FELLOWSHIPS &amp; INTERNSHIPS</span>
          <span>ADMISSIONS OPEN · NED UNIVERSITY CSIT</span>
        </div>
        <div className="headline inner-heading">
          <h1 className="reveal is-visible">
            RESEARCH
            <br />
            <span className="gradient liquid-word">
              FELLOWS<span className="dot">.</span>
            </span>
          </h1>
        </div>
        <div className="intro-row">
          <p className="reveal is-visible">
            Join NED University’s flagship AI research cohort. Train foundation models, build
            clinical vision systems, and co-author international publications.
          </p>
          <button type="button" className="text-link" onClick={openApplicationModal}>
            Apply for Fellowship Now
          </button>
        </div>
      </section>

      {/* FELLOWSHIP TRACKS (STUDIO UNLMTD .changes-grid) */}
      <section className="section changes studio-dark">
        <div className="section-label reveal is-visible">
          <span>THREE FELLOWSHIP TRACKS</span>
          <span>UNDERGRADUATE &amp; POSTGRADUATE</span>
        </div>
        <div className="changes-grid">
          <article className="reveal is-visible">
            <h2 className="gradient liquid-word">VISION.</h2>
            <p>
              Medical diagnostic imaging (retinal OCT, chest X-rays), precision agriculture
              multispectral analysis, and high-speed industrial defect detection.
            </p>
            <ul>
              <li>PyTorch &amp; Vision Transformers</li>
              <li>Clinical Dataset Curation</li>
              <li>Explainable Grad-CAM Pipelines</li>
            </ul>
          </article>
          <article className="reveal is-visible">
            <h2 className="gradient liquid-word">LANGUAGE.</h2>
            <p>
              Sovereign Urdu and regional South Asian large language models, custom byte-level
              tokenizers, LoRA fine-tuning, and retrieval-augmented generation.
            </p>
            <ul>
              <li>Multilingual Tokenization</li>
              <li>Distributed GPU Pretraining</li>
              <li>Speech &amp; Dialect Benchmarks</li>
            </ul>
          </article>
          <article className="reveal is-visible">
            <h2 className="gradient liquid-word">ROBOTICS.</h2>
            <p>
              GPS-denied visual-inertial odometry, ROS2 autonomous UAV swarms, and sub-5W neural
              inference on NVIDIA Jetson, ARM Cortex-M, and FPGA silicon.
            </p>
            <ul>
              <li>ROS2 &amp; Real-Time SLAM</li>
              <li>TensorRT &amp; INT8 Quantization</li>
              <li>Hardware-in-the-Loop Trials</li>
            </ul>
          </article>
        </div>
        <button type="button" className="text-link reveal is-visible" onClick={openApplicationModal}>
          Submit your fellowship application
        </button>
      </section>

      {/* ACTIVE RESEARCH INTERNS DIRECTORY */}
      <section className="section founders-pause">
        <div className="section-label reveal is-visible">
          <span>CURRENT COHORT</span>
          <span>{activeInterns.length} ACTIVE FELLOWS</span>
        </div>
        <div className="founders-intro">
          <h2 className="display reveal is-visible">
            ACTIVE
            <br />
            SCHOLARS.
          </h2>
          <p className="reveal is-visible">
            Working side by side with Principal Investigators
            <br />
            on funded national grants.
          </p>
        </div>

        <div
          className="founders-portraits"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '40px 28px',
          }}
        >
          {activeInterns.map((intern) => (
            <figure key={intern.id} className="founders-portrait reveal is-visible">
              <img
                src={getMemberAvatar(intern.image)}
                alt={intern.name}
                width="600"
                height="600"
                loading="lazy"
              />
              <figcaption>
                <strong>{intern.name}</strong>
                <span>
                  <span>{intern.designation || intern.role}</span>
                  {intern.researchFocus && <span>{intern.researchFocus}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="founders-note reveal is-visible">
          <p>
            Looking for our {alumni.length} graduated fellows and alumni? Explore the full
            laboratory directory.
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link className="text-link" to="/team?tab=previous">
              View Alumni Cohort ({alumni.length})
            </Link>
            <button type="button" className="text-link" onClick={openApplicationModal}>
              Apply for Next Intake
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
