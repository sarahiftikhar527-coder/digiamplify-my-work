import { Router } from "express";
import * as controller from "./attendance.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  pinForgotIpLimiter,
  pinForgotEmailLimiter,
  pinResetLimiter,
} from "../../middlewares/rateLimit.middleware.js";
import {
  pinForgotSchema,
  pinResetSchema,
} from "./attendance.validation.js";

const router = Router();

router.post(
  "/pin/forgot",
  pinForgotIpLimiter,
  validate(pinForgotSchema),
  pinForgotEmailLimiter,
  controller.requestPinReset
);

router.post(
  "/pin/reset",
  pinResetLimiter,
  validate(pinResetSchema),
  controller.resetPin
);

router.use(authenticate);

router.get("/today", controller.myToday);
router.get("/me/today", controller.myToday);
router.get("/me/recent", controller.myRecent);
router.get("/me/absenteeism", controller.myAbsenteeism);

router.post("/clock-in", controller.clockIn);
router.post("/clock-out", controller.clockOut);
router.post("/pin/set", controller.setPin);

router.patch("/shifts/:shiftId/complete", controller.completeShift);

router.get(
  "/admin/summary",
  allowRoles(ROLES.ADMIN),
  controller.adminSummary
);

router.get(
  "/admin/records",
  allowRoles(ROLES.ADMIN),
  controller.adminRecords
);

router.get(
  "/admin/employee/:userId",
  allowRoles(ROLES.ADMIN),
  controller.employeeAttendance
);

router.get(
  "/overview",
  allowRoles(ROLES.ADMIN),
  controller.adminSummary
);

router.patch(
  "/admin/employee/:userId/pin",
  allowRoles(ROLES.ADMIN),
  controller.setEmployeePin
);

export default router;