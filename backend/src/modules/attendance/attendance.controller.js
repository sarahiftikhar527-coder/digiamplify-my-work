import * as service from "./attendance.service.js";
import * as sessionService from "./attendanceSessions.service.js";
import * as teamService from "./teamAttendance.service.js";
import * as taskService from "./attendanceTasks.service.js";
import { broadcastMemberUpdate } from "./attendanceTeam.service.js";
import { emitToAll } from "../../sockets/index.js";

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

// Adds the employee's tasks of today to an attendance snapshot.
// A task problem must never break clock in / clock out.
const withTasks = async (userId, data) => {
  try {
    const tasks = await taskService.getClockInTasks(userId);

    return { ...data, tasks };
  } catch (error) {
    console.error("[ATTENDANCE] tasks could not be loaded:", error?.message);

    return { ...data, tasks: Array.isArray(data?.tasks) ? data.tasks : [] };
  }
};

// Tells every open Clock In page (employees and admin) that someone
// clocked in, clocked out or changed a break. Never throws.
const announceChange = (userId) => {
  try {
    broadcastMemberUpdate(userId);
    emitToAll("attendance:live-update", { userId: String(userId) });
  } catch (error) {
    console.error("[ATTENDANCE] live update failed:", error?.message);
  }
};

const afterChange = async (userId, data) => {
  announceChange(userId);

  return withTasks(userId, data);
};

export const myToday = handle(async (req) =>
  withTasks(req.user._id, await sessionService.getMyToday(req.user._id))
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

export const clockIn = handle(async (req) =>
  afterChange(
    req.user._id,
    await sessionService.clockIn(req.user._id, req.body?.pin)
  )
);

export const clockOut = handle(async (req) => {
  const userId = req.user._id;
  const taskIds = req.body?.completedTaskIds;

  // The ticked tasks are written into the description of the clock out.
  const prepared = await taskService.prepareClockOutNote(
    userId,
    req.body?.description,
    taskIds
  );

  const data = await sessionService.clockOut(
    userId,
    req.body?.pin,
    prepared.note
  );

  // The PIN was correct and the clock out is saved: now update the tasks.
  await taskService.applyClockOutChecklist(
    userId,
    taskIds,
    req.body?.description
  );

  return afterChange(userId, data);
});

export const startBreak = handle(async (req) =>
  afterChange(
    req.user._id,
    await sessionService.startBreak(req.user._id, req.body?.type)
  )
);

export const endBreak = handle(async (req) =>
  afterChange(
    req.user._id,
    await sessionService.endBreak(req.user._id)
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

// Older team card (/team/today): it needs `workedSeconds` on every member.
export const teamToday = handle(async (req) => {
  const data = await teamService.getTeamLive(req.user, req.query);

  return {
    ...data,
    members: (data.members || []).map((member) => ({
      ...member,
      workedSeconds: Math.round((Number(member.workedMinutes) || 0) * 60),
    })),
  };
});