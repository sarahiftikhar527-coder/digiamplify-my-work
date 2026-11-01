import { AlertCircle } from "lucide-react";

const SupportHeader = ({ onReport }) => (
  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">Help &amp; Support</h1>
      <p className="mt-1 text-[13px] text-white/70">Browse FAQs and track your support tickets.</p>
    </div>
    <button
      onClick={onReport}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#c1121f] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d4202d]"
    >
      <AlertCircle size={15} /> Report a Problem
    </button>
  </div>
);

export default SupportHeader;