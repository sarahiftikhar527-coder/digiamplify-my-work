import { useCallback, useEffect, useRef, useState } from "react";
import { teamAttendanceService } from "@/services/teamAttendanceService";
import { getSocket } from "@/services/socket";

/**
 * Loads the live team board and keeps it fresh.
 * - Refreshes instantly when somebody clocks in / out (socket event).
 * - Polls every `intervalMs` while the browser tab is visible (today only).
 * - Ignores responses from outdated requests (fast date changes).
 */
export default function useTeamLive({ date = "", intervalMs = 15000 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const requestId = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current;

      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const payload = await teamAttendanceService.getLive(
          date ? { date } : {}
        );

        if (id !== requestId.current) return;

        setData(payload);
        setError("");
        setUpdatedAt(new Date());
      } catch (err) {
        if (id !== requestId.current) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load the live team status."
        );
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [date]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // A past date never changes, so only "today" is polled.
    if (date) return undefined;

    const tick = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };

    const timer = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [date, intervalMs, load]);

  // Real-time: as soon as anybody clocks in, clocks out or takes a break
  // the server sends an event and the board reloads (today only).
  useEffect(() => {
    if (date) return undefined;

    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    let timer = null;

    // Several events in a row are merged into one reload.
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => load({ silent: true }), 400);
    };

    socket.on("attendance:team-update", refresh);
    socket.on("attendance:live-update", refresh);
    socket.on("connect", refresh);

    return () => {
      clearTimeout(timer);
      socket.off("attendance:team-update", refresh);
      socket.off("attendance:live-update", refresh);
      socket.off("connect", refresh);
    };
  }, [date, load]);

  const reload = useCallback(() => load(), [load]);

  return { data, loading, refreshing, error, updatedAt, reload };
}