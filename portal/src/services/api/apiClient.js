import axios from "axios";
import { tokenStore } from "./tokenStore";

const defaultBaseURL =
  typeof window !== "undefined" &&
  window.location.hostname.includes("digiamplify.com")
    ? "https://api.digiamplify.com/api/v1"
    : "http://localhost:5000/api/v1";

const baseURL = import.meta.env.VITE_API_URL || defaultBaseURL;

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      })
      .then((response) => {
        const token =
          response?.data?.data?.accessToken ||
          response?.data?.accessToken;

        if (!token) {
          throw new Error("Access token missing from refresh response.");
        }

        tokenStore.set(token);

        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== "undefined" &&
      config.data instanceof FormData;

    if (isFormData) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else if (
      config.data !== undefined &&
      config.data !== null &&
      !config.headers["Content-Type"] &&
      !config.headers["content-type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    const isAuthCall =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh");

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthCall
    ) {
      original._retry = true;

      try {
        const token = await refreshAccessToken();

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;

        return apiClient(original);
      } catch (refreshError) {
        tokenStore.clear();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }

        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Request failed";

    const err = new Error(message);

    err.status = status;
    err.errors = error.response?.data?.errors;
    err.response = error.response;

    return Promise.reject(err);
  }
);

export const unwrap = async (result) => {
  const response =
    result && typeof result.then === "function"
      ? await result
      : result;

  if (response == null) {
    return response;
  }

  if (
    typeof response === "object" &&
    "data" in response &&
    "status" in response &&
    "headers" in response
  ) {
    const body = response.data;

    if (
      body &&
      typeof body === "object" &&
      "data" in body
    ) {
      return body.data;
    }

    return body;
  }

  if (
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    return response.data;
  }

  return response;
};

export default apiClient;