import { useCallback, useEffect, useState } from "react";
import { clockInService } from "../services/clockInService.js";
import { getSocket } from "../services/socket.js";

// If the live connection is down, the board still refreshes this often.
const POLL_INTERVAL_MS = 30000;

// Adds or replaces one member in the list.
const upsertMember = (list, member) => {
  const index = list.findIndex((item) => item.userId === member.userId);

  if (index === -1) return [...list, member];

  const next = [...list];
  next[index] = member;
  return next;
};

// Loads today's team attendance and keeps it live.
// Every member carries `receivedAt` (browser time when the data arrived),
// which the card uses to keep the "worked" timers ticking.
export default function useTeamAttendance() {
  const [members, setMembers] = useState([]);
  const [meId, setMeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      clockInService
        .getTeamToday()
        .then((data) => {
          const receivedAt = Date.now();

          setMembers(
            (Array.isArray(data?.members) ? data.members : []).map(
              (member) => ({ ...member, receivedAt })
            )
          );
          setMeId(data?.meId || "");
          setError("");
        })
        .catch((err) =>
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Team attendance could not be loaded."
          )
        )
        .finally(() => setLoading(false)),
    []
  );

  // First load.
  useEffect(() => {
    load();
  }, [load]);

  // Fallback refresh, and refresh when the tab becomes visible again.
  useEffect(() => {
    const timer = setInterval(load, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Real-time updates: when anybody clocks in, clocks out or takes a break,
  // the server pushes that person's new status to everyone.
  useEffect(() => {
    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    const onUpdate = (member) => {
      if (!member?.userId) return;

      setMembers((prev) =>
        upsertMember(prev, { ...member, receivedAt: Date.now() })
      );
    };

    // After a reconnect, reload everything to catch what was missed.
    const onConnect = () => {
      load();
    };

    socket.on("attendance:team-update", onUpdate);
    socket.on("connect", onConnect);

    return () => {
      socket.off("attendance:team-update", onUpdate);
      socket.off("connect", onConnect);
    };
  }, [load]);

  return { members, meId, loading, error, reload: load };
}