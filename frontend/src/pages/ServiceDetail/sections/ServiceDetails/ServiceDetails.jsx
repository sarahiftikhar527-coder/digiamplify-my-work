import ServiceDetailsHero from "../ServiceDetailsHero/ServiceDetailsHero";
import ServiceDetailsIntro from "../ServiceDetailsIntro/ServiceDetailsIntro";
import ServiceDetailsPhases from "../ServiceDetailsPhases/ServiceDetailsPhases";
import ServiceDetailsFeatures from "../ServiceDetailsFeatures/ServiceDetailsFeatures";
import ServiceDetailsWhy from "../ServiceDetailsWhy/ServiceDetailsWhy";
import ServiceDetailsStats from "../ServiceDetailsStats/ServiceDetailsStats";
import ServiceDetailsFAQ from "../ServiceDetailsFAQ/ServiceDetailsFAQ";
import { servicesCommon } from "@/data/services/details";

function ServiceDetails({ service }) {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_20%_8%,#1a1a1a_0%,#0d0d0d_45%,#000000_100%)] font-['Poppins'] text-white">
      <ServiceDetailsHero service={service} />
      <ServiceDetailsIntro intro={service.intro} />
      <ServiceDetailsPhases phases={servicesCommon.phases} />
      <ServiceDetailsFeatures
        data={service.features}
        cube={servicesCommon.cube}
      />
      <ServiceDetailsWhy data={service.whyChoose} image={service.whyImage} />
      <ServiceDetailsStats data={service.stats} cube={servicesCommon.cube} />
      <ServiceDetailsFAQ faqs={servicesCommon.faqs} />
    </div>
  );
}

export default ServiceDetails;