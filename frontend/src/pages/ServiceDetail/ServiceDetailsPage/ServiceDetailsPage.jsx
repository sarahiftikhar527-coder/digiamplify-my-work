import { useParams } from "react-router-dom";
import { getService } from "@/data/services/details";
import ServiceDetails from "../sections/ServiceDetails/ServiceDetails";
import CTA from "@/components/layout/CTA/CTA";
import NotFound from "@/pages/NotFound/NotFound";

function ServiceDetailsPage() {
  const { slug } = useParams();
  const service = getService(slug);

  if (!service) {
    return <NotFound />;
  }

  return (
    <main className="bg-black text-white">
      <ServiceDetails service={service} />
      <CTA />
    </main>
  );
}

export default ServiceDetailsPage;