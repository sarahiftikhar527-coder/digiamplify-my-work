import { Trash2, Circle } from "lucide-react";
import { getIcon } from "../../data/notificationsData";

export default function NotificationItem({
  item,
  onClick,
  onDelete,
  onMarkRead,
  compact = false,
}) {
  const Icon = getIcon(item.type);

  const handleClick = async () => {
    if (!item.read && onMarkRead) {
      await onMarkRead(item.id);
    }

    onClick?.(item);
  };

  return (
    <div
      className={`group flex gap-3 border-b border-[#252525] px-4 py-4 transition hover:bg-white/[0.025] ${
        !item.read ? "bg-[#c1121f]/[0.035]" : ""
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 gap-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#333] bg-[#171717] text-[#ef4444]">
          <Icon size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="flex-1 text-sm font-semibold text-gray-100">
              {item.title}
            </span>
            {!item.read && (
              <Circle
                size={8}
                fill="currentColor"
                className="mt-1 shrink-0 text-red-500"
              />
            )}
          </span>

          <span className="mt-1 block text-sm leading-5 text-gray-400">
            {item.message}
          </span>

          {!compact && (
            <span className="mt-2 inline-block rounded-md border border-[#303030] px-2 py-1 text-[11px] text-gray-400">
              {item.tag}
            </span>
          )}

          <span className="mt-2 block text-xs text-gray-500">
            {item.time}
          </span>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          title="Delete notification"
          aria-label="Delete notification"
          className="h-8 shrink-0 rounded-lg p-2 text-gray-600 opacity-100 transition hover:bg-red-950/40 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}