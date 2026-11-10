import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/ApiResponse.js";
import * as service from "./meetings.service.js";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const list = asyncHandler(async (req, res) => {
  const query = { ...(req.validated?.query || {}) };
  const raw = req.query || {};
  query.toIsDateOnly = typeof raw.to === "string" && DATE_ONLY.test(raw.to);
  const data = await service.listMeetings(req.user, query);
  return res.json({ success: true, count: data.length, data });
});

export const getOne = asyncHandler(async (req, res) =>
  ok(res, await service.getMeeting(req.user, req.params.id))
);

export const directory = asyncHandler(async (req, res) =>
  ok(res, await service.searchDirectory(req.user, req.validated?.query?.q))
);

export const summary = asyncHandler(async (req, res) =>
  ok(res, await service.getSummary(req.user, { tzOffset: Number(req.query?.tzOffset) || 0 }))
);

export const conflicts = asyncHandler(async (req, res) =>
  ok(res, await service.findConflicts(req.user, req.validated.body))
);

export const create = asyncHandler(async (req, res) =>
  ok(res, await service.createMeeting(req.user, req.validated.body), "Meeting scheduled successfully.", 201)
);

export const update = asyncHandler(async (req, res) =>
  ok(res, await service.updateMeeting(req.user, req.params.id, req.validated.body), "Meeting updated successfully.")
);

export const respond = asyncHandler(async (req, res) =>
  ok(res, await service.respondToMeeting(req.user, req.params.id, req.validated.body.response), "Response saved.")
);

export const cancel = asyncHandler(async (req, res) =>
  ok(res, await service.cancelMeeting(req.user, req.params.id, req.validated.body), "Meeting cancelled.")
);

export const complete = asyncHandler(async (req, res) =>
  ok(res, await service.completeMeeting(req.user, req.params.id), "Meeting marked as completed.")
);

export const remove = asyncHandler(async (req, res) => {
  await service.deleteMeeting(req.user, req.params.id);
  return ok(res, null, "Meeting deleted successfully.");
});