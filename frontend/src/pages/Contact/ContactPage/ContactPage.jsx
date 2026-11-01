import ContactHero from '../sections/ContactHero/ContactHero.jsx'
import ContactSection from '@/components/shared-sections/ContactSection'
import CTA from '@/components/layout/CTA/CTA'

function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactSection />
      <CTA />
    </>
  )
}

export default ContactPage