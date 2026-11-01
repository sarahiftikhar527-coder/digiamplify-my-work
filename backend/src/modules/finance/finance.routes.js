
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  getDashboard,
  getPayroll,
  getMyFinanceDashboard,
  getMyPayroll,
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

  const role = String(req.user.role || "").trim().toLowerCase();

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  next();
};

router.use(authenticate);

router.get("/me/dashboard", getMyFinanceDashboard);
router.get("/me/payroll", getMyPayroll);

router.use(requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/payroll", getPayroll);
router.post("/payroll", addPayroll);
router.patch("/payroll/:id", editPayroll);
router.delete("/payroll/:id", removePayroll);

export default router;
