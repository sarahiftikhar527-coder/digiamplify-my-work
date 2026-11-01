
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTask,
  getEmployeeTaskStats,
  getEmployeeTasks,
  updateEmployeeTaskStatus,
  getAllTasksForAdmin,
  updateAdminTask,
  updateAdminTaskStatus,
  deleteAdminTask,
} from "./tasks.service.js";

const VALID_STATUSES = [
  "pending",
  "in-progress",
  "review",
  "approved",
  "completed",
];

export const employeeTaskStats = asyncHandler(async (req, res) => {
  const stats = await getEmployeeTaskStats(req.user.id);
  res.json({ success: true, stats });
});

export const employeeTasks = asyncHandler(async (req, res) => {
  const tasks = await getEmployeeTasks(req.user.id);
  res.json({ success: true, tasks });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID.",
    });
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
    status
  );

  res.json({ success: true, task });
});

export const adminCreateTask = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle = "",
    description = "",
    priority = "Medium",
    assignedTo,
    assignees,
    dueDate,
  } = req.body;

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

  if (!title?.trim() || !employeeIds.length || !dueDate) {
    return res.status(400).json({
      success: false,
      message: "Title, at least one employee and due date are required.",
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
    Number.isNaN(new Date(dueDate).getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid employee IDs and due date.",
    });
  }

  const tasks = await Promise.all(
    employeeIds.map((employeeId) =>
      createTask({
        title: title.trim(),
        subtitle: String(subtitle || "").trim(),
        description: String(description || "").trim(),
        priority,
        assignedTo: employeeId,
        assignedBy: req.user.id,
        dueDate: new Date(dueDate),
      })
    )
  );

  res.status(201).json({
    success: true,
    message: "Task assigned successfully.",
    tasks,
    task: tasks[0],
  });
});

export const adminTasks = asyncHandler(async (req, res) => {
  const tasks = await getAllTasksForAdmin();
  res.json({ success: true, tasks });
});

export const adminUpdateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID.",
    });
  }

  const {
    title,
    subtitle,
    description,
    priority,
    assignedTo,
    assignees,
    dueDate,
    status,
  } = req.body;

  if (Array.isArray(assignees) && assignees.length > 1) {
    return res.status(400).json({
      success: false,
      message:
        "Please select one employee for this task.",
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
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID.",
    });
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
    dueDate !== undefined &&
    Number.isNaN(new Date(dueDate).getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid due date.",
    });
  }

  const updates = {
    title,
    subtitle,
    description,
    priority,
    dueDate,
    status,
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

export const adminUpdateTaskStatus = asyncHandler(
  async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
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
  }
);

export const adminDeleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID.",
    });
  }

  await deleteAdminTask(taskId);

  res.json({
    success: true,
    message: "Task deleted successfully.",
  });
});
