import { Eye, Target } from 'lucide-react'
import SectionReveal from '../components/ui/SectionReveal'

export default function About() {
  const aims = [
    'Advance AI research in security, language, speech, and vision, with a focus on problems that matter locally.',
    'Build practical, efficient AI that works within the data, language, and resource realities of Pakistan.',
    'Close the gap between academic research and real-world deployment.',
  ]

  const objectives = [
    'Conduct and publish original research in adversarial AI, NLP, computer vision, and agentic systems.',
    'Develop AI solutions that fit local languages, data, and resource constraints.',
    'Build and share datasets, benchmarks, and tools that reflect Pakistani contexts and users.',
    'Turn research into practical, privacy-preserving prototypes that address real local needs.',
    'Train students through projects, competitions, and mentorship.',
    'Collaborate with industry, government, and academia on locally driven problems.',
  ]

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] mb-4 tracking-tight">
            About AIR Lab
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[20px] text-[var(--text-muted)] leading-relaxed font-medium">
            Research-grade minds. Production-ready systems. Built for Pakistan.
          </p>
        </SectionReveal>
      </div>

      {/* About Section */}
      <SectionReveal delay={0.1}>
        <div className="p-8 sm:p-12 mb-14 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200">
          <div className="max-w-4xl space-y-5 text-[15px] sm:text-[16px] text-[var(--text-muted)] leading-relaxed font-normal">
            <p>
              AIR Lab, the artificial intelligence research lab at NED University, turns cutting-edge research into production-ready systems. We build models, fine-tune and optimize open-source ones to run on local hardware, and gather the data to teach them Pakistan’s languages and realities.
            </p>
            <p>
              Our work spans cybersecurity and adversarial AI, small language models, computer vision, natural language processing, speech-based agents, and agentic AI. We don’t stop at papers and prototypes. We engineer, test, and deploy systems that people and institutions can use. Every project begins with one question: what do the people of Pakistan need?
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        <SectionReveal delay={0.15}>
          <div className="h-full p-8 sm:p-10 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-orange)] mb-6 shadow-sm">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold font-head text-[var(--text-primary)] mb-4">
              Vision
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-muted)] leading-relaxed font-normal">
              To make Pakistan a builder of AI, not just a consumer of it, with solutions designed around our people, our languages, and our values.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="h-full p-8 sm:p-10 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-orange)] mb-6 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold font-head text-[var(--text-primary)] mb-4">
              Mission
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[var(--text-muted)] leading-relaxed font-normal">
              To conduct cutting-edge AI research and turn it into secure, production-ready systems built around the languages, data, and needs of the people of Pakistan, while training the next generation of AI researchers and engineers.
            </p>
          </div>
        </SectionReveal>
      </div>

      {/* Aims */}
      <div className="mb-14 text-left">
        <SectionReveal delay={0.1}>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold font-head text-[var(--text-primary)] tracking-tight">
              Aims
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aims.map((aim, i) => (
            <SectionReveal key={i} staggerIndex={i}>
              <div className="h-full p-7 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-md transition-all duration-200 flex flex-col">
                <span className="text-[12px] font-mono font-semibold text-[var(--accent-orange)] mb-4 px-2.5 py-1 bg-[var(--bg-page)] border border-[var(--border-hairline)] rounded-full w-fit">
                  0{i + 1}
                </span>
                <p className="text-[15px] text-[var(--text-muted)] leading-relaxed font-normal">
                  {aim}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      {/* Objectives */}
      <div className="text-left">
        <SectionReveal delay={0.1}>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold font-head text-[var(--text-primary)] tracking-tight">
              Objectives
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {objectives.map((obj, i) => (
            <SectionReveal key={i} staggerIndex={i}>
              <div className="h-full p-7 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-3xl hover:border-[var(--accent-orange)]/40 hover:shadow-md transition-all duration-200 flex flex-col">
                <span className="text-[12px] font-mono font-semibold text-[var(--accent-orange)] mb-4 px-2.5 py-1 bg-[var(--bg-page)] border border-[var(--border-hairline)] rounded-full w-fit">
                  0{i + 1}
                </span>
                <p className="text-[14.5px] text-[var(--text-muted)] leading-relaxed font-normal">
                  {obj}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
