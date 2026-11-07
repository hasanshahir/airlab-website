import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';

const FAQ_ITEMS = [
  {
    num: '01',
    q: 'How can I apply for an AIR Lab Research Fellowship or Internship?',
    a: 'We recruit undergraduate and postgraduate fellows across Computer Vision, Multilingual NLP (Urdu LLMs), and Autonomous Robotics/TinyML. Click "Apply for Research Fellowship" on this page or in the header to submit your academic profile and GitHub/CV directly to our faculty evaluation committee.',
  },
  {
    num: '02',
    q: 'Can industry or healthcare institutions commission joint AI research?',
    a: 'Yes. We partner with teaching hospitals, agricultural bodies, and industrial enterprises across Pakistan and internationally. Joint tracks can be structured as sponsored R&D grants, clinical validation pilots, or co-funded HEC/IGNITE proposals.',
  },
  {
    num: '03',
    q: 'Who leads the research projects day to day?',
    a: 'Every research track is directly supervised by our Principal Investigators and Faculty Leads at the Department of Computer Science & Information Technology (CSIT), NED University, supported by dedicated postgraduate and undergraduate research fellows.',
  },
  {
    num: '04',
    q: 'Do you deploy models onto edge hardware or only cloud GPUs?',
    a: 'Both. While we pretrain and fine-tune models on our high-throughput CUDA GPU cluster, we specialize in quantization-aware training, TensorRT compilation, and embedded deployment on NVIDIA Jetson, ARM Cortex-M, and FPGA hardware.',
  },
  {
    num: '05',
    q: 'Are your datasets and publications open for academic citation?',
    a: 'Yes. Our peer-reviewed papers are published in IEEE, Springer, and international journals, and we actively release sovereign Pakistani benchmarks and model checkpoints for academic and clinical research.',
  },
  {
    num: '06',
    q: 'Where is the laboratory physically located?',
    a: 'We are located inside the Department of Computer Science & Information Technology (CSIT) at NED University of Engineering & Technology, Main University Road, Karachi 75270, Pakistan.',
  },
];

export default function Contact() {
  const { openApplicationModal } = useOutletContext<LayoutOutletContext>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <>
      {/* STUDIO UNLMTD BOOK / CONTACT SECTION */}
      <section className="section book-section">
        <div className="section-label reveal is-visible">
          <span>CONTACT</span>
          <span>PRINCIPAL INVESTIGATORS &amp; LAB DIRECTORATE</span>
        </div>
        <h1 className="book-title reveal is-visible">
          GIVE US A LIMIT<span className="dot">.</span>
        </h1>

        <div className="book-grid">
          <div className="book-copy">
            <p className="contact-lead reveal is-visible">
              Direct access to our Principal Investigators and Research Leads. No intermediaries:
              just your research challenge, institutional partnership, or fellowship inquiry.
            </p>
            <ul className="book-facts reveal is-visible">
              <li>Sponsored R&amp;D, clinical AI validation, or national grant collaboration</li>
              <li>Direct review by NED University CSIT Principal Investigators</li>
              <li>Student Research Fellowship &amp; Internship intake open year-round</li>
            </ul>

            <div className="book-alt reveal is-visible">
              <span className="section-label">FELLOWSHIPS &amp; DIRECT CHANNELS</span>
              <p>
                Applying as a student researcher or prefer to reach our faculty desk directly by
                email?
              </p>
              <p className="book-alt-links">
                <button type="button" className="text-link" onClick={openApplicationModal}>
                  Apply for Research Fellowship
                </button>
                <a className="text-link" href="mailto:airlab@neduet.edu.pk">
                  airlab@neduet.edu.pk
                </a>
              </p>
            </div>

            <aside className="contact-aside reveal is-visible" style={{ marginTop: '45px' }}>
              <span className="section-label">DIRECT EMAIL &amp; CAMPUS LOCATION</span>
              <a className="contact-email" href="mailto:airlab@neduet.edu.pk">
                airlab@neduet.edu.pk
              </a>
              <p>We review every research inquiry and reply within two working days.</p>
              <p className="contact-place">
                Department of CSIT, NED University of Engineering &amp; Technology · University
                Road, Karachi 75270, Pakistan.
              </p>
            </aside>
          </div>

          {/* RIGHT COLUMN: STUDIO UNLMTD #contact-form */}
          <div id="write">
            {!submitted ? (
              <form id="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="field form-row">
                  <div>
                    <label htmlFor="contact-name">
                      <span className="field-label">Your name</span>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Dr. / Engr. / Scholar Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="contact-email">
                      <span className="field-label">Your email</span>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder="you@institution.edu.pk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="contact-message">
                    <span className="field-label">Your project, grant, or limit</span>
                    <span className="field-hint">
                      A research collaboration, clinical dataset, industrial AI challenge, or
                      question: a few lines are enough.
                    </span>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Tell us what you are building or researching..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </label>
                </div>

                <div className="form-bottom">
                  <button className="submit" type="submit">
                    <span>SEND MESSAGE</span>
                    <span className="word-dot" aria-hidden="true"></span>
                  </button>
                  <p>Dispatched directly to the AIR Lab Directorate at NED University.</p>
                </div>
              </form>
            ) : (
              <div className="contact-sent" tabIndex={-1}>
                <h2 className="contact-sent-title">
                  <span className="gradient liquid-word">
                    WELL RECEIVED<span className="word-dot"></span>
                  </span>
                </h2>
                <p className="contact-sent-body">
                  Thank you, {name.split(/\s+/)[0]}. Your message has been logged for our Principal
                  Investigators. We will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                >
                  Write another message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STUDIO UNLMTD FAQ ACCORDION (.contact-questions.studio-dark) */}
      <section className="section contact-questions studio-dark">
        <div className="section-label reveal is-visible">
          <span>BEFORE YOU REACH OUT</span>
          <span>FREQUENT QUESTIONS</span>
        </div>
        <div className="capabilities-list">
          {FAQ_ITEMS.map((item, idx) => (
            <details key={item.num} className="reveal is-visible" open={idx === 0}>
              <summary>
                <span>{item.num}</span>
                <h3>{item.q}</h3>
                <i aria-hidden="true">+</i>
              </summary>
              <div>
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
