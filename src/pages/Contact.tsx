import ContactSection from '../components/ContactSection'
import SectionReveal from '../components/ui/SectionReveal'

export default function Contact() {
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      <div className="mb-14 text-left max-w-3xl">
        <SectionReveal delay={0.08}>
          <h1 className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Contact AIR Lab
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <p className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal">
            Department of Computer Science & Information Technology (CSIT), NED University of Engineering & Technology.
          </p>
        </SectionReveal>
      </div>

      <ContactSection />
    </div>
  )
}
