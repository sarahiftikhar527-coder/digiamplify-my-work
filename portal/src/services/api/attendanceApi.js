
import apiClient, { unwrap } from "./apiClient.js";

export const getAttendanceSummary = (params = {}) =>
  unwrap(apiClient.get("/attendance/admin/summary", { params }));

export const getAttendanceRecords = (params = {}) =>
  unwrap(apiClient.get("/attendance/admin/records", { params }));

export const getEmployeeAttendance = (userId) =>
  unwrap(apiClient.get(`/attendance/admin/employee/${userId}`));
