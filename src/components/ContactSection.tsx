import React from 'react'
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react'

export const ContactSection: React.FC = () => {
  return (
    <div className="w-full">
      <div className="p-8 sm:p-10 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm text-left relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[var(--accent-purple)] text-white rounded-[2px] uppercase tracking-wider">
              COMMUNICATIONS & INQUIRIES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-head font-normal text-[var(--text-primary)] tracking-tight mb-3">
            Connect with AIR Lab
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-6 font-normal">
            For academic collaborations, sponsored industry grants, student fellowship inquiries, or dataset access requests, reach our coordination team directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="mailto:contact@airlab.neduet.edu.pk"
              className="p-4 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)] transition-colors flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-[2px] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Official Lab Email</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
                  contact@airlab.neduet.edu.pk
                </div>
              </div>
            </a>

            <div className="p-4 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-[2px] bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Department Phone</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)]">
                  9221-99261261 Ext: 2399
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 p-4 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-[2px] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Physical Address</div>
                <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                  Department of Computer Science & Information Technology (CSIT), NED University Main Campus, University Road, Karachi 75270, Pakistan.
                </div>
              </div>
              <a
                href="https://cct.neduet.edu.pk/AIR"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1 self-center"
              >
                <span>NED Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSection
