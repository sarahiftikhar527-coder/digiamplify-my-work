
export const CLOCKIN_CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api/v1"),

  getToken: () => localStorage.getItem("token"),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },
};
