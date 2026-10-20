import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, GraduationCap, FileText, User, Mail, BookOpen, Phone, Loader2 } from 'lucide-react'

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
          {/* Backdrop with mauve tint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[rgba(17,17,17,0.45)] backdrop-blur-[12px] transition-opacity"
          />

          {/* Modal Container: near-white sharp panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] shadow-[0_24px_70px_rgba(17,17,17,0.14)] p-6 sm:p-8 z-10 overflow-hidden font-sans my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-purple)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              /* Success Screen */
              <div className="text-center py-10 px-4 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-[2px] bg-[var(--accent-orange)] text-white mx-auto flex items-center justify-center mb-6 shadow-md">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-medium font-head text-[var(--text-primary)] mb-2">
                    Application Submitted!
                  </h3>
                  <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for applying to the Artificial Intelligence Research Lab at NED University. Your application has been stored in the database. Dr. Murk Marvi and the faculty review committee will review your record and contact you at <strong className="text-[var(--text-primary)]">{formData.email}</strong>.
                  </p>
                  <div className="p-4 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)] text-left mb-6 max-w-md mx-auto space-y-1.5">
                    <div><strong>Applicant:</strong> {formData.name} ({formData.rollNo})</div>
                    <div><strong>Department:</strong> {formData.department}</div>
                    <div><strong>Research Track:</strong> {formData.track}</div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="h-10 px-8 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    Done ↳
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[var(--accent-purple-light)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20 text-[11px] font-medium mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                    <span>RESEARCH FELLOWSHIP & INTERNSHIP ADMISSIONS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight font-head text-[var(--text-primary)]">
                    Apply for Research Vacancy
                  </h2>
                  <p className="text-[13.5px] text-[var(--text-muted)] mt-1 font-sans">
                    Join NED University's premier AI Lab. Work directly with faculty on supercluster compute, LLMs, computer vision, and robotics testbeds.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-[2px] bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
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
                          className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Student Email */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
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
                          className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Roll Number */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
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
                          className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
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
                          className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Program / Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                        Academic Program
                      </label>
                      <select
                        value={formData.program}
                        onChange={e => setFormData({ ...formData, program: e.target.value })}
                        className="w-full px-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                      >
                        <option value="Undergraduate BS (3rd/4th Year)">Undergraduate BS (3rd / 4th Year)</option>
                        <option value="Undergraduate BS (1st/2nd Year)">Undergraduate BS (1st / 2nd Year)</option>
                        <option value="Postgraduate MS Candidate">Postgraduate MS Candidate</option>
                        <option value="Doctoral PhD Scholar">Doctoral PhD Scholar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Computer Science & IT"
                        className="w-full px-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Research Track of Interest */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                      Primary Research Track of Interest *
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                      <select
                        value={formData.track}
                        onChange={e => setFormData({ ...formData, track: e.target.value })}
                        className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                      >
                        <option value="Foundational LLMs & Urdu NLP">Foundational LLMs & Urdu NLP</option>
                        <option value="Edge AI & Low-Power Embedded Vision">Edge AI & Low-Power Embedded Vision</option>
                        <option value="Autonomous Robotics & Aerial SLAM">Autonomous Robotics & Aerial SLAM</option>
                        <option value="AI Safety, Interpretability & Alignment">AI Safety, Interpretability & Alignment</option>
                        <option value="Healthcare & Clinical Multimodal AI">Healthcare & Clinical Multimodal AI</option>
                      </select>
                    </div>
                  </div>

                  {/* Attach Resume PDF */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                        Upload CV / Resume (PDF)
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setCvFile(e.target.files?.[0] || null)}
                        className="w-full px-3.5 py-2.5 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[12px] text-[var(--text-primary)] file:mr-3 file:py-1 file:px-2 file:rounded-[2px] file:border-0 file:text-[11px] file:bg-[var(--accent-orange)] file:text-white cursor-pointer font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                        GitHub / Portfolio Link
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                        <input
                          type="url"
                          value={formData.resumeUrl}
                          onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full pl-10 pr-3.5 h-11 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brief Statement */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                      Brief Statement of Interest / Past Projects
                    </label>
                    <textarea
                      rows={3}
                      value={formData.statement}
                      onChange={e => setFormData({ ...formData, statement: e.target.value })}
                      placeholder="Highlight relevant technical skills, PyTorch/TensorFlow experience, projects, or research interest..."
                      className="w-full p-3.5 rounded-[2px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--accent-orange)]/20 transition-all resize-none font-sans"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-[13.5px] font-medium flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer active:translate-y-[1px] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <span className="text-[12px] leading-none">↳</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
