export const HELP_SUPPORT_CONFIG = {
  API_BASE_URL: (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api"),
  getToken: () => localStorage.getItem("token"),
};