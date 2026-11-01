
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/ApiResponse.js";
import * as service from "./users.service.js";

export const list = asyncHandler(async (req, res) => {
  const employees = await service.getEmployees(req.validated?.query ?? {});
  ok(res, { employees }, "Employees retrieved successfully.");
});

export const create = asyncHandler(async (req, res) => {
  const employee = await service.createEmployee(req.validated?.body ?? req.body);
  ok(res, { employee }, "Employee created successfully.", 201);
});

export const getById = asyncHandler(async (req, res) => {
  const employee = await service.getEmployeeById(req.params.id);
  ok(res, { employee }, "Employee retrieved successfully.");
});

export const update = asyncHandler(async (req, res) => {
  const employee = await service.updateEmployee(
    req.params.id,
    req.validated?.body ?? req.body
  );
  ok(res, { employee }, "Employee updated successfully.");
});

export const deactivate = asyncHandler(async (req, res) => {
  await service.deactivateEmployee(req.params.id);
  ok(res, null, "Employee deactivated successfully.");
});
