import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";

import {
  employeeTaskStats,
  employeeTasks,
  employeeWorkspace,
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

const router = Router();

router.use(authenticate);

/* Employee */
router.get("/employee/stats", allowRoles(ROLES.EMPLOYEE), employeeTaskStats);
router.get("/employee/workspace", allowRoles(ROLES.EMPLOYEE), employeeWorkspace);
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
router.patch(
  "/employee/:taskId/status",
  allowRoles(ROLES.EMPLOYEE),
  updateTaskStatus
);

/* Admin */
router.get("/admin", allowRoles(ROLES.ADMIN), adminTasks);
router.get("/admin/daily-updates", allowRoles(ROLES.ADMIN), adminDailyUpdates);
router.get("/admin/activity", allowRoles(ROLES.ADMIN), adminActivity);
router.get("/admin/report", allowRoles(ROLES.ADMIN), adminTaskReport);
router.post("/", allowRoles(ROLES.ADMIN), adminCreateTask);
router.patch(
  "/admin/:taskId/status",
  allowRoles(ROLES.ADMIN),
  adminUpdateTaskStatus
);
router.patch("/admin/:taskId", allowRoles(ROLES.ADMIN), adminUpdateTask);
router.delete("/admin/:taskId", allowRoles(ROLES.ADMIN), adminDeleteTask);

export default router;