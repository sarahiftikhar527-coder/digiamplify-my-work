import { useCallback, useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/context";
import {
  getMyProfile,
  PROFILE_CHANGED_EVENT,
} from "@/services/api/profileService";

const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

const extractAvatarUrl = (response) => {
  const body = response?.data ?? response;
  const profile = body?.data ?? body;

  return (
    profile?.avatarUrl ||
    profile?.user?.avatarUrl ||
    ""
  );
};

/**
 * Keeps the logged-in user's photo (topbar + sidebar) in sync with the
 * server. Runs on layout mount, when the profile is saved, when the tab
 * regains focus, and every 2 minutes (so an approved employee photo shows up).
 */
export default function useSyncProfileAvatar() {
  const auth = useContext(AuthContext);
  const updateAvatar = auth?.updateAvatar;
  const userId = auth?.user?.id || auth?.user?._id || "";
  const currentAvatar = auth?.user?.avatarUrl || "";

  const currentAvatarRef = useRef(currentAvatar);

  useEffect(() => {
    currentAvatarRef.current = currentAvatar;
  }, [currentAvatar]);

  const sync = useCallback(async () => {
    if (!userId || typeof updateAvatar !== "function") return;

    try {
      const response = await getMyProfile();
      const latest = extractAvatarUrl(response);

      if (latest !== currentAvatarRef.current) {
        currentAvatarRef.current = latest;
        updateAvatar(latest);
      }
    } catch (error) {
      // Not critical: the old photo / initials stay visible.
      console.error(
        "Unable to refresh profile photo:",
        error?.message
      );
    }
  }, [userId, updateAvatar]);

  useEffect(() => {
    if (!userId) return undefined;

    sync();

    const handleProfileChanged = () => sync();
    const handleFocus = () => sync();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };

    window.addEventListener(PROFILE_CHANGED_EVENT, handleProfileChanged);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    const timer = window.setInterval(sync, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, handleProfileChanged);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(timer);
    };
  }, [userId, sync]);
}