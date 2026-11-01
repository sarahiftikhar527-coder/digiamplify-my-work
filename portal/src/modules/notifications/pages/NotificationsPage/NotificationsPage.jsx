
import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Send,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useNotifications } from "../../data/notificationsData.js";
import useNotificationUser from "../../hooks/useNotificationUser.js";

import NotificationList from "../../components/NotificationList/NotificationList.jsx";
import NotificationDetailModal from "../../components/NotificationDetailModal/NotificationDetailModal.jsx";
import SendNotificationModal from "../../components/SendNotificationModal/SendNotificationModal.jsx";


const TABS = [
  { value: "all", label: "All" },
  { value: "HR & Admin", label: "HR & Admin" },
  { value: "Tasks", label: "Tasks" },
  { value: "Messages", label: "Messages" },
  { value: "System", label: "System" },
];

export default function NotificationsPage() {
  const { userId, isAdminRole } = useNotificationUser();

  const {
    items,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
    remove,
    clearAll,
    send,
  } = useNotifications(userId);

  const [activeTab, setActiveTab] = useState("all");
  const [showSendModal, setShowSendModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.tag === activeTab);
  }, [items, activeTab]);

  const runAction = async (action) => {
    setActionError("");
    setSuccessMessage("");
    setBusy(true);

    try {
      await action();
    } catch (err) {
      setActionError(err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendClose = (count) => {
    setShowSendModal(false);

    if (typeof count === "number" && count > 0) {
      setSuccessMessage(
        `Notification successfully sent to ${count} employee(s).`
      );
      refresh();
    }
  };

  const handleOpenItem = async (item) => {
    setSelected(item);

    if (!item.read) {
      try {
        await markRead(item.id);
        setSelected((current) =>
          current?.id === item.id
            ? { ...current, read: true }
            : current
        );
      } catch (err) {
        setActionError(err.message || "Unable to mark as read.");
      }
    }
  };

  const handleDelete = async (id) => {
    await runAction(async () => {
      await remove(id);
      setSelected((current) =>
        current?.id === id ? null : current
      );
    });
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-900/50 bg-red-950/30 text-red-400">
                <Bell size={21} />
              </span>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your latest updates and alerts.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction(refresh)}
              disabled={busy || loading}
              className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#101010] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {isAdminRole && (
              <button
                type="button"
                onClick={() => setShowSendModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#c1121f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a30f1a]"
              >
                <Send size={16} />
                Send Notification
              </button>
            )}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-sm text-gray-500">Total Notifications</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {items.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-sm text-gray-500">Unread</p>
            <p className="mt-3 text-3xl font-bold tabular-nums text-red-400">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-sm text-gray-500">Read</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {Math.max(items.length - unreadCount, 0)}
            </p>
          </div>
        </div>

        {(error || actionError) && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {actionError || error}
          </div>
        )}

        {successMessage && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-green-900/50 bg-green-950/20 p-4 text-sm text-green-300">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-7 overflow-hidden rounded-2xl border border-[#252525] bg-[#090909]">
          <div className="flex flex-col gap-4 border-b border-[#252525] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                    activeTab === tab.value
                      ? "border border-red-900/50 bg-red-950/30 text-red-300"
                      : "border border-transparent text-gray-500 hover:bg-[#151515] hover:text-gray-200"
                  }`}
                >
                  {tab.label}
                  {tab.value === "all" && (
                    <span className="ml-2 text-[11px] opacity-70">
                      {items.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runAction(markAllRead)}
                disabled={busy || unreadCount === 0}
                className="flex items-center gap-2 rounded-lg border border-[#292929] px-3 py-2 text-xs text-gray-300 transition hover:bg-[#171717] disabled:opacity-40"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>

              <button
                type="button"
                onClick={() => runAction(clearAll)}
                disabled={busy || items.length === 0}
                className="flex items-center gap-2 rounded-lg border border-[#292929] px-3 py-2 text-xs text-gray-400 transition hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 disabled:opacity-40"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>
          </div>

          <NotificationList
            items={filteredItems}
            loading={loading}
            onItemClick={handleOpenItem}
            onDelete={handleDelete}
            onMarkRead={markRead}
          />

          {busy && (
            <div className="flex items-center justify-center gap-2 border-t border-[#252525] py-3 text-xs text-gray-500">
              <LoaderCircle size={14} className="animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </div>

      {selected && (
        <NotificationDetailModal
          notification={selected}
          onClose={() => setSelected(null)}
          onMarkRead={(id) =>
            runAction(async () => {
              await markRead(id);
              setSelected((current) =>
                current?.id === id
                  ? { ...current, read: true }
                  : current
              );
            })
          }
          onMarkUnread={(id) =>
            runAction(async () => {
              await markUnread(id);
              setSelected((current) =>
                current?.id === id
                  ? { ...current, read: false }
                  : current
              );
            })
          }
          onDelete={handleDelete}
        />
      )}

      {showSendModal && (
        <SendNotificationModal
          onSend={send}
          onClose={handleSendClose}
        />
      )}
    </div>
  );
}