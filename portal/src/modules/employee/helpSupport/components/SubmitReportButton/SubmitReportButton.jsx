import { Loader2 } from "lucide-react";

const SubmitReportButton = ({ loading = false, disabled = false }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-md bg-[#c1121f] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? (
      <>
        <Loader2 size={15} className="animate-spin" /> Submitting...
      </>
    ) : (
      "Submit Report"
    )}
  </button>
);

export default SubmitReportButton;