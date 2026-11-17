
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Send, X } from 'lucide-react';
import apiClient from '@/services/api/apiClient.js';

const POLL_MS = 8000;
const MAX_LENGTH = 2000;

const getError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const fmtTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const initials = (name) =>
  String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export function TaskChatPanel({ taskId, taskTitle, onClose, onRead }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastCount = useRef(0);

  const load = useCallback(
    async (silent) => {
      try {
        const response = await apiClient.get(`/tasks/${taskId}/comments`);
        const comments = response?.data?.comments || [];

        setMessages(comments);
        setError('');

        await apiClient.post(`/tasks/${taskId}/comments/read`);
        onRead?.();
      } catch (err) {
        if (!silent) setError(getError(err, 'Unable to load the chat.'));
      } finally {
        setLoading(false);
      }
    },
    [taskId, onRead]
  );

  useEffect(() => {
    load(false);
    const timer = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await apiClient.post(`/tasks/${taskId}/comments`, {
        body,
      });

      const created = response?.data?.comment;
      if (created) {
        setMessages((list) => [...list, created]);
      }

      setText('');
    } catch (err) {
      setError(getError(err, 'Message could not be sent.'));
    } finally {
      setSending(false);
    }
  };

  const remove = async (message) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await apiClient.delete(
        `/tasks/${taskId}/comments/${message.id}`
      );

      setMessages((list) =>
        list.filter((item) => item.id !== message.id)
      );
    } catch (err) {
      setError(getError(err, 'Message could not be deleted.'));
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-black/60"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close chat"
        className="flex-1 cursor-default"
        onClick={onClose}
      />

      <aside className="flex h-full w-full max-w-md flex-col border-l border-[#1e1e1e] bg-[#0b0b0b]">
        <header className="flex items-start justify-between gap-3 border-b border-[#1e1e1e] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Task chat
            </p>
            <h3 className="truncate text-sm font-semibold text-white">
              {taskTitle || 'Task'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Loading chat...
            </p>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No messages yet. Ask your question about this task below.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.isMine ? 'flex-row-reverse' : ''
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-gray-200">
                  {initials(message.author?.name)}
                </span>

                <div
                  className={`max-w-[80%] ${
                    message.isMine ? 'text-right' : ''
                  }`}
                >
                  <p className="mb-0.5 text-[11px] text-gray-500">
                    {message.isMine
                      ? 'You'
                      : message.author?.name || 'Unknown'}
                    {' · '}
                    {fmtTime(message.createdAt)}

                    {message.isMine && (
                      <button
                        type="button"
                        onClick={() => remove(message)}
                        className="ml-2 text-gray-600 hover:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </p>

                  <p
                    className={`inline-block whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm ${
                      message.isMine
                        ? 'bg-primary text-white'
                        : 'bg-[#161616] text-gray-200'
                    }`}
                  >
                    {message.body}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="mx-4 mb-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-end gap-2 border-t border-[#1e1e1e] p-3">
          <textarea
            rows={2}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Write a message... (Enter to send)"
            className="flex-1 resize-none rounded-md border border-[#262626] bg-[#111] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-primary"
          />

          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="rounded-md bg-primary p-2.5 text-white hover:bg-primary-light disabled:opacity-50"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

export default function TaskChatButton({
  taskId,
  taskTitle,
  size = 16,
  className = 'rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white',
}) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/tasks/${taskId}/comments/unread-count`
      );

      setUnreadCount(
        Math.max(0, Number(response?.data?.unreadCount) || 0)
      );
    } catch {
      // Keep the current badge value if the request temporarily fails.
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId || open) {
      if (open) setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    const timer = window.setInterval(
      loadUnreadCount,
      POLL_MS
    );

    return () => window.clearInterval(timer);
  }, [taskId, open, loadUnreadCount]);

  if (!taskId) return null;

  return (
    <>
      <button
        type="button"
        title={
          unreadCount > 0
            ? `Chat - ${unreadCount} unread message${
                unreadCount === 1 ? '' : 's'
              }`
            : 'Chat about this task'
        }
        aria-label={
          unreadCount > 0
            ? `Chat, ${unreadCount} unread messages`
            : 'Chat about this task'
        }
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className={`relative ${className}`}
      >
        <MessageSquare size={size} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border border-[#0d0d0d] bg-red-600 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <TaskChatPanel
          taskId={taskId}
          taskTitle={taskTitle}
          onClose={() => setOpen(false)}
          onRead={handleRead}
        />
      )}
    </>
  );
}
