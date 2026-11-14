
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import apiClient, { unwrap } from "@/services/api/apiClient";
import { getSocket } from "@/services/socket";
import { usersService } from "@/services/usersService";

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
    !["completed", "approved", "cancelled", "canceled", "rejected"].includes(status)
  );
};

export default function useSidebarCounts({
  isAdmin = false,
  showApprovals = false,
} = {}) {
  const { pathname } = useLocation();

  const [chatUnread, setChatUnread] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [meetingInvitations, setMeetingInvitations] = useState(0);
  const [newTasks, setNewTasks] = useState(0);
  const [pendingFinance, setPendingFinance] = useState(0);

  const onChatPage = useRef(false);
  const canLoadApprovals = isAdmin || showApprovals;

  onChatPage.current = /(^|\/)(admin\/)?chat(\/|$)/i.test(pathname);

  const loadChat = useCallback(async () => {
    try {
      const result = await unwrap(apiClient.get("/chat/unread"));
      const data = getData(result);

      setChatUnread(Math.max(0, Number(data?.total) || 0));
    } catch {
      // Keep the last available count.
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    if (!canLoadApprovals) return;

    try {
      const result = await usersService.pending();

      const rows = Array.isArray(result)
        ? result
        : result?.requests || result?.items || result?.users || [];

      setPendingApprovals(rows.length);
    } catch {
      // Keep the last available count.
    }
  }, [canLoadApprovals]);

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

    if (canLoadApprovals) loadApprovals();
    if (isAdmin) loadAdminTasks();
    if (!isAdmin) loadFinance();
  }, [
    canLoadApprovals,
    isAdmin,
    loadMeetings,
    loadApprovals,
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
    if (!canLoadApprovals) return undefined;

    const onApprovalsChanged = () => loadApprovals();

    window.addEventListener("approvals:changed", onApprovalsChanged);

    return () => {
      window.removeEventListener("approvals:changed", onApprovalsChanged);
    };
  }, [canLoadApprovals, loadApprovals]);

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
    socket.on("notification:new", onNotification);
    socket.on("connect", onConnect);

    return () => {
      socket.off("chat:notification", onChat);
      socket.off("chat:unread:changed", onChat);
      socket.off("notification:new", onNotification);
      socket.off("connect", onConnect);
    };
  }, [loadChat, refreshCounts]);

  return {
    chatUnread,
    pendingApprovals,
    meetingInvitations,
    newTasks,
    pendingFinance,
    refreshCounts,
  };
}
