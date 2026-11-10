import apiClient, { unwrap } from "./api/apiClient.js";

export const clockInService = {
  getToday: () => unwrap(apiClient.get("/attendance/today")),

  getRecent: () => unwrap(apiClient.get("/attendance/me/recent")),

  // Today's status of the whole team (everyone can read it).
  getTeamToday: () => unwrap(apiClient.get("/attendance/team/today")),

  clockIn: ({ pin }) =>
    unwrap(apiClient.post("/attendance/clock-in", { pin })),

  clockOut: ({ pin, description }) =>
    unwrap(
      apiClient.post("/attendance/clock-out", {
        pin,
        description,
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
};