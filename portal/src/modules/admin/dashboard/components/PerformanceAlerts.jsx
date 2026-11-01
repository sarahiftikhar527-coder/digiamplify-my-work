
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import Card from "@/modules/admin/shared/ui/Card";

const tones = {
  red: "border-red-500 text-red-500 bg-red-500/10",
  amber: "border-orange-500 text-orange-500 bg-orange-500/10",
  green: "border-green-500 text-green-500 bg-green-500/10",
};

const severityLabel = {
  red: "High",
  amber: "Medium",
  green: "Resolved",
};

function getSeverity(tone) {
  return tones[tone] ? tone : "red";
}

function AlertModal({ alert, onClose, onAction }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const tone = alert.resolved ? "green" : getSeverity(alert.tone);
  const Icon = tone === "green" ? CheckCircle2 : AlertTriangle;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-alert-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#0a0a0a] p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${tones[tone]}`}
          >
            <Icon size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <h3
              id="performance-alert-title"
              className="text-base font-medium text-white"
            >
              {alert.title}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {alert.desc || "No additional description available."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close alert details"
            className="rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-white/10 p-3 text-xs sm:grid-cols-3">
          <div>
            <p className="text-gray-500">Severity</p>
            <p className={`mt-1 font-medium ${tones[tone].split(" ")[1]}`}>
              {severityLabel[tone]}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Category</p>
            <p className="mt-1 text-gray-100">
              {alert.category || "Performance"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-gray-100">
              {alert.resolved ? "Resolved" : "Needs attention"}
            </p>
          </div>
        </div>

        {alert.details && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-medium text-white">Details</p>
            <p className="text-xs leading-relaxed text-gray-300">
              {alert.details}
            </p>
          </div>
        )}

        {Array.isArray(alert.affected) && alert.affected.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-white">
              Affected records
            </p>
            <ul className="space-y-1.5">
              {alert.affected.map((item, index) => (
                <li
                  key={`${alert.id}-${index}`}
                  className="flex items-start gap-2 text-xs text-gray-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>
                    {typeof item === "string"
                      ? item
                      : item?.name || item?.title || item?.email || "Record"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(alert.steps) && alert.steps.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-white">
              Recommended actions
            </p>
            <ol className="space-y-1.5">
              {alert.steps.map((step, index) => (
                <li
                  key={`${alert.id}-step-${index}`}
                  className="flex gap-2 text-xs text-gray-300"
                >
                  <span className="text-gray-500">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => onAction?.(alert)}
            className="rounded-md border border-white/20 px-4 py-1.5 text-xs text-gray-200 transition hover:border-red-500 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function PerformanceAlerts({
  alerts = [],
  onAction,
  onView,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const items = Array.isArray(alerts) ? alerts : [];

  useEffect(() => {
    if (
      selectedId !== null &&
      !items.some((alert) => String(alert.id) === String(selectedId))
    ) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const selected =
    items.find((alert) => String(alert.id) === String(selectedId)) || null;

  const openDetails = (alert) => {
    setSelectedId(alert.id);
    onView?.(alert);
  };

  return (
    <>
      <Card title="Performance Alerts">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-gray-500" size={24} />
            <p className="text-sm text-gray-300">No active alerts</p>
            <p className="mt-1 text-xs text-gray-500">
              Alerts will appear when the backend reports tasks overdue or
              progress reports requiring review.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((alert, index) => {
              const tone = alert.resolved
                ? "green"
                : getSeverity(alert.tone);

              const Icon =
                tone === "green" ? CheckCircle2 : AlertTriangle;

              return (
                <li
                  key={alert.id ?? `${alert.title}-${index}`}
                  className="flex flex-wrap items-center gap-3 sm:flex-nowrap"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${tones[tone]}`}
                  >
                    <Icon size={15} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-100">
                      {alert.title || "Performance alert"}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {alert.desc || "Review the related records."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetails(alert)}
                    className="w-full rounded-md border border-white/20 px-3 py-1.5 text-[11px] text-gray-200 transition hover:border-red-500 hover:text-white sm:w-auto sm:whitespace-nowrap"
                  >
                    View Details
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {selected && (
        <AlertModal
          alert={selected}
          onClose={() => setSelectedId(null)}
          onAction={(alert) => {
            onAction?.(alert);
            setSelectedId(null);
          }}
        />
      )}
    </>
  );
}
