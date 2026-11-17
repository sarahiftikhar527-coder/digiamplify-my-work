
import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAdminUser } from "../../utils/permissions.js";
import { getAssignableUserIds } from "../../utils/hierarchy.js";
import { notifyUsers } from "../notifications/notifications.events.js";

const MAX_COMMENT_LENGTH = 2000;
const MAX_COMMENTS_PER_TASK = 500;

const AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
  position: true,
  avatarUrl: true,
};

function serializeComment(row, viewerId) {
  return {
    id: row.id,
    _id: row.id,
    taskId: row.taskId,
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    isMine: row.authorId === String(viewerId),
    author: row.author
      ? {
          id: row.author.id,
          _id: row.author.id,
          name: row.author.name,
          email: row.author.email,
          position: row.author.position,
          avatarUrl: row.author.avatarUrl || "",
        }
      : null,
  };
}

async function loadTaskForUser(user, taskId) {
  const id = String(taskId || "").trim();

  if (!id) throw new ApiError(400, "Invalid task ID.");

  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      taskType: true,
      assignedToId: true,
      assignedById: true,
    },
  });

  if (!task) throw new ApiError(404, "Task not found.");

  if (
    task.taskType === "personal" ||
    task.assignedById === task.assignedToId
  ) {
    throw new ApiError(403, "Personal tasks do not have comments.");
  }

  const userId = String(user.id);

  if (
    isAdminUser(user) ||
    task.assignedToId === userId ||
    task.assignedById === userId
  ) {
    return task;
  }

  const scopeIds = await getAssignableUserIds(user);

  if (scopeIds.map(String).includes(task.assignedToId)) {
    return task;
  }

  throw new ApiError(403, "You do not have access to this task.");
}

export const listTaskComments = asyncHandler(async (req, res) => {
  const task = await loadTaskForUser(req.user, req.params.taskId);

  const rows = await prisma.taskComment.findMany({
    where: { taskId: task.id },
    include: { author: { select: AUTHOR_SELECT } },
    orderBy: { createdAt: "asc" },
    take: MAX_COMMENTS_PER_TASK,
  });

  res.json({
    success: true,
    comments: rows.map((row) => serializeComment(row, req.user.id)),
  });
});

export const getTaskCommentUnreadCount = asyncHandler(async (req, res) => {
  const task = await loadTaskForUser(req.user, req.params.taskId);
  const userId = String(req.user.id);

  const readState = await prisma.taskCommentReadState.findUnique({
    where: {
      taskId_userId: {
        taskId: task.id,
        userId,
      },
    },
    select: { lastReadAt: true },
  });

  const unreadCount = await prisma.taskComment.count({
    where: {
      taskId: task.id,
      authorId: { not: userId },
      ...(readState ? { createdAt: { gt: readState.lastReadAt } } : {}),
    },
  });

  res.json({
    success: true,
    unreadCount,
  });
});

export const markTaskCommentsRead = asyncHandler(async (req, res) => {
  const task = await loadTaskForUser(req.user, req.params.taskId);
  const userId = String(req.user.id);
  const lastReadAt = new Date();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.taskCommentReadState.findUnique({
      where: {
        taskId_userId: {
          taskId: task.id,
          userId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await tx.taskCommentReadState.update({
        where: { id: existing.id },
        data: { lastReadAt },
      });
    } else {
      try {
        await tx.taskCommentReadState.create({
          data: {
            taskId: task.id,
            userId,
            lastReadAt,
          },
        });
      } catch (error) {
        if (error.code !== "P2002") throw error;

        await tx.taskCommentReadState.update({
          where: {
            taskId_userId: {
              taskId: task.id,
              userId,
            },
          },
          data: { lastReadAt },
        });
      }
    }
  });

  res.json({
    success: true,
    message: "Task comments marked as read.",
    lastReadAt,
  });
});

export const addTaskComment = asyncHandler(async (req, res) => {
  const task = await loadTaskForUser(req.user, req.params.taskId);

  const body = String(req.body?.body ?? "").trim();

  if (!body) {
    throw new ApiError(400, "Comment cannot be empty.");
  }

  if (body.length > MAX_COMMENT_LENGTH) {
    throw new ApiError(
      400,
      `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`
    );
  }

  const row = await prisma.taskComment.create({
    data: {
      taskId: task.id,
      authorId: String(req.user.id),
      body,
    },
    include: { author: { select: AUTHOR_SELECT } },
  });

  try {
    const authorId = String(req.user.id);
    const preview = body.length > 140 ? `${body.slice(0, 137)}...` : body;

    if (task.assignedToId !== authorId) {
      await notifyUsers([task.assignedToId], {
        from: authorId,
        type: "task",
        tag: "Tasks",
        title: "New comment on your task",
        message: `${req.user.name} commented on "${task.title}"`,
        details: preview,
        link: "/task",
        linkLabel: "Open Tasks",
      });
    }

    if (
      task.assignedById !== authorId &&
      task.assignedById !== task.assignedToId
    ) {
      await notifyUsers([task.assignedById], {
        from: authorId,
        type: "task",
        tag: "Tasks",
        title: "New comment on a task you assigned",
        message: `${req.user.name} commented on "${task.title}"`,
        details: preview,
        link: "/team-tasks",
        linkLabel: "Open Team Tasks",
      });
    }
  } catch (error) {
    console.error("Task comment notification failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Comment added.",
    comment: serializeComment(row, req.user.id),
  });
});

export const deleteTaskComment = asyncHandler(async (req, res) => {
  const task = await loadTaskForUser(req.user, req.params.taskId);

  const comment = await prisma.taskComment.findFirst({
    where: {
      id: String(req.params.commentId || ""),
      taskId: task.id,
    },
    select: { id: true, authorId: true },
  });

  if (!comment) throw new ApiError(404, "Comment not found.");

  if (
    !isAdminUser(req.user) &&
    comment.authorId !== String(req.user.id)
  ) {
    throw new ApiError(403, "You can only delete your own comments.");
  }

  await prisma.taskComment.delete({ where: { id: comment.id } });

  res.json({ success: true, message: "Comment deleted." });
});
