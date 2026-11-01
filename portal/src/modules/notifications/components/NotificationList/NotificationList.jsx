import { Bell, LoaderCircle } from "lucide-react";
import NotificationItem from "../NotificationItem/NotificationItem.jsx";

export default function NotificationList({
  items = [],
  loading = false,
  onItemClick,
  onDelete,
  onMarkRead,
  compact = false,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-gray-500">
        <LoaderCircle size={24} className="animate-spin" />
        <p className="text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#292929] bg-[#111] text-gray-500">
          <Bell size={22} />
        </span>
        <p className="mt-3 text-sm font-medium text-gray-300">
          No notifications
        </p>
        <p className="mt-1 text-xs text-gray-500">
          New notifications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          compact={compact}
          onClick={onItemClick}
          onDelete={onDelete}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}