import {
  AlertCircleIcon, BuildingIcon, CalendarIcon, CategoryIcon, CheckCircleIcon,
  CloseIcon, ExternalLinkIcon, PaperclipIcon, UserIcon,
} from "../Icons/Icons";
import StatusBadge from "../Statusbadge/Statusbadge";
import { formatCreated } from "../../Constants";

const PRIORITY_BADGE = {
  High: "border-red-700 bg-red-950/30 text-red-500",
  Medium: "border-amber-500 bg-amber-950/20 text-amber-400",
  Low: "border-emerald-600 bg-emerald-950/30 text-emerald-400",
};

function Field({ Icon, label, children }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-start gap-2 text-xs">
      <span className="flex items-center gap-2 text-neutral-300">
        <Icon width={13} height={13} className="shrink-0 text-red-500" />
        {label}
      </span>
      <div className="min-w-0 text-white">{children}</div>
    </div>
  );
}

export default function EscalationDetailPanel({ item, onClose, onStatusChange }) {
  if (!item) return null;
  const resolved = item.status === "Resolved";

  return (
    <aside className="w-full shrink-0 self-start rounded-md border border-[#222] bg-[#0b0b0b] p-4 lg:w-72">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white">
          <button type="button" onClick={onClose} aria-label="Close details" className="text-neutral-400 hover:text-white">
            <CloseIcon width={14} height={14} />
          </button>
          No# {item.id}
        </div>
        <span className={`rounded border px-3 py-0.5 text-[11px] ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
      </div>

      <div className="flex flex-col gap-4">
        <Field Icon={UserIcon} label="Employee">
          <div className="flex items-start gap-2">
            <p>{item.employee.name}</p>
          </div>
          <p className="text-[10px] text-neutral-500">{item.employee.role}</p>
        </Field>

        <Field Icon={BuildingIcon} label="Department">{item.department}</Field>
        <Field Icon={CategoryIcon} label="Category">{item.category}</Field>
        <Field Icon={AlertCircleIcon} label="Issue">
          <span className="text-[10px] leading-snug text-neutral-300">{item.issue}</span>
        </Field>

        <Field Icon={PaperclipIcon} label="Attachment">
          {item.document ? (
            <a
              href={item.document}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-400"
            >
              <ExternalLinkIcon width={13} height={13} /> Open
            </a>
          ) : (
            <span className="text-neutral-500">No attachment</span>
          )}
        </Field>

        <Field Icon={CheckCircleIcon} label="Status">
          <div className="-mt-0.5">
            <StatusBadge status={item.status} onChange={(s) => onStatusChange(item.id, s)} />
          </div>
        </Field>

        <Field Icon={CalendarIcon} label="Created">
          <span className="text-neutral-300">{formatCreated(item.createdAt)}</span>
        </Field>
      </div>

      <button
        type="button"
        disabled={resolved}
        onClick={() => onStatusChange(item.id, "Resolved")}
        className="mx-auto mt-6 flex items-center gap-2 rounded border border-emerald-700 px-4 py-2 text-xs text-white hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircleIcon width={14} height={14} className="text-emerald-500" />
        {resolved ? "Resolved" : "Mark Resolved"}
      </button>
    </aside>
  );
}
