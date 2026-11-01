
import Task from "../../models/Task.js";
import User from "../../models/User.js";
import { ROLES } from "../../constants/roles.js";

const TASK_STATUSES = [
  "pending",
  "in-progress",
  "review",
  "approved",
  "completed",
];

const TASK_PRIORITIES = ["Low", "Medium", "High"];

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeSavedStatus(status) {
  return status === "completed" ? "approved" : status;
}

function updateCompletionDate(task, status) {
  if (status === "approved" || status === "completed") {
    task.completedAt = task.completedAt || new Date();
  } else {
    task.completedAt = null;
  }
}

async function getPopulatedTask(taskId) {
  return Task.findById(taskId)
    .populate("assignedTo", "name email department designation status")
    .populate("assignedBy", "name email")
    .lean();
}

export async function getEmployeeTaskStats(employeeId) {
  const now = new Date();

  const [assigned, completed, inProgress, review, overdue] =
    await Promise.all([
      Task.countDocuments({ assignedTo: employeeId }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: { $in: ["approved", "completed"] },
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: "in-progress",
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: "review",
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: { $nin: ["approved", "completed"] },
        dueDate: { $lt: now },
      }),
    ]);

  return { assigned, completed, inProgress, review, overdue };
}

export async function getEmployeeTasks(employeeId) {
  const tasks = await Task.find({ assignedTo: employeeId })
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return tasks.map((task) => ({
    ...task,
    status: normalizeSavedStatus(task.status),
  }));
}

export async function updateEmployeeTaskStatus(
  employeeId,
  taskId,
  status
) {
  if (!TASK_STATUSES.includes(status)) {
    throw createError("Invalid task status.");
  }

  const task = await Task.findOne({
    _id: taskId,
    assignedTo: employeeId,
  });

  if (!task) {
    throw createError("Task not found.", 404);
  }

  task.status = status;
  updateCompletionDate(task, status);

  await task.save();

  return task;
}

export async function createTask({
  title,
  subtitle = "",
  description = "",
  priority = "Medium",
  assignedTo,
  assignedBy,
  dueDate,
}) {
  const employee = await User.findOne({
    _id: assignedTo,
    role: ROLES.EMPLOYEE,
    status: "active",
    isDeleted: false,
  });

  if (!employee) {
    throw createError("Active employee not found.", 404);
  }

  return Task.create({
    title,
    subtitle,
    description,
    priority,
    assignedTo,
    assignedBy,
    dueDate,
  });
}

export async function getAllTasksForAdmin() {
  const tasks = await Task.find({})
    .populate("assignedTo", "name email department designation status")
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return tasks.map((task) => ({
    ...task,
    status: normalizeSavedStatus(task.status),
  }));
}

export async function updateAdminTask(taskId, updates) {
  const task = await Task.findById(taskId);

  if (!task) {
    throw createError("Task not found.", 404);
  }

  if (updates.title !== undefined) {
    const title = String(updates.title).trim();

    if (!title) {
      throw createError("Task title is required.");
    }

    task.title = title;
  }

  if (updates.subtitle !== undefined) {
    task.subtitle = String(updates.subtitle || "").trim();
  }

  if (updates.description !== undefined) {
    task.description = String(updates.description || "").trim();
  }

  if (updates.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(updates.priority)) {
      throw createError("Invalid task priority.");
    }

    task.priority = updates.priority;
  }

  if (updates.dueDate !== undefined) {
    const parsedDate = new Date(updates.dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw createError("Invalid due date.");
    }

    task.dueDate = parsedDate;
  }

  if (updates.assignedTo !== undefined) {
    const employee = await User.findOne({
      _id: updates.assignedTo,
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    });

    if (!employee) {
      throw createError("Active employee not found.", 404);
    }

    task.assignedTo = employee._id;
  }

  if (updates.status !== undefined) {
    if (!TASK_STATUSES.includes(updates.status)) {
      throw createError("Invalid task status.");
    }

    task.status = updates.status;
    updateCompletionDate(task, updates.status);
  }

  await task.save();

  return getPopulatedTask(task._id);
}

export async function updateAdminTaskStatus(taskId, status) {
  if (!TASK_STATUSES.includes(status)) {
    throw createError("Invalid task status.");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw createError("Task not found.", 404);
  }

  task.status = status;
  updateCompletionDate(task, status);

  await task.save();

  return getPopulatedTask(task._id);
}

export async function deleteAdminTask(taskId) {
  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    throw createError("Task not found.", 404);
  }

  return task;
}
