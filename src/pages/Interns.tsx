import { UserCheck, GraduationCap, Building2, Quote, BookOpen } from 'lucide-react'
import internsData from '../data/interns.json'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SectionReveal from '../components/ui/SectionReveal'

export default function Interns() {
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<UserCheck className="w-3.5 h-3.5 text-white" />}>
              ALUMNI & FORMER INTERNS
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-3 tracking-tight">
            Research Interns & Alumni
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Where our former research fellows are now — from PhD programs at MIT CSAIL to engineering at Google DeepMind and NVIDIA.
          </p>
        </SectionReveal>
      </div>

      {/* Grid of Alumni */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
        {[...internsData].map((intern, index) => (
          <SectionReveal key={intern.id} staggerIndex={index}>
            <div
              className="craftly-card p-6 sm:p-8 flex flex-col justify-between group h-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] hover:shadow-xl transition-all"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative w-20 h-20 rounded-[2px] overflow-hidden shrink-0 border border-[var(--border-hairline)] bg-[var(--bg-page)]">
                    <img
                      src={intern.image}
                      alt={intern.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-medium bg-[var(--accent-purple-light)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20">
                        {intern.term}
                      </span>
                    </div>
                    <h3 className="text-2xl font-normal font-head text-[var(--text-primary)] mt-1">
                      {intern.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                      {intern.university}
                    </p>
                  </div>
                </div>

                {/* Where they are now pill */}
                <div className="p-3.5 rounded-[2px] bg-[var(--bg-page)] border border-[var(--border-hairline)] mb-5 flex items-center justify-between">
                  <div className="text-xs font-mono">
                    <span className="text-[var(--text-subtle)] block text-[10px]">CURRENT ROLE:</span>
                    <strong className="text-[var(--text-primary)] font-semibold">{intern.currentRole}</strong>
                  </div>
                  <Building2 className="w-4 h-4 text-[var(--text-subtle)] shrink-0" />
                </div>

                {/* Project Focus & Paper */}
                <div className="space-y-2 mb-5 text-xs font-mono">
                  <div className="text-[var(--text-muted)]">
                    Lab Project: <strong className="text-[var(--text-primary)]">{intern.project}</strong>
                  </div>
                  <div className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent-purple)] shrink-0" />
                    <span>Resulting Paper: <strong className="text-[var(--text-primary)]">{intern.paper}</strong></span>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="rounded-[2px] bg-[var(--bg-page)] p-4 border-l-2 border-[var(--accent-orange)] text-xs text-[var(--text-muted)] italic font-sans leading-relaxed relative">
                  <Quote className="w-4 h-4 text-[var(--text-subtle)]/30 absolute top-2 right-2" />
                  "{intern.quote}"
                </blockquote>
              </div>

              <div className="pt-4 border-t border-[var(--border-hairline)] mt-6 flex items-center justify-between text-xs font-mono text-[var(--text-subtle)]">
                <span>Alumni Network: <strong className="text-[var(--accent-orange)] font-medium">Verified</strong></span>
                <span className="text-[var(--text-primary)] font-semibold">Former Intern</span>
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>

      {/* Recruitment Callout */}
      <SectionReveal>
        <div className="craftly-card p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-left relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px]">
          <div className="relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-orange)] font-semibold mb-2 block">
              Join Our Team
            </span>
            <h3 className="text-2xl sm:text-3xl font-normal font-head text-[var(--text-primary)] mb-2">
              Summer 2026 Research Internships
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xl font-normal leading-relaxed">
              Applications open for undergraduate scholars in Computer Science, Software Engineering, and Electrical Engineering. Gain compute access and paper authorship.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Button
              href="mailto:internships@airlab.neduet.edu.pk?subject=Summer%202026%20Research%20Internship%20Application"
              variant="primary"
              size="md"
              arrow
            >
              Apply for Summer 2026
            </Button>
          </div>
        </div>
      </SectionReveal>
    </div>
  )
}
