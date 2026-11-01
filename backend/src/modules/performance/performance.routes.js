
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { employeePerformance } from "./performance.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/employee",
  allowRoles(ROLES.EMPLOYEE),
  employeePerformance
);

export default router;
