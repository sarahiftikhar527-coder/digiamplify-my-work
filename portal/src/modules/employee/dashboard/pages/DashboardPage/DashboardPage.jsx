
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WelcomeHeader,
  TaskStatsCards,
  TaskFilterTabs,
  TaskTable,
  TaskPagination,
  PerformanceOverview,
  UpcomingTasksCalendar,
  AttendanceOverview,
  AnnouncementsCard,
  LeaveBalance,
  QuickActions,
} from "../../components";
import { mockDashboard } from "./mockData";
import apiClient from "../../../../../services/api/apiClient";

const PAGE_SIZE = 4;
const TABS = ["All", "Today", "Upcoming", "Completed"];

const pad = (value) => String(value).padStart(2, "0");

const todayISO = () => {
  const date = new Date();

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const getUserName = (user) => {
  if (!user) return "";

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.name ||
    user.fullName ||
    fullName ||
    user.username ||
    user.email?.split("@")[0] ||
    ""
  );
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").trim().toLowerCase();

  if (["todo", "to do", "pending"].includes(value)) return "pending";

  if (["in progress", "inprogress", "in-progress"].includes(value)) {
    return "in-progress";
  }

  if (["done", "approved", "completed"].includes(value)) {
    return "completed";
  }

  return value;
};

const normalizeDate = (value) => {
  if (!value) return "";

  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);

  if (match) return match[0];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const normalizeTask = (task) => {
  const rawDueDate = task.dueDate || task.deadline || task.date || "";

  return {
    ...task,
    id: task._id || task.id,
    status: normalizeStatus(task.status),
    dueDate: normalizeDate(rawDueDate),
  };
};

const getApiMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? {};

const getList = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const formatTimeAgo = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeAnnouncement = (announcement) => {
  const createdBy =
    announcement.createdBy ||
    announcement.author ||
    announcement.createdByUser ||
    null;

  const message =
    announcement.message ||
    announcement.content ||
    announcement.description ||
    "";

  return {
    ...announcement,
    id: String(announcement._id || announcement.id || ""),
    title: announcement.title || "Announcement",
    description: message,
    content: message,
    author:
      typeof createdBy === "string"
        ? createdBy
        : getUserName(createdBy) || "Admin",
    timeAgo: formatTimeAgo(
      announcement.createdAt || announcement.publishedAt
    ),
    isRead: Boolean(announcement.isRead),
  };
};

const normalizeLeave = (leave) => ({
  ...leave,
  id: leave.id || leave._id,
  type: leave.type || leave.leaveType,
  from: normalizeDate(leave.from || leave.startDate),
  to: normalizeDate(leave.to || leave.endDate),
  status: String(leave.status || "pending").toLowerCase(),
  remarks: leave.remarks || leave.adminComment || "",
  appliedOn: normalizeDate(leave.appliedOn || leave.createdAt),
});

const normalizeBalance = (balance) => ({
  name: balance.name || balance.type || balance.leaveType,
  total: Number(balance.total ?? balance.entitlement ?? 0),
  used: Number(balance.used ?? 0),
});

const card =
  "min-w-0 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4";

const DashboardPage = () => {
  const data = mockDashboard;

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [taskActionError, setTaskActionError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [tab, setTab] = useState("Today");
  const [page, setPage] = useState(1);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");

  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveError, setLeaveError] = useState("");
  const [leaveActionLoading, setLeaveActionLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const results = await Promise.allSettled([
        apiClient.get("/tasks/employee"),
        apiClient.get("/auth/me"),
      ]);

      const tasksResult = results[0];
      const userResult = results[1];

      if (tasksResult.status === "fulfilled") {
        const response = getResponseData(tasksResult.value);
        const taskList = getList(response, ["tasks"]);

        setTasks(taskList.map(normalizeTask));
      } else {
        setPageError(getApiMessage(tasksResult.reason));
      }

      if (userResult.status === "fulfilled") {
        const response = getResponseData(userResult.value);
        const currentUser = response.user || response;

        if (currentUser && typeof currentUser === "object") {
          setUser(currentUser);
        }
      }
    } catch (error) {
      setPageError(getApiMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementLoading(true);
    setAnnouncementError("");

    try {
      const response = await apiClient.get("/announcements/mine");
      const responseData = getResponseData(response);

      const announcementList = getList(responseData, [
        "announcements",
        "items",
      ]);

      setAnnouncements(
        announcementList
          .filter(
            (announcement) =>
              announcement &&
              (announcement._id || announcement.id) &&
              announcement.status !== "draft"
          )
          .map(normalizeAnnouncement)
      );
    } catch (error) {
      setAnnouncementError(getApiMessage(error));
      setAnnouncements([]);
    } finally {
      setAnnouncementLoading(false);
    }
  }, []);

  const loadLeaveData = useCallback(async () => {
    setLeaveLoading(true);
    setLeaveError("");

    try {
      const [leaveResponse, balanceResponse] = await Promise.all([
        apiClient.get("/leaves/mine"),
        apiClient.get("/leaves/balances"),
      ]);

      const leaveData = getResponseData(leaveResponse);
      const balanceData = getResponseData(balanceResponse);

      const leaveList = getList(leaveData, ["leaves", "requests"]);
      const balanceList = getList(balanceData, [
        "balances",
        "leaveTypes",
        "items",
      ]);

      setLeaves(leaveList.map(normalizeLeave));
      setLeaveTypes(balanceList.map(normalizeBalance));
    } catch (error) {
      setLeaveError(getApiMessage(error));
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  const loadPerformance = useCallback(async (range, { signal } = {}) => {
    const response = await apiClient.get(
      `/performance/employee?range=${encodeURIComponent(
        String(range || "Month").toLowerCase()
      )}`,
      { signal }
    );

    return response.data;
  }, []);

  useEffect(() => {
    loadDashboard();
    loadAnnouncements();
    loadLeaveData();
  }, [loadDashboard, loadAnnouncements, loadLeaveData]);

  const handleRequestLeave = async (payload) => {
    setLeaveActionLoading(true);
    setLeaveError("");

    try {
      const response = await apiClient.post("/leaves", payload);
      const created = getResponseData(response);

      await loadLeaveData();

      return created.leave || created.request || created;
    } catch (error) {
      const message = getApiMessage(error);
      setLeaveError(message);
      throw new Error(message);
    } finally {
      setLeaveActionLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!id || String(id).startsWith("local-")) {
      throw new Error("Leave request ki valid database ID nahi mili.");
    }

    setLeaveActionLoading(true);
    setLeaveError("");

    try {
      await apiClient.patch(`/leaves/${id}/cancel`);
      await loadLeaveData();
    } catch (error) {
      const message = getApiMessage(error);
      setLeaveError(message);
      throw new Error(message);
    } finally {
      setLeaveActionLoading(false);
    }
  };

  const employeeName = getUserName(user) || getUserName(data.user);
  const today = todayISO();

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === today),
    [tasks, today]
  );

  const todayCompleted = todayTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const todayProgress = todayTasks.length
    ? Math.round((todayCompleted / todayTasks.length) * 100)
    : 0;

  const filtered = useMemo(() => {
    switch (tab) {
      case "All":
        return tasks;

      case "Upcoming":
        return tasks.filter(
          (task) =>
            task.status !== "completed" &&
            task.dueDate &&
            task.dueDate > today
        );

      case "Completed":
        return tasks.filter((task) => task.status === "completed");

      default:
        return tasks.filter(
          (task) =>
            task.status !== "completed" &&
            task.dueDate &&
            task.dueDate <= today
        );
    }
  }, [tasks, tab, today]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changeTab = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const toggleComplete = async (id) => {
    const task = tasks.find((item) => String(item.id) === String(id));

    if (!task || updatingTaskId !== null) return;

    const nextStatus =
      task.status === "completed" ? "pending" : "completed";

    setUpdatingTaskId(id);
    setTaskActionError("");

    try {
      await apiClient.patch(`/tasks/employee/${id}/status`, {
        status: nextStatus,
      });

      await loadDashboard();
    } catch (error) {
      setTaskActionError(getApiMessage(error));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const overdueCount = tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < today &&
      task.status !== "completed"
  ).length;

  const taskStats = {
    ...data.stats,
    assigned: tasks.length,
    total: tasks.length,
    completed: completedCount,
    inProgress: tasks.filter(
      (task) => task.status === "in-progress"
    ).length,
    pending: tasks.filter(
      (task) => task.status === "pending"
    ).length,
    overdue: overdueCount,
  };

  return (
    <div className="w-full min-w-0 space-y-5 bg-black px-4 pb-8 pt-2 font-[Poppins,ui-sans-serif,system-ui,sans-serif] text-white md:px-1">
      <WelcomeHeader
        name={employeeName || "Employee"}
        percent={todayProgress}
      />

      {loading && (
        <p className="text-sm text-neutral-400">
          Loading your dashboard...
        </p>
      )}

      {pageError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
          <p>{pageError}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded border border-red-800 px-3 py-1.5 hover:bg-red-900/30"
          >
            Retry
          </button>
        </div>
      )}

      {taskActionError && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
          <p>{taskActionError}</p>
          <button
            type="button"
            onClick={() => setTaskActionError("")}
            className="shrink-0 text-white"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      <TaskStatsCards {...taskStats} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,1.1fr)_minmax(0,1.9fr)_minmax(0,1.6fr)]">
        <div className={card}>
          <h3 className="text-xs font-medium text-white">My Tasks</h3>

          <div className="mt-3">
            <TaskFilterTabs
              tabs={TABS}
              active={tab}
              onChange={changeTab}
            />
          </div>

          {!loading && !pageError && pageItems.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">
              No tasks found in this section.
            </p>
          )}

          <div
            className={
              updatingTaskId !== null
                ? "pointer-events-none opacity-60"
                : ""
            }
          >
            <TaskTable
              tasks={pageItems}
              onToggleComplete={toggleComplete}
            />
          </div>

          <TaskPagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>

        <div className="min-w-0 [&>*]:h-full">
          <PerformanceOverview
            fetcher={loadPerformance}
            initialRange="Month"
            pollMs={60000}
          />
        </div>

        <div className="min-w-0 lg:col-span-2 xl:col-span-1 [&>*]:h-full">
          <UpcomingTasksCalendar tasks={tasks} loading={loading} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
        <AttendanceOverview weeks={data.attendance} />

        <div className="min-w-0">
          {announcementError && (
            <div
              role="alert"
              className="mb-3 rounded-md border border-red-900 bg-red-950/30 p-3 text-xs text-red-300"
            >
              <p>{announcementError}</p>
              <button
                type="button"
                onClick={loadAnnouncements}
                className="mt-2 underline"
              >
                Retry
              </button>
            </div>
          )}

          <AnnouncementsCard
            announcements={announcements}
            loading={announcementLoading}
          />
        </div>

        <div className="min-w-0">
          {leaveError && (
            <div
              role="alert"
              className="mb-3 rounded-md border border-red-900 bg-red-950/30 p-3 text-xs text-red-300"
            >
              <p>{leaveError}</p>
              <button
                type="button"
                onClick={loadLeaveData}
                className="mt-2 underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className={leaveActionLoading ? "opacity-80" : ""}>
            <LeaveBalance
              leaves={leaves}
              leaveTypes={leaveTypes}
              loading={leaveLoading}
              onRequest={handleRequestLeave}
              onCancel={handleCancelLeave}
            />
          </div>
        </div>
      </div>

      <QuickActions onAction={() => {}} />
    </div>
  );
};

export default DashboardPage;
