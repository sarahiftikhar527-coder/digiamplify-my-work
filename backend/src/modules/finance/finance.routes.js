
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { isFinanceUser } from "../../utils/permissions.js";

import {
  getDashboard,
  getPayroll,
  getMyFinanceDashboard,
  getMyPayroll,
  getMyPendingPayrollCount,
  addPayroll,
  editPayroll,
  removePayroll,
} from "./finance.controller.js";

const router = Router();

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required.",
    });
  }

  if (!isFinanceUser(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Finance access is required.",
    });
  }

  next();
};

router.use(authenticate);

// Personal finance routes available to authenticated employees.
router.get("/me/dashboard", getMyFinanceDashboard);
router.get("/me/payroll", getMyPayroll);
router.get("/me/pending-count", getMyPendingPayrollCount);

// Full finance access for Admin and Finance Manager.
router.use(requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/payroll", getPayroll);
router.post("/payroll", addPayroll);
router.patch("/payroll/:id", editPayroll);
router.delete("/payroll/:id", removePayroll);

export default router;
