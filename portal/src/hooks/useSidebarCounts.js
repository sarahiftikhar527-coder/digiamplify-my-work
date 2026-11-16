import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import apiClient, { unwrap } from "@/services/api/apiClient";
import { getSocket } from "@/services/socket";
import useApprovalCounts from "@/hooks/useApprovalCounts";

const CHAT_REFRESH_MS = 10000;
const COUNTS_REFRESH_MS = 20000;

const getData = (result) => result?.data ?? result ?? {};

const getTaskRows = (result) => {
  const data = getData(result);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.tasks)) return data.data.tasks;

  return [];
};

const isOpenTask = (task) => {
  const status = String(task?.status || "").toLowerCase();

  return (
    task?.isDone !== true &&
    ![
      "completed",
      "approved",
      "cancelled",
      "canceled",
      "rejected",
    ].includes(status)
  );
};

/*
  Adds up every count badge that appears in the sidebar menu.
  Used for the small number on the menu button, so people can see that
  something is waiting even while the sidebar is closed.
*/
export const getBadgeTotal = (navigation = [], counts = {}) => {
  let total = 0;

  for (const item of navigation) {
    if (item.badgeKey) total += Number(counts[item.badgeKey]) || 0;

    for (const child of item.children || []) {
      if (child.badgeKey) total += Number(counts[child.badgeKey]) || 0;
    }
  }

  return total;
};

export default function useSidebarCounts({
  isAdmin = false,
  showApprovals = false,
} = {}) {
  const { pathname } = useLocation();

  const [chatUnread, setChatUnread] = useState(0);
  const [meetingInvitations, setMeetingInvitations] = useState(0);
  const [newTasks, setNewTasks] = useState(0);
  const [pendingFinance, setPendingFinance] = useState(0);

  const onChatPage = useRef(false);

  const canLoadApprovals = isAdmin || showApprovals;

  // Signup approvals: admin + signup approvers.
  // Profile approvals: admin only.
  const approvals = useApprovalCounts({
    canSignup: canLoadApprovals,
    canProfile: isAdmin,
  });

  const refreshApprovals = approvals.refresh;

  onChatPage.current = /(^|\/)(admin\/)?chat(\/|$)/i.test(pathname);

  const loadChat = useCallback(async () => {
    try {
      const result = await unwrap(apiClient.get("/chat/unread"));
      const data = getData(result);

      // The server sends the total as "totalUnread" (also "unreadCount" and
      // "count"). Older versions used "total", so all names are accepted.
      const total = Number(
        data?.totalUnread ??
          data?.unreadCount ??
          data?.count ??
          data?.total ??
          0
      );

      setChatUnread(Math.max(0, total || 0));
    } catch {
      // Keep the last available count.
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    try {
      const result = await unwrap(apiClient.get("/meetings/summary"));
      const data = getData(result);

      setMeetingInvitations(
        Math.max(0, Number(data?.pendingInvites) || 0)
      );
    } catch {
      // Keep the last available count.
    }
  }, []);

  const loadAdminTasks = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const result = await unwrap(apiClient.get("/tasks/admin"));
      const tasks = getTaskRows(result);

      setNewTasks(tasks.filter(isOpenTask).length);
    } catch {
      // Keep the last available count.
    }
  }, [isAdmin]);

  const loadFinance = useCallback(async () => {
    if (isAdmin) return;

    try {
      const result = await unwrap(
        apiClient.get("/finance/me/pending-count")
      );

      const data = getData(result);
      const count = Number(
        data?.count ?? data?.pendingCount ?? data?.total ?? 0
      );

      setPendingFinance(Math.max(0, count));
    } catch {
      // Keep the last available count.
    }
  }, [isAdmin]);

  const refreshCounts = useCallback(() => {
    loadMeetings();

    if (canLoadApprovals) refreshApprovals();
    if (isAdmin) loadAdminTasks();
    if (!isAdmin) loadFinance();
  }, [
    canLoadApprovals,
    isAdmin,
    loadMeetings,
    refreshApprovals,
    loadAdminTasks,
    loadFinance,
  ]);

  useEffect(() => {
    loadChat();
  }, [loadChat, pathname]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts, pathname]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;

      loadChat();
      refreshCounts();
    };

    const timer = window.setInterval(tick, COUNTS_REFRESH_MS);

    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [loadChat, refreshCounts]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadChat();
    }, CHAT_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [loadChat]);

  useEffect(() => {
    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    const onChat = () => {
      if (onChatPage.current) {
        window.setTimeout(loadChat, 1500);
      } else {
        loadChat();
      }
    };

    const onNotification = () => {
      refreshCounts();
    };

    const onConnect = () => {
      loadChat();
      refreshCounts();
    };

    socket.on("chat:notification", onChat);
    socket.on("chat:unread:changed", onChat);
    socket.on("chat:message", onChat);
    socket.on("chat:message:read", onChat);
    socket.on("chat:conversation", onChat);
    socket.on("chat:conversation:removed", onChat);
    socket.on("notification:new", onNotification);
    socket.on("connect", onConnect);

    return () => {
      socket.off("chat:notification", onChat);
      socket.off("chat:unread:changed", onChat);
      socket.off("chat:message", onChat);
      socket.off("chat:message:read", onChat);
      socket.off("chat:conversation", onChat);
      socket.off("chat:conversation:removed", onChat);
      socket.off("notification:new", onNotification);
      socket.off("connect", onConnect);
    };
  }, [loadChat, refreshCounts]);

  return {
    chatUnread,
    pendingApprovals: approvals.total,
    pendingSignupApprovals: approvals.signup,
    pendingProfileApprovals: approvals.profile,
    meetingInvitations,
    newTasks,
    pendingFinance,
    refreshCounts,
  };
}