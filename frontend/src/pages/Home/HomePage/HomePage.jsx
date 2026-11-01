
import Hero from '../sections/Hero/Hero.jsx'
import AboutIntro from '../sections/AboutIntro/AboutIntro.jsx'
import ImageShowcase from '../sections/ImageShowcase/ImageShowcase.jsx'
import Capabilities from '../sections/Capabilities/Capabilities.jsx'
import Numbers from '../sections/Numbers/Numbers.jsx'
import Workflow from '../sections/Workflow/Workflow.jsx'
import ProjectsShowcase from '../sections/ProjectsShowcase/ProjectsShowcase.jsx'
import ClientReviews from '../sections/ClientReviews/ClientReviews.jsx'
import VideoTestimonials from '../sections/VideoTestimonials/VideoTestimonials.jsx'

import FaqSection from '@/components/shared-sections/FaqSection'
import CtaCard from '@/components/shared-sections/CtaCard'
import ContactSection from '@/components/shared-sections/ContactSection'

import CTA from '@/components/layout/CTA/CTA'

function HomePage() {
  return (
    <>
      <Hero />
      <AboutIntro />
      <ImageShowcase />
      <Capabilities />
      <Numbers />
      <Workflow />
      <ProjectsShowcase />
      <ClientReviews />
      <VideoTestimonials />
      <FaqSection />
      <CtaCard />
      <ContactSection />
      <CTA />
    </>
  )
}

export default HomePage