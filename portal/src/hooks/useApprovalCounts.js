import { useCallback, useEffect, useState } from "react";
import { usersService } from "@/services/usersService";
import { getChangeRequestCount } from "@/services/api/profileService";
import { getSocket } from "@/services/socket";

const REFRESH_MS = 20000;

/*
  Pending approval counts, kept up to date by itself.

  - signup  : people waiting to join (admin + signup approvers)
  - profile : employee profile edits waiting for an admin (admin only)
  - total   : signup + profile

  It refreshes when:
    - the screen first opens
    - every 20 seconds while the tab is visible
    - an approval is approved / rejected (the "approvals:changed" event)
    - the server pushes a new notification over the socket
*/
export default function useApprovalCounts({
  canSignup = false,
  canProfile = false,
} = {}) {
  const [signup, setSignup] = useState(0);
  const [profile, setProfile] = useState(0);

  const loadSignup = useCallback(async () => {
    if (!canSignup) {
      setSignup(0);
      return;
    }

    try {
      const rows = await usersService.pending();
      setSignup(Array.isArray(rows) ? rows.length : 0);
    } catch {
      // Keep the last available count.
    }
  }, [canSignup]);

  const loadProfile = useCallback(async () => {
    if (!canProfile) {
      setProfile(0);
      return;
    }

    try {
      const response = await getChangeRequestCount();
      setProfile(Math.max(0, Number(response?.data?.count) || 0));
    } catch {
      // Keep the last available count.
    }
  }, [canProfile]);

  const refresh = useCallback(() => {
    loadSignup();
    loadProfile();
  }, [loadSignup, loadProfile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!canSignup && !canProfile) return undefined;

    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const timer = window.setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [canSignup, canProfile, refresh]);

  useEffect(() => {
    if (!canSignup && !canProfile) return undefined;

    window.addEventListener("approvals:changed", refresh);

    return () => {
      window.removeEventListener("approvals:changed", refresh);
    };
  }, [canSignup, canProfile, refresh]);

  useEffect(() => {
    if (!canSignup && !canProfile) return undefined;

    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    socket.on("notification:new", refresh);
    socket.on("connect", refresh);

    return () => {
      socket.off("notification:new", refresh);
      socket.off("connect", refresh);
    };
  }, [canSignup, canProfile, refresh]);

  return {
    signup,
    profile,
    total: signup + profile,
    refresh,
  };
}