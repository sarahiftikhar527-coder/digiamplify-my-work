
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  allowRoles,
  allowTaskAssigners,
} from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";

import {
  employeeTaskStats,
  employeeTasks,
  employeeWorkspace,
  employeeTeamTasks,
  updateTaskStatus,
  employeeDailyUpdate,
  employeeCreatePersonalTask,
  employeeUpdatePersonalTask,
  employeeDeletePersonalTask,
  adminCreateTask,
  adminTasks,
  adminDailyUpdates,
  adminActivity,
  adminUpdateTask,
  adminUpdateTaskStatus,
  adminDeleteTask,
} from "./tasks.controller.js";

import { adminTaskReport } from "./tasks.report.controller.js";

import { submitTaskForReview, reviewTask } from "./tasks.review.js";

import {
  listTaskComments,
  addTaskComment,
  deleteTaskComment,
  getTaskCommentUnreadCount,
  markTaskCommentsRead,
} from "./tasks.comments.js";

const router = Router();

router.use(authenticate);

/* Employee */
router.get("/employee/stats", allowRoles(ROLES.EMPLOYEE), employeeTaskStats);
router.get("/employee/workspace", allowRoles(ROLES.EMPLOYEE), employeeWorkspace);
router.get("/employee/team", allowRoles(ROLES.EMPLOYEE), employeeTeamTasks);
router.get("/employee", allowRoles(ROLES.EMPLOYEE), employeeTasks);

router.post(
  "/employee/personal",
  allowRoles(ROLES.EMPLOYEE),
  employeeCreatePersonalTask
);

router.patch(
  "/employee/personal/:taskId",
  allowRoles(ROLES.EMPLOYEE),
  employeeUpdatePersonalTask
);

router.delete(
  "/employee/personal/:taskId",
  allowRoles(ROLES.EMPLOYEE),
  employeeDeletePersonalTask
);

router.post(
  "/employee/:taskId/daily-update",
  allowRoles(ROLES.EMPLOYEE),
  employeeDailyUpdate
);

/* Submit finished work for review (description is required) */
router.post(
  "/employee/:taskId/submit-review",
  allowRoles(ROLES.EMPLOYEE),
  submitTaskForReview
);

router.patch(
  "/employee/:taskId/status",
  allowRoles(ROLES.EMPLOYEE),
  updateTaskStatus
);

/* Admin + Task Assigners */
router.get("/admin", allowTaskAssigners, adminTasks);
router.get("/admin/daily-updates", allowTaskAssigners, adminDailyUpdates);
router.get("/admin/activity", allowTaskAssigners, adminActivity);
router.get("/admin/report", allowRoles(ROLES.ADMIN), adminTaskReport);

router.post("/", allowTaskAssigners, adminCreateTask);

/* Approve or disapprove a task that is in review */
router.post("/admin/:taskId/review", allowTaskAssigners, reviewTask);

router.patch(
  "/admin/:taskId/status",
  allowTaskAssigners,
  adminUpdateTaskStatus
);

router.patch("/admin/:taskId", allowTaskAssigners, adminUpdateTask);
router.delete("/admin/:taskId", allowTaskAssigners, adminDeleteTask);

/* Task chat (comments): admin, assignee, creator and the assignee's leaders */
router.get("/:taskId/comments/unread-count", getTaskCommentUnreadCount);
router.post("/:taskId/comments/read", markTaskCommentsRead);

router.get("/:taskId/comments", listTaskComments);
router.post("/:taskId/comments", addTaskComment);
router.delete("/:taskId/comments/:commentId", deleteTaskComment);

export default router;
