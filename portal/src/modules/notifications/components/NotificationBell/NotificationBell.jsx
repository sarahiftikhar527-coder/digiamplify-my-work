import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../data/notificationsData";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import NotificationDetailModal from "../NotificationDetailModal/NotificationDetailModal";

export default function NotificationBell({
  userId,
  viewAllPath = "/notifications",
  onNotificationClick,
}) {
  const {
    items,
    unreadCount,
    loading,
    markRead,
    markUnread,
    markAllRead,
    remove,
    clearAll,
  } = useNotifications(userId);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionError, setActionError] = useState("");

  const runAction = async (action) => {
    setActionError("");

    try {
      await action();
    } catch (error) {
      setActionError(error.message || "Action failed.");
    }
  };

  const openNotification = async (item) => {
    setSelected(item);
    setOpen(false);

    if (onNotificationClick) {
      onNotificationClick(item);
    }

    if (!item.read) {
      await runAction(() => markRead(item.id));
      setSelected((current) =>
        current?.id === item.id ? { ...current, read: true } : current
      );
    }
  };

  const deleteNotification = async (id) => {
    await runAction(() => remove(id));

    setSelected((current) => (current?.id === id ? null : current));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#292929] bg-[#111] text-gray-300 transition hover:border-[#555] hover:text-white"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c1121f] px-1 text-[10px] font-bold text-white ring-2 ring-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {actionError && (
        <div className="absolute right-0 top-12 z-[130] w-64 rounded-lg border border-red-900 bg-[#190b0b] p-3 text-xs text-red-300">
          {actionError}
        </div>
      )}

      {open && (
        <NotificationDropdown
          items={items}
          loading={loading}
          onClose={() => setOpen(false)}
          onMarkRead={(id) => runAction(() => markRead(id))}
          onMarkAll={() => runAction(markAllRead)}
          onDelete={deleteNotification}
          onClear={() => runAction(clearAll)}
          onNotificationClick={openNotification}
          onViewAll={() => {
            setOpen(false);
            window.location.assign(viewAllPath);
          }}
        />
      )}

      <NotificationDetailModal
        notification={selected}
        onClose={() => setSelected(null)}
        onMarkRead={(id) =>
          runAction(async () => {
            await markRead(id);
            setSelected((current) =>
              current?.id === id ? { ...current, read: true } : current
            );
          })
        }
        onMarkUnread={(id) =>
          runAction(async () => {
            await markUnread(id);
            setSelected((current) =>
              current?.id === id ? { ...current, read: false } : current
            );
          })
        }
        onDelete={deleteNotification}
      />
    </div>
  );
}