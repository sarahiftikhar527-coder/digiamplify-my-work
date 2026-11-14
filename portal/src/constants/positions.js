// Company positions. A user's base `role` stays "admin" or "employee";
// the position adds extra abilities inside the employee portal.
export const POSITIONS = {
  EMPLOYEE: "employee",
  HR: "hr",
  MANAGER: "manager",
  TEAM_LEAD: "team_lead",
  PROJECT_MANAGER: "project_manager",
  FINANCE_MANAGER: "finance_manager",
};

export const POSITION_LABELS = {
  [POSITIONS.EMPLOYEE]: "Employee",
  [POSITIONS.HR]: "HR",
  [POSITIONS.MANAGER]: "Manager",
  [POSITIONS.TEAM_LEAD]: "Team Lead",
  [POSITIONS.PROJECT_MANAGER]: "Project Manager",
  [POSITIONS.FINANCE_MANAGER]: "Finance Manager",
};

export const POSITION_DESCRIPTIONS = {
  [POSITIONS.EMPLOYEE]: "Works on assigned tasks and manages their own work.",
  [POSITIONS.HR]: "Assigns tasks to the people who report to them.",
  [POSITIONS.MANAGER]: "Assigns tasks to the people who report to them.",
  [POSITIONS.TEAM_LEAD]: "Assigns tasks to the people in their team.",
  [POSITIONS.PROJECT_MANAGER]: "Assigns tasks to every employee.",
  [POSITIONS.FINANCE_MANAGER]: "Full control of payroll, receipts and finance.",
};

export const POSITION_OPTIONS = Object.values(POSITIONS).map((value) => ({
  value,
  label: POSITION_LABELS[value],
  description: POSITION_DESCRIPTIONS[value],
}));

// Positions that can be chosen as the person someone reports to.
export const LEADER_POSITIONS = [
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.TEAM_LEAD,
  POSITIONS.MANAGER,
  POSITIONS.HR,
  POSITIONS.FINANCE_MANAGER,
];

export const TASK_ASSIGNER_POSITIONS = [
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.TEAM_LEAD,
  POSITIONS.MANAGER,
  POSITIONS.HR,
];

// Employee positions that may change reporting lines (drag and drop).
export const HIERARCHY_MANAGER_POSITIONS = [
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.TEAM_LEAD,
];

// Employee positions that may review signup requests (besides admins).
export const SIGNUP_APPROVER_POSITIONS = [
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.HR,
  POSITIONS.TEAM_LEAD,
  POSITIONS.MANAGER,
];

const clean = (value) => String(value || "").trim().toLowerCase();

export const getPosition = (user) =>
  clean(user?.position) || POSITIONS.EMPLOYEE;

export const getPositionLabel = (position) =>
  POSITION_LABELS[clean(position)] || POSITION_LABELS[POSITIONS.EMPLOYEE];

export const isAdminUser = (user) => clean(user?.role) === "admin";

export const canAssignTasks = (user) =>
  clean(user?.role) === "employee" &&
  TASK_ASSIGNER_POSITIONS.includes(getPosition(user));

export const isFinanceManager = (user) =>
  clean(user?.role) === "employee" &&
  getPosition(user) === POSITIONS.FINANCE_MANAGER;

// Admin, Project Manager and Team Lead can drag and drop the hierarchy.
export const canManageHierarchy = (user) =>
  isAdminUser(user) ||
  (clean(user?.role) === "employee" &&
    HIERARCHY_MANAGER_POSITIONS.includes(getPosition(user)));

// Admin, Project Manager, HR, Team Lead and Manager can review signups.
export const canApproveSignups = (user) =>
  isAdminUser(user) ||
  (clean(user?.role) === "employee" &&
    SIGNUP_APPROVER_POSITIONS.includes(getPosition(user)));