import { CHAT_CONFIG } from "../modules/employee/chat/chat.config.js";

// Backend events: message:new, message:deleted, message:reaction,
// message:pinned, conversation:updated. Format: { type, payload }
export function connectChat({ onEvent, onStatus }) {
  if (!CHAT_CONFIG.WS_URL) return () => {};
  let ws;
  let retry = 0;
  let closed = false;
  let timer;

  const open = () => {
    const token = CHAT_CONFIG.getToken() || "";
    ws = new WebSocket(`${CHAT_CONFIG.WS_URL}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      retry = 0;
      onStatus?.("online");
    };
    ws.onmessage = (e) => {
      try {
        onEvent(JSON.parse(e.data));
      } catch {
        /* ignore bad frame */
      }
    };
    ws.onclose = () => {
      onStatus?.("offline");
      if (!closed) timer = setTimeout(open, Math.min(1000 * 2 ** retry++, 15000));
    };
    ws.onerror = () => ws.close();
  };

  open();
  return () => {
    closed = true;
    clearTimeout(timer);
    ws?.close();
  };
}