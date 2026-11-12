const USER_KEY = "digiamplify_user";
const TOKEN_KEY = "digiamplify_token";

export const CHAT_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api/v1"),
  WS_URL: "",
  POLL_INTERVAL: 5000,

  getToken() {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  },

  getUser() {
    try {
      const user =
        localStorage.getItem(USER_KEY) ||
        sessionStorage.getItem(USER_KEY) ||
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};

export default CHAT_CONFIG;