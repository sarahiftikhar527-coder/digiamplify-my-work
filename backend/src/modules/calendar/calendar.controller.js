import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  updateCalendarEventStatus,
  deleteCalendarEvent,
  searchCalendarApprovers,
  actorFromUser,
} from "./calendar.service.js";

const getUserId = (req) =>
  req.user?._id?.toString?.() ||
  req.user?.id?.toString?.() ||
  null;

const getErrorStatus = (error) => {
  if (error?.statusCode === 403) {
    return 403;
  }

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
    message.includes("must be") ||
    message.includes("not available")
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
      req.validated?.query?.q || ""
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

    const query = req.validated?.query || {};

    const events = await getCalendarEvents(actorFromUser(req.user), query);

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

    const event = await getCalendarEventById(
      actorFromUser(req.user),
      req.params.id
    );

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

    const payload = { ...(req.validated?.body || {}) };

    const event = await createCalendarEvent(
      actorFromUser(req.user),
      payload
    );

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
      actorFromUser(req.user),
      req.params.id,
      req.validated?.body || {}
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

    const status = req.validated?.body?.status;

    const event = await updateCalendarEventStatus(
      actorFromUser(req.user),
      req.params.id,
      status
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

    await deleteCalendarEvent(actorFromUser(req.user), req.params.id);

    return res.status(200).json({
      success: true,
      message: "Calendar event deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
