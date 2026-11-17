import apiClient, { unwrap } from "./api/apiClient.js";

export const clockInService = {
  getToday: () => unwrap(apiClient.get("/attendance/today")),

  getRecent: () => unwrap(apiClient.get("/attendance/me/recent")),

  // Day / week / month hours of the signed-in person.
  getHours: () => unwrap(apiClient.get("/attendance/me/hours")),

  // Today's status of the whole team (everyone can read it).
  getTeamToday: () => unwrap(apiClient.get("/attendance/team/today")),

  clockIn: ({ pin }) =>
    unwrap(apiClient.post("/attendance/clock-in", { pin })),

  // completedTaskIds: the tasks ticked in the clock out checklist.
  clockOut: ({ pin, description, completedTaskIds = [] }) =>
    unwrap(
      apiClient.post("/attendance/clock-out", {
        pin,
        description,
        completedTaskIds,
      })
    ),

  startBreak: (type = "other") =>
    unwrap(apiClient.post("/attendance/break/start", { type })),

  endBreak: () => unwrap(apiClient.post("/attendance/break/end")),

  setPin: ({ password, newPin }) =>
    unwrap(
      apiClient.post("/attendance/pin/set", {
        password,
        newPin,
      })
    ),

  forgotPin: ({ email }) =>
    unwrap(apiClient.post("/attendance/pin/forgot", { email })),

  resetPin: ({ token, newPin }) =>
    unwrap(
      apiClient.post("/attendance/pin/reset", {
        token,
        newPin,
      })
    ),

  // Admin: break limits, default hours and employee schedules.
  getRules: () => unwrap(apiClient.get("/attendance/rules")),

  updateRules: (body) =>
    unwrap(apiClient.put("/attendance/admin/rules", body)),

  getSchedules: () => unwrap(apiClient.get("/attendance/admin/schedules")),

  saveSchedule: (userId, body) =>
    unwrap(apiClient.put(`/attendance/admin/employee/${userId}/schedule`, body)),
};