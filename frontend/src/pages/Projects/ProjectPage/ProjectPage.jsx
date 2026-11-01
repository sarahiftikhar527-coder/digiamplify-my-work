import ProjectHero from '../sections/ProjectHero/ProjectHero.jsx'
import ProjectWork from '../sections/ProjectWork/ProjectWork.jsx'
import ProjectOverview from '../sections/ProjectOverview/ProjectOverview.jsx'
import CTA from '@/components/layout/CTA/CTA'

function ProjectPage() {
  return (
    <>
      <ProjectHero />
      <ProjectWork />
      <ProjectOverview />
      <CTA />
    </>
  )
}

export default ProjectPage