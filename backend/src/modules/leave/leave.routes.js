
import { Router } from "express";
import {
  createLeave,
  getMyLeaves,
  cancelMyLeave,
  getLeaveBalances,
  getAllLeaves,
  reviewLeave,
  updateLeaveRemarks,
} from "./leave.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createLeave);
router.get("/mine", getMyLeaves);
router.get("/balances", getLeaveBalances);
router.patch("/:id/cancel", cancelMyLeave);

router.get("/", allowRoles("admin"), getAllLeaves);
router.patch("/:id/review", allowRoles("admin"), reviewLeave);
router.patch("/:id/remarks", allowRoles("admin"), updateLeaveRemarks);

export default router;
