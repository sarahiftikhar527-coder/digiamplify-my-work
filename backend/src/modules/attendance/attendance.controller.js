import * as service from "./attendance.service.js";
import * as sessionService from "./attendanceSessions.service.js";
import * as teamService from "./teamAttendance.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const data = await fn(req, res);

    if (res.headersSent) {
      return;
    }

    return res.status(200).json({
      success: true,
      message: data?.message || "Request successful.",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const myToday = handle((req) =>
  sessionService.getMyToday(req.user._id)
);

export const myRecent = handle((req) =>
  service.getMyRecent(req.user._id)
);

export const myAbsenteeism = handle((req) =>
  service.getMyAbsenteeism(
    req.user._id,
    req.query.month
  )
);

export const clockIn = handle((req) =>
  sessionService.clockIn(req.user._id, req.body?.pin)
);

export const clockOut = handle((req) =>
  sessionService.clockOut(
    req.user._id,
    req.body?.pin,
    req.body?.description
  )
);

export const startBreak = handle((req) =>
  sessionService.startBreak(req.user._id, req.body?.type)
);

export const endBreak = handle((req) =>
  sessionService.endBreak(req.user._id)
);

export const completeShift = handle((req) =>
  service.completeMyShift(
    req.user._id,
    req.params.shiftId
  )
);

export const setPin = handle((req) =>
  service.setPin(
    req.user._id,
    req.body?.password,
    req.body?.newPin
  )
);

export const requestPinReset = handle((req) =>
  service.requestPinReset(req.validated?.body?.email)
);

export const resetPin = handle((req) =>
  service.resetPin(
    req.validated?.body?.token,
    req.validated?.body?.newPin
  )
);

export const adminSummary = handle((req) =>
  sessionService.getAdminOverview(req.query)
);

export const adminRecords = handle((req) =>
  sessionService.getAdminOverview(req.query)
);

export const employeeAttendance = handle((req) =>
  sessionService.getEmployeeAttendance(req.params.userId)
);

export const setEmployeePin = handle((req) =>
  service.setEmployeePin(
    req.params.userId,
    req.body?.newPin
  )
);

// Live clock-in board of the whole team (admins and employees).
export const teamLive = handle((req) =>
  teamService.getTeamLive(req.user, req.query)
);