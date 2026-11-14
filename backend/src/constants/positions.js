// Company positions. The base `role` of a user stays "admin" or "employee";
// the position adds extra abilities on top of the employee portal.
export const POSITIONS = Object.freeze({
  EMPLOYEE: "employee",
  HR: "hr",
  MANAGER: "manager",
  TEAM_LEAD: "team_lead",
  PROJECT_MANAGER: "project_manager",
  FINANCE_MANAGER: "finance_manager",
});

export const POSITION_VALUES = Object.values(POSITIONS);

// Positions that can assign tasks to the people below them.
export const TASK_ASSIGNER_POSITIONS = Object.freeze([
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.TEAM_LEAD,
  POSITIONS.MANAGER,
  POSITIONS.HR,
]);

// Positions that can be chosen as "reports to" for another person.
export const LEADER_POSITIONS = Object.freeze([
  POSITIONS.PROJECT_MANAGER,
  POSITIONS.TEAM_LEAD,
  POSITIONS.MANAGER,
  POSITIONS.HR,
  POSITIONS.FINANCE_MANAGER,
]);