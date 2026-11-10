import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/ApiResponse.js";
import * as service from "./hierarchy.service.js";

export const get = asyncHandler(async (req, res) => {
  const data = await service.getHierarchy(req.user);
  ok(res, data, "Hierarchy retrieved successfully.");
});

export const setManager = asyncHandler(async (req, res) => {
  const raw = req.body?.managerId;
  const managerId = raw ? String(raw) : null;

  const result = await service.setManager(req.user, req.params.userId, managerId);
  ok(res, result, "Reporting line updated.");
});