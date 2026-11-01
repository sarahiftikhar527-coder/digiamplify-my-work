import { useState } from "react";
import useHelpSupport from "../../../../../hooks/useHelpSupport";
import { FAQSection, MyTickets, ReportProblemModal, SupportHeader } from "../../components";

const HelpSupportPage = () => {
  const hs = useHelpSupport();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="w-full">
      <SupportHeader onReport={() => setReportOpen(true)} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <MyTickets tickets={hs.tickets} loading={hs.loading} error={hs.ticketsError} onRetry={hs.reload} />
        <FAQSection faqs={hs.faqs} loading={hs.loading} error={hs.faqsError} />
      </div>

      <ReportProblemModal open={reportOpen} onClose={() => setReportOpen(false)} onCreated={hs.addTicket} />
    </div>
  );
};

export default HelpSupportPage;