import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, GraduationCap, FileText, User, Mail, BookOpen, Phone, Loader2, Briefcase, Upload } from 'lucide-react'
import { useVacancySettings } from '../lib/vacancy'
import airLabMark from '../assets/air-lab-mark.png'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'

interface StudentApplicationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StudentApplicationModal({ isOpen, onClose }: StudentApplicationModalProps) {
  const vacancy = useVacancySettings()
  const isClosed = vacancy.status === 'Closed'
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
    designation: 'Undergraduate Researcher',
    department: 'Computer Science & IT',
    program: 'Undergraduate BS (3rd/4th Year)',
    track: 'Foundational LLMs & Urdu NLP',
    resumeUrl: '',
    statement: '',
  })

  // ── Scroll Lock Background Feature ──
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`
      }

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen])

  // ── Keyboard Escape Listener ──
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('email', formData.email)
      data.append('phone', formData.phone || formData.rollNo)
      data.append('designation', formData.designation)
      data.append('positionTitle', formData.designation)
      data.append('university', 'NED University of Engineering & Technology')
      data.append('degreeYear', `${formData.designation} — ${formData.program} (${formData.department}) - Roll: ${formData.rollNo}`)
      data.append('coverNote', `[Designation: ${formData.designation} | Track: ${formData.track}] ${formData.statement}`)
      data.append('github', formData.resumeUrl)
      data.append('resumeUrl', formData.resumeUrl)
      // Structured fields for clean database storage and admin review
      data.append('rollNo', formData.rollNo)
      data.append('department', formData.department)
      data.append('program', formData.program)
      data.append('track', formData.track)
      data.append('statement', formData.statement)

      if (cvFile) {
        if (cvFile.size > 4 * 1024 * 1024) {
          throw new Error('Resume PDF is too large. Please upload a file smaller than 4MB, or paste your Google Drive / LinkedIn link in the Portfolio field.')
        }
        data.append('cv', cvFile)
      }

      let res: Response | null = null
      try {
        res = await fetch('/api/applications', {
          method: 'POST',
          body: data,
        })
      } catch (fetchErr) {
        console.warn('Relative /api/applications unreachable, falling back to live endpoint...', fetchErr)
        res = await fetch('https://airlab-website-peach.vercel.app/api/applications', {
          method: 'POST',
          body: data,
        })
      }

      if (!res || !res.ok) {
        if (typeof window !== 'undefined' && !window.location.origin.includes('airlab-website-peach.vercel.app')) {
          try {
            const fallbackRes = await fetch('https://airlab-website-peach.vercel.app/api/applications', {
              method: 'POST',
              body: data,
            })
            if (fallbackRes.ok) {
              setSubmitted(true)
              return
            }
          } catch {
            // retain original error
          }
        }
        const text = (await res?.text()) || ''
        let errJson: any
        try {
          errJson = JSON.parse(text)
        } catch {
          // fallback
        }
        throw new Error(errJson?.error || text || `Server error (${res?.status || 500})`)
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setError(null)
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden font-sans"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vacancy-modal-title"
        >
          {/* Backdrop with dark tint and blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container: 100% solid, fully opaque elevated card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white border border-[var(--border-hairline)] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(16,0,43,0.45)] z-10 overflow-hidden font-sans my-auto text-left"
            style={{ backgroundColor: '#ffffff', opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            {submitted ? (
              /* Success Screen */
              <div className="flex flex-col flex-1 overflow-hidden bg-white">
                <div className="p-5 sm:p-6 border-b border-[var(--border-hairline)] bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <img src={airLabMark} alt="AIR Lab" className="w-7 h-7 object-contain shrink-0" />
                      <div>
                        <div className="text-sm font-bold font-head text-[var(--text-primary)] leading-none">AIR Lab</div>
                        <div className="text-[9px] text-[var(--text-subtle)] tracking-[0.12em] uppercase mt-0.5">NED UNIVERSITY · CSIT</div>
                      </div>
                    </div>
                    <span className="h-4 w-px bg-[var(--border-hairline-dark)]" aria-hidden="true" />
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Application Received</span>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center overscroll-contain bg-white">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="w-14 h-14 rounded-2xl bg-[var(--accent-orange)] text-white mx-auto flex items-center justify-center mb-5 shadow-md"
                  >
                    <Check className="w-7 h-7" />
                  </motion.div>
                  <h3 id="vacancy-modal-title" className="text-2xl font-bold font-head text-[var(--text-primary)] mb-2.5">
                    Application Submitted!
                  </h3>
                  <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for applying to the Artificial Intelligence Research Lab at NED University. Your application has been stored in the database. Dr. Murk Marvi and the faculty review committee will review your record and contact you at <strong className="text-[var(--text-primary)]">{formData.email}</strong>.
                  </p>
                  <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-muted)] text-left mb-6 max-w-md mx-auto space-y-2">
                    <div><strong className="text-[var(--text-primary)]">Applicant:</strong> {formData.name} ({formData.rollNo})</div>
                    <div><strong className="text-[var(--text-primary)]">Position:</strong> {formData.designation}</div>
                    <div><strong className="text-[var(--text-primary)]">Department:</strong> {formData.department}</div>
                    <div><strong className="text-[var(--text-primary)]">Research Track:</strong> {formData.track}</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-[var(--border-hairline)] bg-[var(--bg-backdrop)] flex justify-end shrink-0">
                  <InteractiveHoverButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleReset}
                    text="Done"
                    className="h-11 text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
                {/* ── 1. Fixed Header with AIR Lab Logo ── */}
                <div className="p-5 sm:px-8 sm:py-5 border-b border-[var(--border-hairline)] bg-white flex items-center justify-between gap-4 shrink-0">
                  <div className="min-w-0 pr-2 flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <img src={airLabMark} alt="AIR Lab" className="w-7 h-7 object-contain shrink-0" />
                      <div>
                        <div className="text-sm font-bold font-head text-[var(--text-primary)] leading-none">AIR Lab</div>
                        <div className="text-[9px] text-[var(--text-subtle)] tracking-[0.12em] uppercase mt-0.5">NED UNIVERSITY · CSIT</div>
                      </div>
                    </div>
                    <span className="h-4 w-px bg-[var(--border-hairline-dark)]" aria-hidden="true" />
                    <h2 id="vacancy-modal-title" className="text-lg sm:text-xl font-bold tracking-tight font-head text-[var(--text-primary)]">
                      Application Form
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)] transition-colors cursor-pointer shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── 2. Scrollable Body (100% solid white background, high-contrast inputs) ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 overscroll-contain space-y-4 bg-white">
                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  {isClosed && (
                    <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-muted)] leading-relaxed">
                      {vacancy.closedMessage}
                    </div>
                  )}

                  <fieldset disabled={isClosed} className={`space-y-4 ${isClosed ? 'opacity-50' : ''}`}>
                    {/* Position / Designation Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                        Position / Designation Applied For *
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none" />
                        <select
                          value={formData.designation}
                          onChange={e => setFormData({ ...formData, designation: e.target.value })}
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans cursor-pointer font-medium outline-none"
                        >
                          <option value="Undergraduate Researcher">Undergraduate Researcher</option>
                          <option value="Graduate Research Assistant (MS / PhD)">Graduate Research Assistant (MS / PhD)</option>
                          <option value="NLP & Large Language Models Researcher">NLP &amp; Large Language Models Researcher</option>
                          <option value="Computer Vision & Edge AI Researcher">Computer Vision &amp; Edge AI Researcher</option>
                          <option value="Autonomous Robotics & SLAM Engineer">Autonomous Robotics &amp; SLAM Engineer</option>
                          <option value="Software Development & AI Systems Engineer">Software Development &amp; AI Systems Engineer</option>
                          <option value="Clinical AI & Healthcare Data Researcher">Clinical AI &amp; Healthcare Data Researcher</option>
                          <option value="Visiting Researcher">Visiting Researcher</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Muhammad Ali"
                            className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                          />
                        </div>
                      </div>

                      {/* Student Email */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="yourname@cloud.neduet.edu.pk"
                            className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* Roll Number */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Roll / Reg Number *
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                          <input
                            type="text"
                            required
                            value={formData.rollNo}
                            onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                            placeholder="e.g. CS-2022045"
                            className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                          <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. 03001234567"
                            className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Program / Level & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Academic Program
                        </label>
                        <select
                          value={formData.program}
                          onChange={e => setFormData({ ...formData, program: e.target.value })}
                          className="w-full px-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans cursor-pointer outline-none"
                        >
                          <option value="Undergraduate BS (3rd/4th Year)">Undergraduate BS (3rd / 4th Year)</option>
                          <option value="Undergraduate BS (1st/2nd Year)">Undergraduate BS (1st / 2nd Year)</option>
                          <option value="Postgraduate MS Candidate">Postgraduate MS Candidate</option>
                          <option value="Doctoral PhD Scholar">Doctoral PhD Scholar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          placeholder="e.g. Computer Science & IT"
                          className="w-full px-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                        />
                      </div>
                    </div>

                    {/* Research Track of Interest */}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                        Primary Research Track of Interest *
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none" />
                        <select
                          value={formData.track}
                          onChange={e => setFormData({ ...formData, track: e.target.value })}
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans cursor-pointer outline-none"
                        >
                          <option value="Foundational LLMs & Urdu NLP">Foundational LLMs &amp; Urdu NLP</option>
                          <option value="Adversarial AI & Robustness">Adversarial AI &amp; Robustness</option>
                          <option value="Cyber & Security Intelligence">Cyber &amp; Security Intelligence</option>
                          <option value="Software Development & AI Systems">Software Development &amp; AI Systems</option>
                          <option value="Edge AI & Low-Power Embedded Vision">Edge AI &amp; Low-Power Embedded Vision</option>
                          <option value="Autonomous Robotics & Aerial SLAM">Autonomous Robotics &amp; Aerial SLAM</option>
                          <option value="AI Safety, Interpretability & Alignment">AI Safety, Interpretability &amp; Alignment</option>
                          <option value="Healthcare & Clinical Multimodal AI">Healthcare &amp; Clinical Multimodal AI</option>
                        </select>
                      </div>
                    </div>

                    {/* Attach Resume PDF & Portfolio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          Upload Resume (PDF) <span className="text-[var(--text-subtle)] font-normal">(Max 4MB)</span>
                        </label>
                        {cvFile ? (
                          <div className="h-10 sm:h-11 px-3.5 rounded-xl border border-[var(--accent-orange)]/40 bg-[var(--bg-surface)] flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
                              <span className="truncate font-semibold text-[var(--text-primary)]">{cvFile.name}</span>
                              <span className="text-[10px] text-[var(--text-subtle)] shrink-0">
                                ({(cvFile.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCvFile(null)}
                              className="p-1 rounded-full hover:bg-white text-[var(--text-muted)] hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                              aria-label="Remove resume file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-10 sm:h-11 px-3.5 rounded-xl border border-dashed border-[var(--border-hairline-dark)] hover:border-[var(--accent-orange)] bg-[var(--bg-backdrop)] hover:bg-[var(--bg-surface)]/60 flex items-center gap-2.5 cursor-pointer transition-colors text-xs text-[var(--text-muted)]">
                            <Upload className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
                            <span className="truncate font-medium text-[var(--text-primary)]">Choose PDF Resume...</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={e => setCvFile(e.target.files?.[0] || null)}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          GitHub / Portfolio Link
                        </label>
                        <div className="relative">
                          <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                          <input
                            type="url"
                            value={formData.resumeUrl}
                            onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                            placeholder="https://github.com/..."
                            className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all font-sans outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brief Statement */}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                        Brief Statement of Interest / Past Projects
                      </label>
                      <textarea
                        rows={3}
                        value={formData.statement}
                        onChange={e => setFormData({ ...formData, statement: e.target.value })}
                        placeholder="Highlight relevant technical skills, PyTorch/TensorFlow experience, projects, or research interest..."
                        className="w-full p-3.5 rounded-xl border border-[var(--border-hairline-dark)] bg-[var(--bg-backdrop)] text-[13.5px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:bg-white focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/15 transition-all resize-none font-sans outline-none"
                      />
                    </div>
                  </fieldset>
                </div>

                {/* ── 3. Fixed Footer with Submit Action (Always visible & solid) ── */}
                <div className="p-4 sm:px-8 sm:py-4 border-t border-[var(--border-hairline)] bg-[var(--bg-backdrop)] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-[11.5px] text-[var(--text-muted)] flex items-center gap-1.5 self-start sm:self-auto">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isClosed ? 'bg-neutral-400' : 'bg-emerald-500 animate-pulse'}`} />
                    <span>{isClosed ? 'Applications Closed' : 'Applications Open \u2022 Reviewed Rolling'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <InteractiveHoverButton
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={onClose}
                      text="Cancel"
                      className="h-10 sm:h-11 bg-white border-[var(--border-hairline-dark)] text-[var(--text-muted)] text-xs"
                    />
                    <InteractiveHoverButton
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={loading || isClosed}
                      icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                      text={loading ? 'Submitting...' : 'Submit Application'}
                      className="flex-1 sm:flex-initial h-10 sm:h-11 text-xs sm:text-sm font-bold"
                    />
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
