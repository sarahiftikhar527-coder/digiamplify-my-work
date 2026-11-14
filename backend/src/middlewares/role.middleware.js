import ApiError from "../utils/ApiError.js";
import { canAssignTasks, isFinanceUser } from "../utils/permissions.js";

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to do this"));
  }

  next();
};

// Admin, Project Manager, Team Lead, Manager and HR.
export const allowTaskAssigners = (req, res, next) => {
  if (!req.user || !canAssignTasks(req.user)) {
    return next(new ApiError(403, "You do not have permission to assign tasks."));
  }

  next();
};

// Admin and Finance Manager.
export const allowFinance = (req, res, next) => {
  if (!req.user || !isFinanceUser(req.user)) {
    return next(new ApiError(403, "Finance access is required."));
  }

  next();
};