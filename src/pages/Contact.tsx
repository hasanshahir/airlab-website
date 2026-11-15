import ContactSection from '../components/ContactSection'
import TitleReveal from '../components/ui/TitleReveal'
import BlurReveal from '../components/ui/blur-reveal'

export default function Contact() {
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-28 px-4 sm:px-8 max-w-[1240px] mx-auto relative font-sans text-[var(--text-primary)]">
      <div className="mb-14 text-left max-w-3xl">
        <TitleReveal
          as="h1"
          waitForPreloader
          className="font-head font-semibold text-[var(--text-primary)] mb-4 tracking-tight"
        >
          Contact AIR Lab
        </TitleReveal>

        <BlurReveal
          as="p"
          waitForPreloader
          delay={0.16}
          className="text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-relaxed font-normal"
        >
          Department of Computer Science & Information Technology (CSIT), NED University of Engineering & Technology.
        </BlurReveal>
      </div>

      <ContactSection />
    </div>
  )
}
