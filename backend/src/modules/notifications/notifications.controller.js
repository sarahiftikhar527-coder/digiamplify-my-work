import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/ApiResponse.js";
import * as service from "./notifications.service.js";

export const list = asyncHandler(async (req, res) => {
  const result = await service.listForUser(
    req.user.id || req.user._id,
    req.validated.query
  );

  return ok(res, result);
});

export const listEmployees = asyncHandler(async (req, res) => {
  const employees = await service.listEmployeesForNotifications();
  return ok(res, employees);
});

export const send = asyncHandler(async (req, res) => {
  const count = await service.send(
    req.user,
    req.validated.body
  );

  return ok(
    res,
    { count },
    `Sent to ${count} employee(s)`,
    201
  );
});

export const markRead = asyncHandler(async (req, res) => {
  await service.markRead(
    req.user.id || req.user._id,
    req.validated.params.id
  );

  return ok(res, null);
});

export const markUnread = asyncHandler(async (req, res) => {
  await service.markUnread(
    req.user.id || req.user._id,
    req.validated.params.id
  );

  return ok(res, null);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user.id || req.user._id);
  return ok(res, null);
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(
    req.user.id || req.user._id,
    req.validated.params.id
  );

  return ok(res, null);
});

export const clearAll = asyncHandler(async (req, res) => {
  await service.clearAll(req.user.id || req.user._id);
  return ok(res, null);
});

export const getPreferences = asyncHandler(async (req, res) => {
  const items = await service.getPreferences(
    req.user.id || req.user._id
  );

  return ok(res, { items });
});

export const setPreference = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { params, body } = req.validated;

  const items = await service.setPreference(
    userId,
    params.key,
    body.on
  );

  return ok(res, { items });
});