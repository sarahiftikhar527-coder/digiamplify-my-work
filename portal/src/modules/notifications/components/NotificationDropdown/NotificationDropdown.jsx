import { useMemo, useState } from "react";
import { CheckCheck, Trash2, ArrowRight, X } from "lucide-react";
import NotificationList from "../NotificationList/NotificationList";

export default function NotificationDropdown({
  items = [],
  loading = false,
  onClose,
  onMarkRead,
  onMarkAll,
  onDelete,
  onClear,
  onViewAll,
  onNotificationClick,
}) {
  const [tab, setTab] = useState("all");

  const filteredItems = useMemo(
    () =>
      tab === "unread"
        ? items.filter((item) => !item.read)
        : items,
    [items, tab]
  );

  return (
    <div className="absolute right-0 top-full z-[100] mt-3 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-[#292929] bg-[#0d0d0d] text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#252525] px-4 py-4">
        <div>
          <h3 className="text-base font-semibold">Notifications</h3>
          <p className="mt-1 text-xs text-gray-500">
            Your latest updates
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="rounded-lg p-2 text-gray-400 hover:bg-[#202020] hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-[#252525] px-4 py-3">
        <div className="flex gap-1 rounded-lg bg-[#151515] p-1">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === item.id
                  ? "bg-[#292929] text-white"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onMarkAll}
          title="Mark all as read"
          className="rounded-lg p-2 text-gray-400 hover:bg-[#202020] hover:text-white"
        >
          <CheckCheck size={16} />
        </button>
      </div>

      <div className="max-h-[min(60vh,480px)] overflow-y-auto">
        <NotificationList
          items={filteredItems.slice(0, 8)}
          loading={loading}
          onItemClick={onNotificationClick}
          onDelete={onDelete}
          onMarkRead={onMarkRead}
          compact
        />
      </div>

      <div className="flex items-center justify-between border-t border-[#252525] p-3">
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-red-950/30 hover:text-red-400"
        >
          <Trash2 size={14} />
          Clear all
        </button>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}