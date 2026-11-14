import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  allowRoles,
  allowTaskAssigners,
} from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { ROLES } from "../../constants/roles.js";
import ApiError from "../../utils/ApiError.js";
import { prisma } from "../../config/db.js";

import * as ctrl from "./users.controller.js";

import {
  idSchema,
  listSchema,
  createSchema,
  updateSchema,
  approveSchema,
  structureSchema,
} from "./users.validation.js";

const router = Router();

// Employee positions that may review signup requests (besides admins).
const SIGNUP_APPROVER_POSITIONS = [
  "project_manager",
  "hr",
  "team_lead",
  "manager",
];

// Admin, Project Manager, HR, Team Lead and Manager only.
// The position is read from the database, so an old token cannot fake it.
async function allowSignupApprovers(req, res, next) {
  try {
    if (req.user?.role === ROLES.ADMIN) return next();

    const userId = String(req.user?.id ?? req.user?._id ?? "");

    const row = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: {
            role: true,
            position: true,
            status: true,
            isDeleted: true,
          },
        })
      : null;

    const position = String(row?.position || "").trim().toLowerCase();

    const allowed =
      row &&
      !row.isDeleted &&
      row.status === "active" &&
      (row.role === ROLES.ADMIN ||
        (row.role === ROLES.EMPLOYEE &&
          SIGNUP_APPROVER_POSITIONS.includes(position)));

    if (!allowed) {
      throw new ApiError(
        403,
        "Only Admin, Project Manager, HR, Team Lead and Manager can review signup requests."
      );
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

// All user-management routes require authentication.
router.use(authenticate);

// People the current user may assign tasks to (admin, project manager,
// team lead, manager and HR). Must stay above the admin-only guard below.
router.get("/assignable", allowTaskAssigners, ctrl.assignable);

// Signup requests waiting for approval (must stay above "/:id").
router.get("/pending", allowSignupApprovers, ctrl.listPending);

// Approve / decline a signup request.
router.patch(
  "/:id/approve",
  allowSignupApprovers,
  validate(approveSchema),
  ctrl.approve
);
router.patch(
  "/:id/reject",
  allowSignupApprovers,
  validate(idSchema),
  ctrl.reject
);

// Everything below is for Admins only.
router.use(allowRoles(ROLES.ADMIN));

// Get employees/users with pagination and search.
router.get("/", validate(listSchema), ctrl.list);

// Live clock-in status of all employees (must stay above "/:id").
router.get("/live-status", ctrl.liveStatus);

// Create a new employee.
router.post("/", validate(createSchema), ctrl.create);

// Change position and reporting line (must stay above "/:id").
router.patch("/:id/structure", validate(structureSchema), ctrl.setStructure);

// Get a single employee by ID.
router.get("/:id", validate(idSchema), ctrl.getById);

// Update employee details.
router.patch("/:id", validate(updateSchema), ctrl.update);

// Deactivate an employee account.
router.patch("/:id/deactivate", validate(idSchema), ctrl.deactivate);

export default router;