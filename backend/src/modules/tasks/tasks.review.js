
import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ROLES } from "../../constants/roles.js";
import { assertCanManageTask } from "../../utils/hierarchy.js";
import { notifyUsers } from "../notifications/notifications.events.js";

const MAX_NOTE_LENGTH = 4000;
const DONE_STATUSES = ["approved", "completed"];

const isPersonalTask = (task) =>
  task.taskType === "personal" || task.assignedById === task.assignedToId;

const postTaskMessage = (taskId, authorId, body) =>
  prisma.taskComment.create({
    data: { taskId: String(taskId), authorId: String(authorId), body },
  });

const safeNotify = async (userIds, payload) => {
  try {
    const ids = [...new Set(userIds.filter(Boolean).map(String))].filter(
      (id) => id !== String(payload.from)
    );

    if (ids.length) await notifyUsers(ids, payload);
  } catch (error) {
    console.error("Task review notification failed:", error.message);
  }
};

export const submitTaskForReview = asyncHandler(async (req, res) => {
  const description = String(req.body?.description ?? "").trim();

  if (description.length < 10) {
    throw new ApiError(
      400,
      "Please describe the work you did (at least 10 characters)."
    );
  }

  if (description.length > MAX_NOTE_LENGTH) {
    throw new ApiError(
      400,
      `Description must be ${MAX_NOTE_LENGTH} characters or fewer.`
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: String(req.params.taskId),
      assignedToId: String(req.user.id),
    },
  });

  if (!task) throw new ApiError(404, "Task not found.");

  if (task.taskType === "daily") {
    throw new ApiError(
      400,
      "Fixed daily tasks are not reviewed. Post a daily update instead."
    );
  }

  if (isPersonalTask(task)) {
    throw new ApiError(400, "Personal tasks do not go through review.");
  }

  if (task.status === "review") {
    throw new ApiError(400, "This task is already waiting for review.");
  }

  if (DONE_STATUSES.includes(task.status)) {
    throw new ApiError(400, "This task is already completed.");
  }

  const now = new Date();
  const startedAt = task.startedAt || now;

  const minutes =
    (task.timeSpentMinutes || 0) +
    Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 60000));

  const row = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "review",
      startedAt,
      completedAt: null,
      submissionNote: description,
      submittedAt: now,
      timeSpentMinutes: minutes,
      reviewNote: null,
      reviewedAt: null,
      reviewedById: null,
      reviewedByName: null,
    },
  });

  await postTaskMessage(
    task.id,
    req.user.id,
    `Submitted for review:\n${description}`
  );

  const admins = await prisma.user.findMany({
    where: { role: ROLES.ADMIN, status: "active", isDeleted: false },
    select: { id: true },
  });

  await safeNotify([task.assignedById, ...admins.map((item) => item.id)], {
    from: req.user.id,
    type: "task",
    tag: "Tasks",
    title: "Task submitted for review",
    message: `${req.user.name} submitted "${task.title}" for review`,
    details:
      description.length > 140 ? `${description.slice(0, 137)}...` : description,
    link: "/team-tasks",
    linkLabel: "Review Task",
  });

  res.json({
    success: true,
    message: "Task submitted for review.",
    task: { ...row, _id: row.id },
  });
});

export const reviewTask = asyncHandler(async (req, res) => {
  const decision = String(req.body?.decision || "").toLowerCase();

  if (!["approve", "disapprove"].includes(decision)) {
    throw new ApiError(400, "Decision must be approve or disapprove.");
  }

  const note = String(req.body?.note ?? "").trim();

  if (note.length > MAX_NOTE_LENGTH) {
    throw new ApiError(
      400,
      `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`
    );
  }

  if (decision === "disapprove" && note.length < 3) {
    throw new ApiError(400, "Please explain what needs to change.");
  }

  const taskId = String(req.params.taskId);

  await assertCanManageTask(req.user, taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) throw new ApiError(404, "Task not found.");

  if (String(task.assignedToId) === String(req.user.id)) {
    throw new ApiError(403, "You cannot review your own task.");
  }

  if (task.status !== "review") {
    throw new ApiError(400, "Only tasks that are in review can be reviewed.");
  }

  const now = new Date();
  const approved = decision === "approve";

  const row = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: approved ? "approved" : "in-progress",
      completedAt: approved ? task.completedAt || now : null,
      ...(approved ? {} : { startedAt: now }),
      reviewNote: note || null,
      reviewedAt: now,
      reviewedById: String(req.user.id),
      reviewedByName: req.user.name || "",
    },
  });

  await postTaskMessage(
    task.id,
    req.user.id,
    approved
      ? note
        ? `Approved. ${note}`
        : "Approved. Great work!"
      : `Changes requested: ${note}`
  );

  await safeNotify([task.assignedToId], {
    from: req.user.id,
    type: "task",
    tag: "Tasks",
    title: approved ? "Task approved" : "Changes requested on your task",
    message: approved
      ? `"${task.title}" was approved and marked as completed`
      : `"${task.title}" needs changes`,
    details: note,
    link: "/task",
    linkLabel: "Open Tasks",
  });

  res.json({
    success: true,
    message: approved ? "Task approved." : "Task sent back for changes.",
    task: { ...row, _id: row.id },
  });
});
