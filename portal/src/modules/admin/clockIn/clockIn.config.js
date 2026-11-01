export const CLOCKIN_CONFIG = {
  API_BASE_URL: "http://localhost:5000/api",
  getToken: () => localStorage.getItem("token"),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },
};