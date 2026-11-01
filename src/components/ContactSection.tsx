import React from 'react'
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react'

export const ContactSection: React.FC = () => {
  return (
    <div className="w-full">
      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm text-left relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-[11px] font-mono font-semibold bg-[var(--ink-dark)] text-white rounded-full uppercase tracking-wider">
              COMMUNICATIONS & INQUIRIES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-head font-semibold text-[var(--text-primary)] tracking-tight mb-3">
            Connect with AIR Lab
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-8 font-normal">
            For academic collaborations, sponsored industry grants, student fellowship inquiries, or dataset access requests, reach our coordination team directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="mailto:contact@airlab.neduet.edu.pk"
              className="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)]/50 transition-colors flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-light)] text-[var(--accent-orange)] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Official Lab Email</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate mt-0.5">
                  contact@airlab.neduet.edu.pk
                </div>
              </div>
            </a>

            <div className="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--ink-dark)]/10 text-[var(--ink-dark)] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Department Phone</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] mt-0.5">
                  9221-99261261 Ext: 2399
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-light)] text-[var(--accent-orange)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Physical Address</div>
                  <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)] mt-0.5">
                    Department of Computer Science & Information Technology (CSIT), NED University Main Campus, University Road, Karachi 75270, Pakistan.
                  </div>
                </div>
              </div>
              <a
                href="https://cct.neduet.edu.pk/AIR"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1.5 shrink-0 font-semibold"
              >
                <span>NED University Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSection
