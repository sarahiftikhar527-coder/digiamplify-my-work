import { ROLES } from "../constants/roles.js";
import {
  POSITIONS,
  TASK_ASSIGNER_POSITIONS,
} from "../constants/positions.js";

const clean = (value) => String(value || "").trim().toLowerCase();

export const isAdminUser = (user) =>
  ["admin", "superadmin"].includes(clean(user?.role));

export const getPosition = (user) =>
  clean(user?.position) || POSITIONS.EMPLOYEE;

// Admin and Finance Manager can use the full finance area.
export const isFinanceUser = (user) =>
  isAdminUser(user) ||
  (clean(user?.role) === ROLES.EMPLOYEE &&
    getPosition(user) === POSITIONS.FINANCE_MANAGER);

// Admin, Project Manager, Team Lead, Manager and HR can assign tasks.
export const canAssignTasks = (user) =>
  isAdminUser(user) ||
  (clean(user?.role) === ROLES.EMPLOYEE &&
    TASK_ASSIGNER_POSITIONS.includes(getPosition(user)));

// Admin and Project Manager can assign tasks to everyone.
export const assignsToEveryone = (user) =>
  isAdminUser(user) ||
  (clean(user?.role) === ROLES.EMPLOYEE &&
    getPosition(user) === POSITIONS.PROJECT_MANAGER);