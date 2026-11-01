export const CHAT_CONFIG = {
  API_BASE_URL: "http://localhost:5000/api",
  WS_URL: "", // e.g. "ws://localhost:5000/ws/chat". Khali ho to polling use hogi
  POLL_INTERVAL: 5000,
  getToken: () => localStorage.getItem("token"),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },
};