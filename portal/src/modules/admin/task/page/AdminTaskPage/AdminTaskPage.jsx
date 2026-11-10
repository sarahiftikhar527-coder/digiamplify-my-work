import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "@/services/api/apiClient.js";
import TaskBoardHeader from "../../components/Taskboardheader/Taskboardheader.jsx";
import TaskColumn from "../../components/Taskcolumn/Taskcolumn.jsx";
import AdminAddTaskModal from "../../components/Adminaddtaskmodal/Adminaddtaskmodal.jsx";
import TaskDetailDrawer from "../../components/Taskdetaildrawer/Taskdetaildrawer.jsx";
import AdminTaskActivity from "../../components/Admintaskactivity/Admintaskactivity.jsx";

const BOARD_STATUSES = [
  { id: "todo", key: "todo", value: "todo", label: "To Do" },
  {
    id: "in-progress",
    key: "in-progress",
    value: "in-progress",
    label: "In Progress",
  },
  {
    id: "completed",
    key: "completed",
    value: "completed",
    label: "Completed",
  },
];

const TABS = [
  { id: "board", label: "Task Board" },
  { id: "activity", label: "Employee Activity" },
];

const getPayload = (response) => response?.data ?? response ?? {};

const getArray = (response, keys = []) => {
  const body = getPayload(response);

  const candidates = [
    ...keys.flatMap((key) => [
      body?.[key],
      body?.data?.[key],
      body?.result?.[key],
      body?.data?.data?.[key],
    ]),
    body?.data?.data,
    body?.data?.results,
    body?.results,
    body?.result,
    body?.data,
    body,
  ];

  return candidates.find(Array.isArray) || [];
};

const getEmployeesFromResponse = (response) => {
  const body = getPayload(response);

  const candidates = [
    body?.employees?.employees,
    body?.data?.employees?.employees,
    body?.result?.employees?.employees,
    body?.data?.data?.employees?.employees,
    body?.employees,
    body?.data?.employees,
    body?.result?.employees,
    body?.data?.data?.employees,
    body?.data?.data,
    body?.data,
    body,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeEmployee = (employee) => ({
  ...employee,
  id: String(employee._id || employee.id || employee.userId || ""),
  name:
    employee.name ||
    employee.fullName ||
    employee.username ||
    employee.email ||
    "Employee",
  role:
    employee.designation ||
    employee.department ||
    employee.role ||
    "Employee",
});

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  if (["pending", "todo", "to-do"].includes(value)) return "todo";

  if (["in-progress", "in progress", "inprogress"].includes(value)) {
    return "in-progress";
  }

  if (["completed", "done", "approved"].includes(value)) {
    return "completed";
  }

  return "todo";
};

const toBackendStatus = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "todo") return "pending";

  return normalized;
};

const getProgress = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "completed") return 100;
  if (normalized === "in-progress") return 50;

  return 0;
};

const normalizeTask = (task) => {
  if (!task || typeof task !== "object") {
    return null;
  }

  const assignedTo = task.assignedTo;
  const assignedBy = task.assignedBy;

  const assignedEmployees = Array.isArray(assignedTo)
    ? assignedTo
    : assignedTo
      ? [assignedTo]
      : Array.isArray(task.assignees)
        ? task.assignees
        : [];

  const assignees = assignedEmployees
    .map((employee) => {
      if (typeof employee === "string") {
        return {
          id: employee,
          name: "Employee",
          email: "",
        };
      }

      if (!employee || typeof employee !== "object") {
        return null;
      }

      return {
        ...employee,
        id: String(
          employee._id ||
            employee.id ||
            employee.userId ||
            employee.user?._id ||
            (typeof task.assignedToId === "string" ? task.assignedToId : "") ||
            ""
        ),
        name:
          employee.name ||
          employee.fullName ||
          employee.email ||
          "Employee",
        email: employee.email || "",
      };
    })
    .filter(Boolean);

  const status = normalizeStatus(task.status);

  return {
    ...task,
    id: String(task._id || task.id || ""),
    taskType: task.taskType || "extra",
    title: task.title || "",
    subtitle: task.subtitle || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    status,
    progress: getProgress(status),
    dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
    assignees,
    assignedTo:
      assignedTo && typeof assignedTo === "object"
        ? String(
            assignedTo._id ||
              assignedTo.id ||
              assignedTo.userId ||
              (typeof task.assignedToId === "string" ? task.assignedToId : "") ||
              ""
          )
        : String(assignedTo || task.assignedToId || ""),
    assignedByName:
      assignedBy && typeof assignedBy === "object"
        ? assignedBy.name || assignedBy.fullName || ""
        : "",
    createdAt: task.createdAt || "",
    updatedAt: task.updatedAt || task.createdAt || "",
    completedAt: task.completedAt || null,
  };
};

const getTaskId = (taskOrId) => {
  if (typeof taskOrId === "string") return taskOrId;

  return String(taskOrId?.id || taskOrId?._id || "");
};

function AdminTaskPage() {
  // The tab lives in the address (?view=board | activity) so the sidebar can open it.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("view") === "activity" ? "activity" : "board";
  const setTab = useCallback(
    (id) => setSearchParams({ view: id }, { replace: true }),
    [setSearchParams]
  );
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activityKey, setActivityKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setEmployeesLoading(true);
    setError("");
    setEmployeeError("");

    try {
      const [tasksResult, usersResult] = await Promise.allSettled([
        apiClient.get("/tasks/admin"),
        apiClient.get("/users", {
          params: { page: 1, limit: 100 },
        }),
      ]);

      if (tasksResult.status === "fulfilled") {
        const taskList = getArray(tasksResult.value, ["tasks"]);
        // Drop null entries returned by normalizeTask
        setTasks(taskList.map(normalizeTask).filter(Boolean));
      } else {
        setTasks([]);
        setError(
          tasksResult.reason?.response?.data?.message ||
            tasksResult.reason?.message ||
            "Unable to load tasks. Please try again."
        );
      }

      if (usersResult.status === "fulfilled") {
        const employeeList = getEmployeesFromResponse(usersResult.value);

        const activeEmployees = employeeList
          .filter((employee) => {
            const role = String(employee.role || "").toLowerCase();
            const status = String(employee.status || "active").toLowerCase();

            return (
              role === "employee" &&
              status === "active" &&
              employee.isDeleted !== true
            );
          })
          .map(normalizeEmployee)
          .filter((employee) => employee.id);

        setEmployees(activeEmployees);

        if (activeEmployees.length === 0) {
          setEmployeeError(
            employeeList.length === 0
              ? "No employee records were found in the users API response."
              : "Employee records were returned, but none matched the active employee filters."
          );
        }
      } else {
        setEmployees([]);
        setEmployeeError(
          usersResult.reason?.response?.data?.message ||
            usersResult.reason?.message ||
            "Unable to load employees. Please check the users API."
        );
      }

      setLastUpdated(new Date());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load the task board."
      );
    } finally {
      setLoading(false);
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employeesById = useMemo(
    () =>
      employees.reduce((result, employee) => {
        result[employee.id] = employee;
        return result;
      }, {}),
    [employees]
  );

  // The board only shows extra tasks. Fixed daily tasks are managed in
  // "Employee Activity", and employees' personal tasks stay private.
  const boardTasks = useMemo(
    () => tasks.filter((task) => task.taskType === "extra"),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return boardTasks;

    return boardTasks.filter((task) => {
      const assigneeNames = (task.assignees || [])
        .map((assignee) => {
          if (typeof assignee === "string") {
            return employeesById[assignee]?.name || assignee;
          }

          return assignee?.name || assignee?.email || "";
        })
        .join(" ");

      return [
        task.title,
        task.subtitle,
        task.description,
        task.priority,
        task.status,
        assigneeNames,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [boardTasks, search, employeesById]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const saveTask = async (formData) => {
    const assignees = Array.isArray(formData.assignees)
      ? formData.assignees
          .map((employee) =>
            typeof employee === "object"
              ? employee.id || employee._id
              : employee
          )
          .filter(Boolean)
      : [];

    const taskType = formData.taskType === "daily" ? "daily" : "extra";

    if (!formData.title?.trim()) {
      setNotice("Please enter a task title.");
      return;
    }

    if (taskType === "extra" && !formData.dueDate) {
      setNotice("Please select a due date.");
      return;
    }

    if (assignees.length === 0) {
      setNotice("Please select at least one employee.");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      await apiClient.post("/tasks", {
        taskType,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || "",
        description: formData.description?.trim() || "",
        priority: formData.priority || "Medium",
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        assignees: [...new Set(assignees.map(String))],
      });

      setAddOpen(false);
      setNotice(
        taskType === "daily"
          ? "Fixed daily task assigned successfully."
          : "Task assigned successfully."
      );

      if (taskType === "daily") {
        setTab("activity");
        setActivityKey((value) => value + 1);
      }

      await loadData();
    } catch (requestError) {
      setNotice(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Task could not be created. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (taskOrId, updates = {}) => {
    const taskId = getTaskId(taskOrId);

    if (!taskId) {
      setNotice("Unable to update task because its ID is missing.");
      return false;
    }

    if (!updates || typeof updates !== "object") {
      setNotice("Invalid task update data.");
      return false;
    }

    const payload = { ...updates };

    delete payload.id;
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.completedAt;
    delete payload.progress;
    delete payload.assignedBy;
    delete payload.assignedByName;
    delete payload.assignees;

    if (updates.assignees !== undefined) {
      const assignees = (
        Array.isArray(updates.assignees)
          ? updates.assignees
          : [updates.assignees]
      )
        .map((employee) =>
          typeof employee === "object"
            ? employee?.id || employee?._id
            : employee
        )
        .filter(Boolean)
        .map(String);

      const uniqueAssignees = [...new Set(assignees)];

      if (uniqueAssignees.length !== 1) {
        setNotice(
          "Please assign this task to exactly one employee when editing its assignment."
        );
        return false;
      }

      payload.assignedTo = uniqueAssignees[0];
    }

    if (updates.assignedTo !== undefined) {
      payload.assignedTo =
        typeof updates.assignedTo === "object"
          ? updates.assignedTo?._id || updates.assignedTo?.id
          : updates.assignedTo;
    }

    if (updates.status !== undefined) {
      payload.status = toBackendStatus(updates.status);
    }

    if (payload.title !== undefined) {
      payload.title = String(payload.title).trim();

      if (!payload.title) {
        setNotice("Task title cannot be empty.");
        return false;
      }
    }

    if (payload.priority !== undefined) {
      if (!["Low", "Medium", "High"].includes(payload.priority)) {
        setNotice("Please select a valid task priority.");
        return false;
      }
    }

    if (payload.dueDate !== undefined && !payload.dueDate) {
      setNotice("Please select a due date.");
      return false;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const statusOnly =
        Object.keys(payload).length === 1 &&
        Object.prototype.hasOwnProperty.call(payload, "status");

      if (statusOnly) {
        await apiClient.patch(`/tasks/admin/${taskId}/status`, {
          status: payload.status,
        });
      } else {
        await apiClient.patch(`/tasks/admin/${taskId}`, payload);
      }

      setNotice("Task updated successfully.");
      await loadData();
      return true;
    } catch (requestError) {
      setNotice(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Task could not be updated. Please try again."
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const moveTask = async (taskOrId, nextStatus) => {
    if (!nextStatus) {
      setNotice("Open the task details to update its status.");
      return false;
    }

    return updateTask(taskOrId, { status: nextStatus });
  };

  const deleteTask = async (taskOrId) => {
    const taskId = getTaskId(taskOrId);

    if (!taskId) {
      setNotice("Unable to delete task because its ID is missing.");
      return false;
    }

    const task = tasks.find((item) => item.id === taskId);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task?.title || "this task"}"?`
    );

    if (!confirmed) return false;

    setSubmitting(true);
    setNotice("");

    try {
      await apiClient.delete(`/tasks/admin/${taskId}`);

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }

      setNotice("Task deleted successfully.");
      await loadData();
      return true;
    } catch (requestError) {
      setNotice(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Task could not be deleted. Please try again."
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const openTaskDetails = (task) => {
    const taskId =
      typeof task === "string" ? task : task?.id || task?._id;

    if (taskId) {
      setSelectedTaskId(String(taskId));
      setNotice("");
    }
  };

  const closeTaskDetails = () => {
    setSelectedTaskId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <TaskBoardHeader
          search={search}
          onSearch={setSearch}
          onAdd={() => {
            setNotice("");
            setAddOpen(true);
          }}
          assignees={employees}
          lastUpdated={lastUpdated}
          tasks={boardTasks}
        />

        <div className="mb-5 flex gap-1 border-b border-white/10">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === item.id
                  ? "border-[#c1121f] text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-[#c1121f]/40 bg-[#c1121f]/10 px-4 py-3 text-sm text-white"
          >
            {notice}
          </div>
        )}

        {employeeError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            <p>{employeeError}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 font-semibold text-white underline underline-offset-4"
            >
              Retry loading employees
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 font-semibold text-white underline underline-offset-4"
            >
              Retry loading tasks
            </button>
          </div>
        )}

        {tab === "activity" ? (
          <AdminTaskActivity
            key={activityKey}
            employees={employees}
            onNotice={setNotice}
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-400">
                {loading
                  ? "Loading tasks..."
                  : `${filteredTasks.length} task${filteredTasks.length === 1 ? "" : "s"}`}
                {" · "}
                {employeesLoading
                  ? "Loading employees..."
                  : `${employees.length} active employee${employees.length === 1 ? "" : "s"}`}
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading || employeesLoading || submitting}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-[#c1121f] hover:bg-[#c1121f]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading || employeesLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-5 py-12 text-center text-sm text-gray-400">
                Loading task board...
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
                {BOARD_STATUSES.map((status) => {
                  const columnTasks = filteredTasks.filter(
                    (task) => task.status === status.id
                  );

                  return (
                    <TaskColumn
                      key={status.id}
                      status={status}
                      tasks={columnTasks}
                      employeesById={employeesById}
                      onView={openTaskDetails}
                      onDelete={deleteTask}
                      onMove={moveTask}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <AdminAddTaskModal
        open={addOpen}
        employees={employees}
        onClose={() => {
          if (!submitting) setAddOpen(false);
        }}
        onSubmit={saveTask}
      />

      {/*
        TaskDetailDrawer crashed when rendered with task={null}, so it is only
        mounted when a task is selected. The key resets its internal form state
        when a different task is opened.
      */}
      {selectedTask && (
        <TaskDetailDrawer
          key={selectedTask.id}
          task={selectedTask}
          employees={employees}
          onClose={closeTaskDetails}
          onUpdate={updateTask}
          onEdit={updateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}

export default AdminTaskPage;