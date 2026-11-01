import {
  X,
  CheckCheck,
  MailOpen,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { getIcon } from "../../data/notificationsData";

export default function NotificationDetailModal({
  notification,
  onClose,
  onMarkRead,
  onMarkUnread,
  onDelete,
}) {
  if (!notification) return null;

  const Icon = getIcon(notification.type);

  const handleOpenLink = () => {
    if (!notification.link) return;
    onClose?.();
    window.location.assign(notification.link);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#292929] bg-[#0d0d0d] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#252525] px-5 py-4">
          <span className="text-sm font-semibold text-gray-200">
            Notification Details
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 hover:bg-[#222] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#3a2527] bg-[#c1121f]/10 text-red-400">
              <Icon size={22} />
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold leading-6">
                {notification.title}
              </h2>
              <p className="mt-2 text-xs text-gray-500">
                {notification.time}
              </p>
              <span className="mt-2 inline-block rounded-md border border-[#303030] px-2 py-1 text-[11px] text-gray-400">
                {notification.tag}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#252525] bg-[#111] p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
              {notification.details || notification.message}
            </p>
          </div>

          {notification.link && (
            <button
              type="button"
              onClick={handleOpenLink}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c1121f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a30f1a]"
            >
              {notification.linkLabel || "Open"}
              <ExternalLink size={15} />
            </button>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#252525] pt-4">
            {notification.read ? (
              <button
                type="button"
                onClick={() => onMarkUnread?.(notification.id)}
                className="flex items-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-xs text-gray-300 hover:bg-[#1a1a1a]"
              >
                <MailOpen size={15} />
                Mark unread
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMarkRead?.(notification.id)}
                className="flex items-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-xs text-gray-300 hover:bg-[#1a1a1a]"
              >
                <CheckCheck size={15} />
                Mark as read
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete?.(notification.id)}
              className="flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30"
            >
              <Trash2 size={15} />
              Delete
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-lg border border-[#333] px-4 py-2 text-xs text-gray-300 hover:bg-[#1a1a1a]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}