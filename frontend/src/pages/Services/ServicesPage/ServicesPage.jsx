import ServiceHero from '../sections/ServiceHero/ServiceHero.jsx'
import ServiceGoal from '../sections/ServiceGoal/ServiceGoal.jsx'
import ServiceSolutions from '../sections/ServiceSolutions/ServiceSolutions.jsx'
import ServiceCasestudies from '../sections/ServiceCasestudies/ServiceCasestudies.jsx'
import CTA from '@/components/layout/CTA/CTA'

function ServicesPage() {
  return (
    <main className="bg-black text-white">
      <ServiceHero />
      <ServiceGoal />
      <ServiceSolutions />
      <ServiceCasestudies />
      <CTA />

    </main>
  )
}

export default ServicesPage