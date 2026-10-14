import { Brain, Handshake, Target, Globe, ShieldCheck } from 'lucide-react'
import Badge from '../components/ui/Badge'
import SectionReveal from '../components/ui/SectionReveal'

export default function About() {
  const pillars = [
    {
      title: 'Theoretical Exploration & Applied AI',
      desc: 'Advancing foundational methodologies across deep neural networks, large language models, computer vision, and autonomous systems with mathematical rigor.',
      icon: Brain,
      tag: 'Foundational',
    },
    {
      title: 'Bridging Academia & Industry',
      desc: 'Active enterprise co-development, sponsored research projects, technology transfer, and commercial-grade deployment testbeds.',
      icon: Handshake,
      tag: 'Knowledge Transfer',
    },
    {
      title: 'Robust, Ethical & Explainable Systems',
      desc: 'Engineering systems with strict safety guarantees, mathematical alignment, fair representation, and transparent explainability.',
      icon: ShieldCheck,
      tag: 'AI Governance',
    },
    {
      title: 'Capacity Building & National Ecosystem',
      desc: 'Hosting technical workshops, specialized bootcamps, and open research access to nurture top engineering talent in Pakistan.',
      icon: Globe,
      tag: 'Community',
    },
  ]

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-6 max-w-[1200px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-16 text-left max-w-3xl">
        <SectionReveal delay={0}>
          <div className="mb-4">
            <Badge variant="purple" icon={<Brain className="w-3.5 h-3.5 text-white" />}>
              NED UNIVERSITY · CSIT
            </Badge>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <h1 className="font-head font-normal text-[var(--text-primary)] mb-4 tracking-tight">
            About AIR Lab
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-relaxed font-normal">
            Pioneering artificial intelligence research, academia-industry innovation, and capacity building at NED University of Engineering & Technology.
          </p>
        </SectionReveal>
      </div>

      {/* ── Official Paragraph Cards ── */}
      <div className="space-y-8 mb-24 text-left">
        {/* Paragraph 1: Foundational Vision */}
        <SectionReveal delay={0.05}>
          <div className="craftly-card p-8 sm:p-12 relative overflow-hidden group bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] transition-all">
            <div className="max-w-4xl relative z-10">
              <div className="mb-4">
                <Badge variant="orange" icon={<Target className="w-3.5 h-3.5 text-white" />}>
                  Vision & Foundation
                </Badge>
              </div>

              <h2 className="text-[22px] sm:text-[28px] font-normal font-head text-[var(--text-primary)] mb-4 leading-tight">
                Advancing Cutting-Edge AI & Translating Innovation
              </h2>

              <p className="text-[14.5px] sm:text-[15.5px] text-[var(--text-muted)] leading-relaxed font-sans font-normal">
                The Artificial Intelligence Research Lab (AIR Lab) at the Department of Computer Science & Information Technology, NED University of Engineering & Technology, is established with the vision of advancing cutting-edge research in Artificial Intelligence and translating innovation into real-world impact. AIR Lab serves as a hub for theoretical exploration, applied research, and interdisciplinary collaboration in modern AI. Our research focuses on developing intelligent systems that are robust, ethical, explainable, and scalable, addressing challenges across academia, industry, and society. By combining strong foundations in computer science with contemporary AI methodologies, we aim to push the boundaries of what intelligent systems can achieve.
              </p>
            </div>
          </div>
        </SectionReveal>

        {/* Paragraph 2: Academia-Industry Synergy */}
        <SectionReveal delay={0.1}>
          <div className="craftly-card p-8 sm:p-12 relative overflow-hidden group bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] transition-all">
            <div className="max-w-4xl relative z-10">
              <div className="mb-4">
                <Badge variant="purple" icon={<Handshake className="w-3.5 h-3.5 text-white" />}>
                  Academia & Industry Bridging
                </Badge>
              </div>

              <h2 className="text-[22px] sm:text-[28px] font-normal font-head text-[var(--text-primary)] mb-4 leading-tight">
                Practical Solutions, Knowledge Transfer & Capacity Building
              </h2>

              <p className="text-[14.5px] sm:text-[15.5px] text-[var(--text-muted)] leading-relaxed font-sans font-normal">
                A core objective of AIR Lab is to bridge the gap between academia and industry. We actively collaborate with industry partners to solve real-world problems, enabling knowledge transfer, applied innovation, and workforce development. Through joint projects, sponsored research, and student involvement, the lab contributes practical AI solutions while preparing skilled graduates for the evolving technological landscape. Beyond research, AIR Lab is committed to community engagement and capacity building. The lab promotes AI awareness through workshops, seminars, training programs, and open research initiatives, fostering an ecosystem of learning and innovation within and beyond the university.
              </p>
            </div>
          </div>
        </SectionReveal>

        {/* Paragraph 3: Future Aspirations & Pakistan AI Frontier */}
        <SectionReveal delay={0.15}>
          <div className="craftly-card p-8 sm:p-12 relative overflow-hidden group bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] transition-all">
            <div className="max-w-4xl relative z-10">
              <div className="mb-4">
                <Badge variant="orange" icon={<Globe className="w-3.5 h-3.5 text-white" />}>
                  Global Impact & National Leadership
                </Badge>
              </div>

              <h2 className="text-[22px] sm:text-[28px] font-normal font-head text-[var(--text-primary)] mb-4 leading-tight">
                Shaping the Future of AI in Pakistan
              </h2>

              <p className="text-[14.5px] sm:text-[15.5px] text-[var(--text-muted)] leading-relaxed font-sans font-normal">
                By nurturing talent, encouraging collaboration, and pursuing impactful research, the Artificial Intelligence Research Lab aspires to play a meaningful role in shaping the future of AI in Pakistan and contributing to the global AI research community.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* ── 4 Core Pillars Grid ── */}
      <div className="text-left">
        <SectionReveal>
          <div className="mb-10 text-left">
            <h2 className="font-head font-normal text-[var(--text-primary)] mb-2 tracking-tight">
              Core Pillars of Excellence
            </h2>
            <p className="text-[15px] text-[var(--text-muted)]">
              The fundamental research disciplines steering AIR Lab's ongoing and upcoming programs.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <SectionReveal key={i} staggerIndex={i}>
                <div className="craftly-card p-6 flex flex-col justify-between h-full group bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[4px] hover:border-[var(--accent-purple)] transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-[2px] bg-[var(--accent-purple-light)] border border-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)] transition-colors mb-4">
                      <Icon className="w-5 h-5 text-[var(--accent-purple)]" />
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-subtle)] uppercase tracking-wider block mb-1">
                      {pillar.tag}
                    </span>
                    <h3 className="text-[17px] font-medium font-head text-[var(--text-primary)] mb-2 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-[13px] text-[var(--text-muted)] leading-relaxed font-sans font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}
