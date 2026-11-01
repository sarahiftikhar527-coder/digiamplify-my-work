import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, ChevronDown, MessageSquare, X } from 'lucide-react';

const EMPTY = [];

/**
 * Props:
 *  announcements - [{ id, title, description, content?, timeAgo, isRead?, author? }]
 *  loading       - boolean (skeleton dikhata hai)
 *  limit         - kitne items pehle dikhane hain (default 4)
 *  onMarkRead    - (id) => void           backend call yahan lagao
 *  onMarkAllRead - () => void             backend call yahan lagao
 *  onViewAll     - () => void             de do to "View all" page par le jayega,
 *                                         warna card ke andar expand hoga
 */
const AnnouncementsCard = ({
  announcements = EMPTY,
  loading = false,
  limit = 4,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
}) => {
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Backend se naya data aaye to sync
  useEffect(() => {
    setItems(announcements.map((a) => ({ ...a, isRead: a.isRead ?? false })));
  }, [announcements]);

  const unreadCount = items.filter((a) => !a.isRead).length;
  const visible = showAll ? items : items.slice(0, limit);
  const selected = items.find((a) => a.id === selectedId) || null;

  const markRead = (id) => {
    const target = items.find((a) => a.id === id);
    if (!target || target.isRead) return;
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    onMarkRead?.(id);
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((a) => ({ ...a, isRead: true })));
    onMarkAllRead?.();
  };

  const open = (a) => {
    setSelectedId(a.id);
    markRead(a.id);
  };

  // Escape se detail band
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    else setShowAll((s) => !s);
  };

  return (
    <div className="flex h-full flex-col rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-white">New Announcement</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <span className="text-[10px] text-red-600">{unreadCount} New</span>}
          {unreadCount > 0 && (
            <button
              type="button"
              title="Mark all as read"
              aria-label="Mark all as read"
              onClick={markAllRead}
              className="text-gray-400 transition hover:text-white"
            >
              <CheckCheck size={13} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <ul className={`mt-3 space-y-1 ${showAll ? 'max-h-72 overflow-y-auto pr-1' : ''}`}>
        {loading &&
          [1, 2, 3, 4].map((i) => (
            <li key={i} className="flex animate-pulse items-center gap-2.5 py-2">
              <span className="h-6 w-6 rounded bg-white/10" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-2/3 rounded bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-white/5" />
              </div>
            </li>
          ))}

        {!loading &&
          visible.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => open(a)}
                className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded px-2 py-2 text-left transition hover:bg-white/5"
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-900/70 bg-red-950/50 text-red-600">
                  <MessageSquare size={11} />
                  {!a.isRead && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#0b0b0b]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[11px] ${a.isRead ? 'text-gray-400' : 'font-medium text-white'}`}>
                    {a.title}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">{a.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-gray-400">{a.timeAgo}</span>
              </button>
            </li>
          ))}

        {!loading && items.length === 0 && (
          <li className="py-6 text-center text-xs text-gray-500">No announcements.</li>
        )}
      </ul>

      {/* View all / Show less */}
      {!loading && items.length > limit && (
        <button
          type="button"
          onClick={handleViewAll}
          className="mt-auto flex items-center justify-center gap-1 pt-3 text-[10px] text-gray-400 transition hover:text-white"
        >
          {showAll && !onViewAll ? 'Show less' : `View all (${items.length})`}
          <ChevronDown size={11} className={showAll && !onViewAll ? 'rotate-180' : ''} />
        </button>
      )}

      {/* Detail modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selected && (
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="announcement-title"
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 font-[Poppins,ui-sans-serif,system-ui,sans-serif] text-white shadow-2xl shadow-black"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-red-900/70 bg-red-950/50 text-red-600">
                        <MessageSquare size={14} />
                      </span>
                      <div>
                        <h2 id="announcement-title" className="text-sm font-semibold">
                          {selected.title}
                        </h2>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {selected.author ? `${selected.author} · ` : ''}
                          {selected.timeAgo}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setSelectedId(null)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#3a3a3a] text-white transition hover:border-red-700 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <p className="mt-5 whitespace-pre-line text-xs leading-relaxed text-gray-300">
                    {selected.content || selected.description}
                  </p>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="rounded-md bg-red-700 px-5 py-2 text-xs font-medium text-white transition hover:bg-red-600"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default AnnouncementsCard;