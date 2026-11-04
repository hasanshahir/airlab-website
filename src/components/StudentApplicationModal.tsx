import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, GraduationCap, FileText, User, Mail, BookOpen, Phone, Loader2, ArrowRight } from 'lucide-react'

interface StudentApplicationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StudentApplicationModal({ isOpen, onClose }: StudentApplicationModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
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
      data.append('university', 'NED University of Engineering & Technology')
      data.append('degreeYear', `${formData.program} (${formData.department}) - Roll: ${formData.rollNo}`)
      data.append('coverNote', `[Track: ${formData.track}] ${formData.statement}`)
      data.append('github', formData.resumeUrl)
      data.append('resumeUrl', formData.resumeUrl)

      if (cvFile) {
        if (cvFile.size > 4 * 1024 * 1024) {
          throw new Error('Resume PDF is too large. Please upload a file smaller than 4MB, or paste your Google Drive / LinkedIn link in the Portfolio field.')
        }
        data.append('cv', cvFile)
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        const text = await res.text()
        let errJson: any
        try {
          errJson = JSON.parse(text)
        } catch {
          // fallback
        }
        throw new Error(errJson?.error || text || `Server error (${res.status})`)
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
          {/* Backdrop with subtle ink tint and click-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container: responsive, max-height constrained with internal smooth scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden font-sans my-auto text-left"
            onClick={e => e.stopPropagation()}
          >
            {submitted ? (
              /* Success Screen */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[var(--border-hairline)] flex items-center justify-between shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Application Received</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center overscroll-contain">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent-orange)] text-white mx-auto flex items-center justify-center mb-5 shadow-md">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 id="vacancy-modal-title" className="text-2xl font-bold font-head text-[var(--text-primary)] mb-2.5">
                    Application Submitted!
                  </h3>
                  <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for applying to the Artificial Intelligence Research Lab at NED University. Your application has been stored in the database. Dr. Murk Marvi and the faculty review committee will review your record and contact you at <strong className="text-[var(--text-primary)]">{formData.email}</strong>.
                  </p>
                  <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-muted)] text-left mb-6 max-w-md mx-auto space-y-2">
                    <div><strong>Applicant:</strong> {formData.name} ({formData.rollNo})</div>
                    <div><strong>Department:</strong> {formData.department}</div>
                    <div><strong>Research Track:</strong> {formData.track}</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] flex justify-end shrink-0">
                  <button
                    onClick={handleReset}
                    className="h-11 px-8 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* ── 1. Fixed Header (Always visible, never cropped) ── */}
                <div className="p-5 sm:px-8 sm:py-5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] flex items-start justify-between gap-4 shrink-0">
                  <div className="min-w-0 pr-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange-light)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/20 text-[11px] font-sans font-semibold mb-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">FELLOWSHIP &amp; INTERNSHIP ADMISSIONS</span>
                    </div>
                    <h2 id="vacancy-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight font-head text-[var(--text-primary)]">
                      Apply for Research Vacancy
                    </h2>
                    <p className="text-xs sm:text-[13.5px] text-[var(--text-muted)] mt-1 font-sans leading-relaxed line-clamp-2">
                      Department of CSIT · NED University. Work directly with faculty on LLMs, edge perception, and robotics testbeds.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--surface-alt)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)] transition-colors cursor-pointer shrink-0 mt-0.5"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── 2. Scrollable Body (Smooth scrolling, 100% visible fields) ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 overscroll-contain space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                      {error}
                    </div>
                  )}

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
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
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
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
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
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
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
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Program / Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                        Academic Program
                      </label>
                      <select
                        value={formData.program}
                        onChange={e => setFormData({ ...formData, program: e.target.value })}
                        className="w-full px-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans cursor-pointer"
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
                        className="w-full px-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
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
                        className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans cursor-pointer"
                      >
                        <option value="Foundational LLMs & Urdu NLP">Foundational LLMs &amp; Urdu NLP</option>
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
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setCvFile(e.target.files?.[0] || null)}
                        className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[12px] text-[var(--text-primary)] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-[var(--accent-orange)] file:text-white cursor-pointer font-sans"
                      />
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
                          className="w-full pl-10 pr-3.5 h-10 sm:h-11 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
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
                      className="w-full p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all resize-none font-sans"
                    />
                  </div>
                </div>

                {/* ── 3. Fixed Footer with Submit Action (Always visible & accessible) ── */}
                <div className="p-4 sm:px-8 sm:py-4 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-[11.5px] text-[var(--text-subtle)] flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Fall 2026 Admissions &bull; Reviewed Rolling</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-10 sm:h-11 px-5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-initial h-10 sm:h-11 px-7 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:translate-y-[1px] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
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
