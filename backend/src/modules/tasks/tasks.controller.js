import mongoose from "../../utils/mongooseCompat.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTask,
  getEmployeeTaskStats,
  getEmployeeTasks,
  updateEmployeeTaskStatus,
  getEmployeeWorkspace,
  submitDailyUpdate,
  createPersonalTask,
  updatePersonalTask,
  deletePersonalTask,
  getAllTasksForAdmin,
  updateAdminTask,
  updateAdminTaskStatus,
  deleteAdminTask,
  getAdminDailyUpdates,
  getAdminActivity,
} from "./tasks.service.js";

const VALID_STATUSES = [
  "pending",
  "in-progress",
  "review",
  "approved",
  "completed",
];

const invalidId = (res, label = "task") =>
  res.status(400).json({
    success: false,
    message: `Invalid ${label} ID.`,
  });

/*
|--------------------------------------------------------------------------
| Employee
|--------------------------------------------------------------------------
*/

export const employeeTaskStats = asyncHandler(async (req, res) => {
  const stats = await getEmployeeTaskStats(req.user.id);
  res.json({ success: true, stats });
});

export const employeeTasks = asyncHandler(async (req, res) => {
  const tasks = await getEmployeeTasks(req.user.id);
  res.json({ success: true, tasks });
});

export const employeeWorkspace = asyncHandler(async (req, res) => {
  const view = String(req.query.view || "assigned");

  const result = await getEmployeeWorkspace(req.user.id, {
    view,
    timeZone: req.user.timeZone,
  });

  res.json({ success: true, ...result });
});

// Body: { status, timeSpentMinutes? }
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status, timeSpentMinutes } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    return invalidId(res);
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status.",
    });
  }

  const task = await updateEmployeeTaskStatus(
    req.user.id,
    taskId,
    status,
    timeSpentMinutes
  );

  res.json({ success: true, task });
});

// Body: { description, status, timeSpentMinutes }
export const employeeDailyUpdate = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return invalidId(res);
  }

  const update = await submitDailyUpdate(
    req.user.id,
    taskId,
    {
      description: req.body.description,
      status: req.body.status,
      timeSpentMinutes: req.body.timeSpentMinutes,
    },
    req.user.timeZone
  );

  res.status(201).json({
    success: true,
    message: "Daily update saved.",
    update,
  });
});

export const employeeCreatePersonalTask = asyncHandler(
  async (req, res) => {
    const task = await createPersonalTask(
      req.user.id,
      {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority || "Medium",
        dueDate: req.body.dueDate,
      },
      req.user.timeZone
    );

    res.status(201).json({
      success: true,
      message: "Personal task created.",
      task,
    });
  }
);

export const employeeUpdatePersonalTask = asyncHandler(
  async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return invalidId(res);
    }

    const task = await updatePersonalTask(
      req.user.id,
      taskId,
      req.body,
      req.user.timeZone
    );

    res.json({
      success: true,
      message: "Personal task updated.",
      task,
    });
  }
);

export const employeeDeletePersonalTask = asyncHandler(
  async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return invalidId(res);
    }

    await deletePersonalTask(req.user.id, taskId);

    res.json({
      success: true,
      message: "Personal task deleted.",
    });
  }
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

export const adminCreateTask = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle = "",
    description = "",
    priority = "Medium",
    assignedTo,
    assignees,
    startDate,
    dueDate,
  } = req.body;

  // "daily" = fixed task that repeats every day, "extra" = one-off task.
  const taskType = req.body.taskType === "daily" ? "daily" : "extra";

  const employeeIds = [
    ...new Set(
      (Array.isArray(assignees) && assignees.length
        ? assignees
        : assignedTo
          ? [assignedTo]
          : []
      ).map(String)
    ),
  ];

  if (!title?.trim() || !employeeIds.length) {
    return res.status(400).json({
      success: false,
      message: "Title and at least one employee are required.",
    });
  }

  if (taskType === "extra" && !dueDate) {
    return res.status(400).json({
      success: false,
      message: "Due date is required for an extra task.",
    });
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task priority.",
    });
  }

  if (
    employeeIds.some((id) => !mongoose.isValidObjectId(id)) ||
    (dueDate && Number.isNaN(new Date(dueDate).getTime())) ||
    (startDate && Number.isNaN(new Date(startDate).getTime()))
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid employee IDs and dates.",
    });
  }

  const tasks = await Promise.all(
    employeeIds.map((employeeId) =>
      createTask({
        title: title.trim(),
        subtitle: String(subtitle || "").trim(),
        description: String(description || "").trim(),
        priority,
        taskType,
        assignedTo: employeeId,
        assignedBy: req.user.id,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      })
    )
  );

  res.status(201).json({
    success: true,
    message:
      taskType === "daily"
        ? "Fixed daily task assigned successfully."
        : "Task assigned successfully.",
    tasks,
    task: tasks[0],
  });
});

export const adminTasks = asyncHandler(async (req, res) => {
  const tasks = await getAllTasksForAdmin();
  res.json({ success: true, tasks });
});

export const adminDailyUpdates = asyncHandler(async (req, res) => {
  const result = await getAdminDailyUpdates({
    date: req.query.date ? String(req.query.date) : undefined,
    employeeId: req.query.employeeId
      ? String(req.query.employeeId)
      : undefined,
    taskId: req.query.taskId ? String(req.query.taskId) : undefined,
    timeZone: req.user.timeZone,
  });

  res.json({ success: true, ...result });
});

// Query: ?date=YYYY-MM-DD&employeeId=...
export const adminActivity = asyncHandler(async (req, res) => {
  const result = await getAdminActivity({
    date: req.query.date ? String(req.query.date) : undefined,
    employeeId: req.query.employeeId
      ? String(req.query.employeeId)
      : undefined,
    timeZone: req.user.timeZone,
  });

  res.json({ success: true, ...result });
});

export const adminUpdateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return invalidId(res);
  }

  const {
    title,
    subtitle,
    description,
    priority,
    assignedTo,
    assignees,
    startDate,
    dueDate,
    status,
    isActive,
  } = req.body;

  if (Array.isArray(assignees) && assignees.length > 1) {
    return res.status(400).json({
      success: false,
      message: "Please select one employee for this task.",
    });
  }

  const selectedAssignee =
    Array.isArray(assignees) && assignees.length === 1
      ? assignees[0]
      : assignedTo;

  if (
    selectedAssignee !== undefined &&
    !mongoose.isValidObjectId(String(selectedAssignee))
  ) {
    return invalidId(res, "employee");
  }

  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required.",
    });
  }

  if (
    priority !== undefined &&
    !["Low", "Medium", "High"].includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid task priority.",
    });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status.",
    });
  }

  if (
    (dueDate !== undefined && Number.isNaN(new Date(dueDate).getTime())) ||
    (startDate !== undefined &&
      Number.isNaN(new Date(startDate).getTime()))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid date.",
    });
  }

  const updates = {
    title,
    subtitle,
    description,
    priority,
    startDate,
    dueDate,
    status,
    isActive,
  };

  if (selectedAssignee !== undefined) {
    updates.assignedTo = String(selectedAssignee);
  }

  const task = await updateAdminTask(taskId, updates);

  res.json({
    success: true,
    message: "Task updated successfully.",
    task,
  });
});

export const adminUpdateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    return invalidId(res);
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status.",
    });
  }

  const task = await updateAdminTaskStatus(taskId, status);

  res.json({
    success: true,
    message: "Task status updated successfully.",
    task,
  });
});

export const adminDeleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return invalidId(res);
  }

  await deleteAdminTask(taskId);

  res.json({
    success: true,
    message: "Task deleted successfully.",
  });
});