
import { useCallback, useEffect, useState } from "react";
import { clockInService } from "../services/clockInService.js";
import apiClient from "../services/api/apiClient.js";
import { getSocket } from "../services/socket.js";

const POLL_INTERVAL_MS = 30000;

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== "string") return "";

  const value = avatarUrl.trim();

  if (!value) return "";

  try {
    return new URL(
      value,
      apiClient.defaults.baseURL || window.location.origin
    ).href;
  } catch {
    return value;
  }
};

const upsertMember = (list, member) => {
  const index = list.findIndex(
    (item) => item.userId === member.userId
  );

  if (index === -1) {
    return [
      ...list,
      {
        ...member,
        avatarUrl: resolveAvatarUrl(member.avatarUrl),
      },
    ];
  }

  const next = [...list];
  const existingMember = next[index];

  next[index] = {
    ...existingMember,
    ...member,
    avatarUrl: resolveAvatarUrl(
      member.avatarUrl || existingMember.avatarUrl
    ),
  };

  return next;
};

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

          const nextMembers = (
            Array.isArray(data?.members) ? data.members : []
          ).map((member) => ({
            ...member,
            avatarUrl: resolveAvatarUrl(member.avatarUrl),
            receivedAt,
          }));

          setMembers(nextMembers);
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(load, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

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
        upsertMember(prev, {
          ...member,
          receivedAt: Date.now(),
        })
      );
    };

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

  return {
    members,
    meId,
    loading,
    error,
    reload: load,
  };
}
