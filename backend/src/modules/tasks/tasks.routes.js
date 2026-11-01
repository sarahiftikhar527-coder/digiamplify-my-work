
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";

import {
  employeeTaskStats,
  employeeTasks,
  updateTaskStatus,
  adminCreateTask,
  adminTasks,
  adminUpdateTask,
  adminUpdateTaskStatus,
  adminDeleteTask,
} from "./tasks.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/employee/stats",
  allowRoles(ROLES.EMPLOYEE),
  employeeTaskStats
);

router.get(
  "/employee",
  allowRoles(ROLES.EMPLOYEE),
  employeeTasks
);

router.patch(
  "/employee/:taskId/status",
  allowRoles(ROLES.EMPLOYEE),
  updateTaskStatus
);

router.get(
  "/admin",
  allowRoles(ROLES.ADMIN),
  adminTasks
);

router.post(
  "/",
  allowRoles(ROLES.ADMIN),
  adminCreateTask
);

router.patch(
  "/admin/:taskId/status",
  allowRoles(ROLES.ADMIN),
  adminUpdateTaskStatus
);

router.patch(
  "/admin/:taskId",
  allowRoles(ROLES.ADMIN),
  adminUpdateTask
);

router.delete(
  "/admin/:taskId",
  allowRoles(ROLES.ADMIN),
  adminDeleteTask
);

export default router;
