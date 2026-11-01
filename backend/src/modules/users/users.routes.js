
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

// Create a new employee.
router.post("/", validate(createSchema), ctrl.create);

// Get a single employee by ID.
router.get("/:id", validate(idSchema), ctrl.getById);

// Update employee details.
router.patch("/:id", validate(updateSchema), ctrl.update);

// Deactivate an employee account.
router.patch("/:id/deactivate", validate(idSchema), ctrl.deactivate);

export default router;
