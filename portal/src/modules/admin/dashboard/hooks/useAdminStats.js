
import { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function useAdminStats(refreshMs = 60000) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("digiamplify_token");

      if (!API_URL) {
        throw new Error(
          "API URL is not configured. Please check your portal .env file."
        );
      }

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      const res = await fetch(`${API_URL}/dashboard/admin/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let result;

      try {
        result = await res.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        if (res.status === 403) {
          throw new Error(
            "You are not authorized to access dashboard statistics."
          );
        }

        throw new Error(
          result?.message || "Failed to load dashboard statistics."
        );
      }

      const data = result.data ?? result;
      const receivedStats = data.stats;

      if (!Array.isArray(receivedStats)) {
        throw new Error(
          "Dashboard API response format is incorrect."
        );
      }

      setStats(receivedStats);
      setError(null);
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const id = setInterval(() => {
      load();
    }, refreshMs);

    return () => clearInterval(id);
  }, [load, refreshMs]);

  return {
    stats,
    loading,
    error,
    reload: load,
  };
}
