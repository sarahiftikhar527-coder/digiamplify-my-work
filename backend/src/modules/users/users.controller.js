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

// ---- Signup approval flow ----

export const listPending = asyncHandler(async (req, res) => {
  const requests = await service.listPendingEmployees();
  ok(res, { requests, total: requests.length }, "Pending requests retrieved successfully.");
});

export const approve = asyncHandler(async (req, res) => {
  const employee = await service.approveEmployee(req.params.id);
  ok(res, { employee }, "Employee approved successfully.");
});

export const reject = asyncHandler(async (req, res) => {
  const employee = await service.rejectEmployee(req.params.id);
  ok(res, { employee }, "Signup request declined.");
});

// ---- Live status (hierarchy page) ----

export const liveStatus = asyncHandler(async (req, res) => {
  const employees = await service.getLiveStatus();
  ok(res, { employees, total: employees.length }, "Live status retrieved successfully.");
});