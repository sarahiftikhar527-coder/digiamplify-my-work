import * as service from "./attendance.service.js";

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
  service.getMyToday(req.user._id)
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
  service.clockIn(req.user._id, req.body?.pin)
);

export const clockOut = handle((req) =>
  service.clockOut(
    req.user._id,
    req.body?.pin,
    req.body?.description
  )
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
  service.requestPinReset(req.body?.email)
);

export const resetPin = handle((req) =>
  service.resetPin(
    req.body?.token,
    req.body?.newPin
  )
);

export const adminSummary = handle((req) =>
  service.getAdminOverview(req.query)
);

export const adminRecords = handle((req) =>
  service.getAdminOverview(req.query)
);

export const employeeAttendance = handle((req) =>
  service.getEmployeeAttendance(req.params.userId)
);

export const setEmployeePin = handle((req) =>
  service.setEmployeePin(
    req.params.userId,
    req.body?.newPin
  )
);