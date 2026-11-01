import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  updateCalendarEventStatus,
  deleteCalendarEvent,
  searchCalendarApprovers,
} from "./calendar.service.js";

const getUserId = (req) =>
  req.user?._id?.toString?.() ||
  req.user?.id?.toString?.() ||
  null;

const getErrorStatus = (error) => {
  const message = String(error?.message || "").toLowerCase();

  if (
    message.includes("not found") ||
    message.includes("does not exist")
  ) {
    return 404;
  }

  if (message.includes("unauthorized")) return 401;
  if (message.includes("forbidden")) return 403;

  if (
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("cannot be") ||
    message.includes("must be")
  ) {
    return 400;
  }

  return 500;
};

const handleError = (res, error) => {
  const statusCode = getErrorStatus(error);

  if (statusCode === 500) {
    console.error("Calendar controller error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Something went wrong while processing the calendar request."
        : error?.message || "Calendar request failed.",
  });
};

const requireUser = (req, res) => {
  if (!getUserId(req)) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });

    return false;
  }

  return true;
};

export const getApprovers = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const approvers = await searchCalendarApprovers(
      String(req.query.q || "").trim()
    );

    return res.status(200).json({
      success: true,
      count: approvers.length,
      data: approvers,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getEvents = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const events = await getCalendarEvents({
      from: req.query.from,
      to: req.query.to,
      eventType: req.query.eventType,
      status: req.query.status,
      employeeId: req.query.employeeId,
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getEvent = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const event = await getCalendarEventById(req.params.id);

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const userId = getUserId(req);
    const payload = { ...(req.body || {}) };

    if (typeof payload.approverIds === "string") {
      try {
        payload.approverIds = JSON.parse(payload.approverIds);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Approver IDs must be a valid JSON array.",
        });
      }
    }

    if (typeof payload.attachments === "string") {
      try {
        payload.attachments = JSON.parse(payload.attachments);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Attachments must be a valid JSON array.",
        });
      }
    }

    if (payload.eventType === "leave") {
      payload.status = "pending";
      payload.employeeId = userId;
    }

    const event = await createCalendarEvent(payload, userId);

    return res.status(201).json({
      success: true,
      message:
        payload.eventType === "leave"
          ? "Leave request submitted successfully."
          : "Calendar event created successfully.",
      data: event,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateEvent = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const event = await updateCalendarEvent(
      req.params.id,
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Calendar event updated successfully.",
      data: event,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    const status = String(req.body?.status || "").toLowerCase();

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const event = await updateCalendarEventStatus(
      req.params.id,
      status,
      getUserId(req)
    );

    return res.status(200).json({
      success: true,
      message: `Calendar event ${status} successfully.`,
      data: event,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const removeEvent = async (req, res) => {
  try {
    if (!requireUser(req, res)) return;

    await deleteCalendarEvent(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Calendar event deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};