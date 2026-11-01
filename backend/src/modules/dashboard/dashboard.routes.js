
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";

import {
  adminStats,
  clockedInDetails,
  completedTasksDetails,
  overdueTasksDetails,
  adminTasksByStatus,
} from "./dashboard.controller.js";

const router = Router();

// All dashboard routes below require an authenticated Admin.
router.use(authenticate, allowRoles(ROLES.ADMIN));

router.get("/admin/stats", adminStats);

router.get("/admin/clocked-in", clockedInDetails);

router.get("/admin/completed-tasks", completedTasksDetails);

router.get("/admin/overdue-tasks", overdueTasksDetails);

router.get("/admin/tasks", adminTasksByStatus);

export default router;
