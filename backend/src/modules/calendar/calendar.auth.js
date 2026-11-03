export const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export const EMPLOYEE_CREATABLE_EVENT_TYPES = new Set(["leave"]);

export const LOCKED_EMPLOYEE_STATUSES = new Set([
  "approved",
  "rejected",
  "completed",
  "cancelled",
  "absent",
]);

export function isAdmin(user) {
  return ADMIN_ROLES.has(String(user?.role || "").trim().toLowerCase());
}

export function forbidden(message = "You do not have permission to perform this action.") {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
}

export function eventOwnerId(event) {
  if (!event) return null;

  if (event.employeeId != null) {
    return String(event.employeeId?._id || event.employeeId);
  }

  if (event.createdBy != null) {
    return String(event.createdBy?._id || event.createdBy);
  }

  return null;
}

export function isCompanyHoliday(event) {
  return event?.eventType === "holiday" && event?.employeeId == null;
}

export function canEmployeeReadEvent(event, userId) {
  if (isCompanyHoliday(event)) {
    return true;
  }

  const owner = eventOwnerId(event);
  return owner != null && owner === String(userId);
}

export function canEmployeeMutateEvent(event, userId) {
  if (isCompanyHoliday(event)) {
    return false;
  }

  const owner = eventOwnerId(event);
  if (owner !== String(userId)) {
    return false;
  }

  return !LOCKED_EMPLOYEE_STATUSES.has(String(event.status || "").toLowerCase());
}

export function assertEmployeeCreateEventType(eventType) {
  if (!EMPLOYEE_CREATABLE_EVENT_TYPES.has(eventType)) {
    throw forbidden(
      "You do not have permission to create this type of calendar event."
    );
  }
}

export function assertAdminOnlyCreateEventType(eventType) {
  if (["holiday", "shift", "attendance"].includes(eventType)) {
    return;
  }

  if (EMPLOYEE_CREATABLE_EVENT_TYPES.has(eventType)) {
    return;
  }

  throw new Error("Invalid calendar event type.");
}
