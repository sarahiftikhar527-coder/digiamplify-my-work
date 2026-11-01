import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import ReportProblemForm from "../ReportProblemForm";
import useReportProblem from "../../../../../hooks/useReportProblem";
import { CONTACT_METHODS } from "../../../../../constants/helpandsupport";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([hidden]),[tabindex]:not([tabindex="-1"])';

const Dialog = ({ onClose, onCreated }) => {
  const form = useReportProblem({ onCreated });
  const { ticket, submitting, isDirty, values } = form;
  const dialogRef = useRef(null);

  const requestClose = useCallback(() => {
    if (submitting) return;
    if (isDirty && !ticket && !window.confirm("Discard this report?")) return;
    onClose();
  }, [submitting, isDirty, ticket, onClose]);

  // scroll lock + focus restore
  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById("rp-issueType")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  // Esc + focus trap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  const contactLabel = CONTACT_METHODS.find((c) => c.value === values.contactMethod)?.label?.toLowerCase();

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-md">
      <div
        className="flex min-h-full items-end justify-center sm:items-center sm:p-6"
        onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rp-title"
          className="relative w-full max-w-[580px] rounded-t-2xl border border-white/10 bg-[#09090b] p-5 shadow-2xl sm:rounded-xl sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="rp-title" className="flex items-center gap-2.5 text-[18px] font-semibold text-white">
                <AlertCircle size={18} className="text-red-500" />
                Report a Problem
              </h2>
              <p className="mt-1 max-w-[420px] text-[12.5px] leading-relaxed text-white/70">
                Let us know what is going on. We'll look into it and get back to you soon.
              </p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/80 text-white transition hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-6">
            {ticket ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 size={46} className="text-green-500" />
                <h3 className="text-[16px] font-semibold text-white">Report submitted</h3>
                <p className="max-w-sm text-[12.5px] text-white/70">
                  {ticket.ticketNo || ticket.id ? (
                    <>
                      Your ticket <span className="font-semibold text-white">{ticket.ticketNo || ticket.id}</span> has been created.{" "}
                    </>
                  ) : (
                    "Your report has been created. "
                  )}
                  We'll get back to you via {contactLabel}.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 rounded-md bg-[#c1121f] px-8 py-2.5 text-[13px] font-semibold text-white hover:bg-[#d4202d]"
                >
                  Done
                </button>
              </div>
            ) : (
              <ReportProblemForm form={form} onSubmit={form.submit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportProblemModal = ({ open, onClose, onCreated }) =>
  open ? createPortal(<Dialog onClose={onClose} onCreated={onCreated} />, document.body) : null;

export default ReportProblemModal;