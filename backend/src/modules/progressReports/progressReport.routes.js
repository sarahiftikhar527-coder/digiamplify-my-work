import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  submitEmployeeReport,
  listEmployeeReports,
  listAdminReports,
  updateReportReview,
  adminProgressMetrics,
} from "./progressReport.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/mine",
  allowRoles(ROLES.EMPLOYEE),
  listEmployeeReports
);

router.post(
  "/",
  allowRoles(ROLES.EMPLOYEE),
  submitEmployeeReport
);

router.get(
  "/admin",
  allowRoles(ROLES.ADMIN),
  listAdminReports
);

router.get(
  "/admin/metrics",
  allowRoles(ROLES.ADMIN),
  adminProgressMetrics
);

router.patch(
  "/admin/:reportId/review",
  allowRoles(ROLES.ADMIN),
  updateReportReview
);

export default router;