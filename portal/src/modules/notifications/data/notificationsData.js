import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  UserPlus,
  ClipboardList,
  MessageSquare,
  UserCog,
  CalendarCheck,
  Users,
  Megaphone,
  Settings,
} from "lucide-react";
import apiClient, { unwrap } from "../../../services/api/apiClient.js";
import { useAuth } from "../../../context/AuthContext/AuthContext/AuthContext.jsx";
import { getSocket } from "../../../services/socket.js";

const ICONS = {
  employee: UserPlus,
  task: ClipboardList,
  message: MessageSquare,
  profile: UserCog,
  leave: CalendarCheck,
  meeting: Users,
  announcement: Megaphone,
  system: Settings,
};

export const getIcon = (type) => ICONS[type] || Bell;

export const PURPOSES = [
  { value: "announcement", label: "Announcement", tag: "HR & Admin" },
  { value: "task", label: "Task Assignment", tag: "Tasks" },
  { value: "meeting", label: "Meeting / Reminder", tag: "HR & Admin" },
  { value: "message", label: "Message", tag: "Messages" },
  { value: "system", label: "System Alert", tag: "System" },
];

export const DEFAULT_PREFS = [
  { key: "email", label: "Email Notifications", on: true },
  { key: "push", label: "Push Notifications", on: true },
  { key: "tasks", label: "Task Reminders", on: true },
  { key: "system", label: "System Alerts", on: true },
];

async function getData(request) {
  const result = await unwrap(request);
  return result?.data ?? result;
}

function normalizeNotification(item) {
  const createdAt = item.createdAt || item.updatedAt || null;
  let time = "Recently";

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      time = date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return {
    ...item,
    id: String(item.id || item._id),
    type: item.type || "system",
    tag: item.tag || "System",
    title: item.title || "Notification",
    message: item.message || "",
    details: item.details || item.message || "",
    read: Boolean(item.read),
    time,
    createdAt,
    link: item.link || "",
    linkLabel: item.linkLabel || "",
  };
}

export function useNotificationEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getData(
        apiClient.get("/notifications/employees")
      );

      const list = Array.isArray(result)
        ? result
        : result?.items || result?.employees || [];

      setEmployees(
        list.map((employee) => ({
          id: String(employee.id || employee._id),
          name:
            employee.name ||
            employee.fullName ||
            employee.email ||
            "Employee",
          email: employee.email || "",
          role: employee.role || "employee",
        }))
      );
    } catch (error) {
      setEmployees([]);
      setError(error.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

    // Update the bell live when a new notification arrives, or when another part
  // of the app marked notifications as read.
  useEffect(() => {
    if (!authenticatedId) return undefined;

    const socket = getSocket();
    const reload = () => refresh();

    socket.on("notification:new", reload);
    window.addEventListener("notifications:changed", reload);

    return () => {
      socket.off("notification:new", reload);
      window.removeEventListener("notifications:changed", reload);
    };
  }, [authenticatedId, refresh]);
  

  return {
    employees,
    loading,
    error,
    refreshEmployees,
  };
}

export function useNotifications(userId) {
  const { user: authUser } = useAuth();

  const authenticatedId = String(
    authUser?._id || authUser?.id || userId || ""
  );

  const role = String(authUser?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const [items, setItems] = useState([]);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!authenticatedId) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getData(
        apiClient.get("/notifications", {
          params: { page: 1, limit: 200 },
        })
      );

      const list = Array.isArray(result)
        ? result
        : result?.items || [];

      const normalized = list.map(normalizeNotification);

      setItems(normalized);
      setUnreadCount(
        typeof result?.unreadCount === "number"
          ? result.unreadCount
          : normalized.filter((item) => !item.read).length
      );
    } catch (error) {
      setError(error.message || "Unable to load notifications.");
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [authenticatedId]);

  const refreshPreferences = useCallback(async () => {
    if (!authenticatedId) return;

    try {
      const result = await getData(
        apiClient.get("/notifications/preferences")
      );

      const saved = result?.items || [];

      setPrefs(
        DEFAULT_PREFS.map((defaultPref) => {
          const stored = saved.find(
            (item) => item.key === defaultPref.key
          );

          return stored
            ? { ...defaultPref, on: Boolean(stored.on) }
            : defaultPref;
        })
      );
    } catch {
      setPrefs(DEFAULT_PREFS);
    }
  }, [authenticatedId]);

  useEffect(() => {
    refresh();
    refreshPreferences();
  }, [refresh, refreshPreferences]);

  const markRead = useCallback(
    async (id) => {
      await apiClient.patch(
        `/notifications/${encodeURIComponent(id)}/read`
      );
      await refresh();
    },
    [refresh]
  );

  const markUnread = useCallback(
    async (id) => {
      await apiClient.patch(
        `/notifications/${encodeURIComponent(id)}/unread`
      );
      await refresh();
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    await apiClient.patch("/notifications/read-all");
    await refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id) => {
      await apiClient.delete(
        `/notifications/${encodeURIComponent(id)}`
      );
      await refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await apiClient.delete("/notifications");
    await refresh();
  }, [refresh]);

  const togglePref = useCallback(
    async (key) => {
      const current = prefs.find((item) => item.key === key);
      if (!current) return;

      const on = !current.on;

      await apiClient.patch(
        `/notifications/preferences/${encodeURIComponent(key)}`,
        { on }
      );

      setPrefs((previous) =>
        previous.map((item) =>
          item.key === key ? { ...item, on } : item
        )
      );
    },
    [prefs]
  );

  const send = useCallback(
    async ({ to, purpose, title, details }) => {
      if (!isAdmin) {
        throw new Error("Only an admin can send notifications.");
      }

      const cleanTitle = String(title || "").trim();
      const cleanDetails = String(details || "").trim();

      if (!cleanTitle || !cleanDetails) {
        throw new Error("Title and description are required.");
      }

      if (
        to !== "all" &&
        (!Array.isArray(to) || to.length === 0)
      ) {
        throw new Error("Please select at least one employee.");
      }

      const result = await getData(
        apiClient.post("/notifications", {
          to,
          purpose,
          title: cleanTitle,
          details: cleanDetails,
        })
      );

      await refresh();

      return Number(result?.count ?? 0);
    },
    [isAdmin, refresh]
  );

  const unreadItems = useMemo(
    () => items.filter((item) => !item.read),
    [items]
  );

  return {
    items,
    unreadItems,
    unreadCount,
    prefs,
    user: authUser || null,
    isAdmin,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
    remove,
    clearAll,
    togglePref,
    send,
  };
}