import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { ROLES } from "../../constants/roles.js";

import * as ctrl from "./users.controller.js";

import {
  idSchema,
  listSchema,
  createSchema,
  updateSchema,
} from "./users.validation.js";

const router = Router();

// All user-management routes require authentication.
router.use(authenticate);

// Only Admins can manage employees.
router.use(allowRoles(ROLES.ADMIN));

// Get employees/users with pagination and search.
router.get("/", validate(listSchema), ctrl.list);

// Signup requests waiting for approval (must stay above "/:id").
router.get("/pending", ctrl.listPending);

// Live clock-in status of all employees (must stay above "/:id").
router.get("/live-status", ctrl.liveStatus);

// Create a new employee.
router.post("/", validate(createSchema), ctrl.create);

// Approve / decline a signup request.
router.patch("/:id/approve", validate(idSchema), ctrl.approve);
router.patch("/:id/reject", validate(idSchema), ctrl.reject);

// Get a single employee by ID.
router.get("/:id", validate(idSchema), ctrl.getById);

// Update employee details.
router.patch("/:id", validate(updateSchema), ctrl.update);

// Deactivate an employee account.
router.patch("/:id/deactivate", validate(idSchema), ctrl.deactivate);

export default router;