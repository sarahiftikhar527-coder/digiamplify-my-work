import { ExternalLinkIcon } from "../Icons/Icons";
import StatusBadge from "../Statusbadge/Statusbadge";
import { PRIORITY_TEXT, formatSubmitted } from "../../Constants";

export default function EscalationRow({ item, selected, onSelect, onStatusChange }) {
  const { employee } = item;

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      className={`grid cursor-pointer grid-cols-[1.5fr_1fr_1.9fr_0.8fr_0.9fr_1.1fr_1.4fr] items-center gap-2 border-t border-[#1f1f1f] px-4 py-3 text-xs outline-none transition-colors hover:bg-neutral-900/60 focus-visible:bg-neutral-900 ${
        selected ? "bg-neutral-900/80" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {employee.avatar ? (
          <img src={employee.avatar} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-full bg-neutral-300" />
        )}
        <div className="min-w-0">
          <p className="truncate text-white">{employee.name}</p>
          <p className="truncate text-[10px] text-neutral-500">{employee.role}</p>
        </div>
      </div>

      <p className="truncate text-center text-white">{item.category}</p>

      <div className="min-w-0">
        <p className="truncate font-medium text-white">{item.subject}</p>
        <p className="truncate text-[10px] text-neutral-500">{item.description}</p>
      </div>

      <p className={`text-center ${PRIORITY_TEXT[item.priority]}`}>{item.priority}</p>

      <div className="flex justify-center">
        {item.document ? (
          <a
            href={item.document}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open document"
            onClick={(e) => e.stopPropagation()}
            className="text-white hover:text-red-400"
          >
            <ExternalLinkIcon width={14} height={14} />
          </a>
        ) : (
          <span className="text-neutral-500">–</span>
        )}
      </div>

      <p className="text-center text-white">{formatSubmitted(item.submittedAt)}</p>

      <div className="flex justify-center">
        <StatusBadge status={item.status} onChange={(s) => onStatusChange(item.id, s)} />
      </div>
    </div>
  );
}
