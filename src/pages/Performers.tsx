import { Link } from 'react-router-dom'
import { Trophy, Medal, Sparkles, ExternalLink, Mail, Award, BookOpen, Layers } from 'lucide-react'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'

const Linkedin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

const featuredPerformer = {
  id: 'ri1',
  name: 'Muhammad Shaheer Khan',
  role: 'Research Intern',
  categoryTab: 'interns',
  month: 'October 2026',
  image: './pfp/shaheer.png',
  department: 'Department of Computer Science & IT (CSIT), NED University',
  title: 'Lead Student Author — UrduLLM-12B Bilingual Foundation Model',
  achievement:
    'Authored landmark benchmark paper accepted at ACL 2026 and spearheaded the open-source release of the 12.4B token UrduLLM foundation model benchmarked on regional statutes and low-resource syntax.',
  email: 'khan4731403@cloud.neduet.edu.pk',
  linkedin: 'https://www.linkedin.com/in/muhammad-shaheer-86043359/',
  metrics: {
    citations: '142+',
    paper: "ACL '26 Main Track",
    compute: 'SLURM Supercluster Lead',
    tokens: '12.4B Tokens Evaluated',
  },
  tags: ['UrduLLM', 'Transformers', 'ACL 2026', 'Foundation Models', 'Deep Learning'],
}

export default function Performers() {
  const teamRedirectUrl = `/team?tab=${featuredPerformer.categoryTab}&member=${featuredPerformer.id}`

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="orange" icon={<Trophy className="w-3.5 h-3.5 text-white" />}>
              ACADEMIC EXCELLENCE & HALL OF FAME
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-3 tracking-tight">
            Performer of the Month
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Monthly spotlight honoring the researcher who demonstrated exceptional scientific rigor, landmark publications, and engineering leadership at AIR Lab.
          </p>
        </SectionReveal>
      </div>

      {/* ── Single Grand Static Performer of the Month Card ── */}
      <SectionReveal delay={0.2}>
        <div className="craftly-card p-8 sm:p-12 relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] shadow-lg max-w-4xl mx-auto transition-all duration-300 hover:border-[var(--accent-purple)] text-left">
          {/* Top Banner Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8 border-b border-[var(--border-hairline)] mb-8">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-[2px] text-xs font-mono font-semibold bg-[var(--accent-orange)] text-white flex items-center gap-1.5 shadow-xs">
                <Medal className="w-4 h-4 text-white" />
                Spotlight Award
              </span>
              <span className="px-3 py-1 rounded-[2px] text-xs font-mono font-medium bg-[var(--accent-purple-light)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20">
                {featuredPerformer.month}
              </span>
            </div>

            <span className="text-xs font-mono text-[var(--text-subtle)]">
              Recognized by AIR Lab
            </span>
          </div>

          {/* Member Profile Showcase */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            {/* Clickable Portrait Image */}
            <Link
              to={teamRedirectUrl}
              title={`Click to view ${featuredPerformer.name} on Team page`}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[4px] overflow-hidden shrink-0 border-2 border-[var(--border-hairline)] shadow-sm group cursor-pointer bg-[var(--bg-page)] transition-transform duration-300 hover:scale-102"
            >
              <img
                src={featuredPerformer.image}
                alt={featuredPerformer.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-[2px] bg-white text-gray-900 text-[10px] font-mono font-bold shadow-md">
                  View Profile
                </span>
              </div>
            </Link>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-mono font-semibold bg-[var(--accent-purple-light)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20">
                  {featuredPerformer.role}
                </span>
              </div>

              {/* Clickable Name with redirection */}
              <Link
                to={teamRedirectUrl}
                className="text-2xl sm:text-3xl font-medium font-head text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-colors block"
              >
                {featuredPerformer.name}
              </Link>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-mono mt-1">
                {featuredPerformer.department}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-3">
                {featuredPerformer.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-[2px] text-[11px] font-mono bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Achievement Box */}
          <div className="rounded-[4px] bg-[var(--bg-page)] p-6 border border-[var(--border-hairline)] mb-8">
            <h3 className="text-base sm:text-lg font-medium font-head text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent-orange)] shrink-0" />
              <span>{featuredPerformer.title}</span>
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-normal">
              "{featuredPerformer.achievement}"
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-head font-bold text-[var(--accent-orange)]">
                {featuredPerformer.metrics.citations}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-subtle)] mt-0.5">Academic Citations</div>
            </div>
            <div className="p-4 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center shadow-xs">
              <div className="text-base sm:text-lg font-head font-bold text-[var(--text-primary)] truncate">
                {featuredPerformer.metrics.paper}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-subtle)] mt-0.5 flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3 text-[var(--accent-purple)]" /> Accepted Venue
              </div>
            </div>
            <div className="p-4 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center shadow-xs">
              <div className="text-base sm:text-lg font-head font-bold text-[var(--text-primary)] truncate">
                {featuredPerformer.metrics.compute}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-subtle)] mt-0.5 flex items-center justify-center gap-1">
                <Layers className="w-3 h-3 text-[var(--accent-purple)]" /> Infrastructure
              </div>
            </div>
            <div className="p-4 rounded-[2px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center shadow-xs">
              <div className="text-base sm:text-lg font-head font-bold text-[var(--accent-orange)] truncate">
                {featuredPerformer.metrics.tokens}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-subtle)] mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-[var(--accent-orange)]" /> Model Scale
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4">
            <Link
              to={teamRedirectUrl}
              className="h-10 px-5 rounded-[2px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>View Full Profile on Team Page</span>
              <span>&rarr;</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <a
                href={featuredPerformer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-[2px] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] text-[var(--text-primary)] text-xs font-mono font-medium flex items-center gap-1.5 border border-[var(--border-hairline)] shadow-xs transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-[var(--text-subtle)]" />
              </a>

              <a
                href={`mailto:${featuredPerformer.email}`}
                className="h-9 px-4 rounded-[2px] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] text-[var(--text-primary)] text-xs font-mono font-medium flex items-center gap-1.5 border border-[var(--border-hairline)] shadow-xs transition-colors"
                title={`Email ${featuredPerformer.email}`}
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  )
}
