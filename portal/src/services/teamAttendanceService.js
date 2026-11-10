import apiClient, { unwrap } from "./api/apiClient.js";

export const teamAttendanceService = {
  // Live clock-in board for the whole team.
  // Admins may pass { date: "YYYY-MM-DD" } to look at an earlier day.
  getLive: (params = {}) =>
    unwrap(apiClient.get("/attendance/team/live", { params })),
};