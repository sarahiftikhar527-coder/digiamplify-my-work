import mongoose from "../../utils/mongooseCompat.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  submitProgressReport,
  getEmployeeProgressReports,
  getAdminProgressReports,
  reviewProgressReport,
  getAdminProgressMetrics,
} from "./progressReport.service.js";

export const submitEmployeeReport = asyncHandler(async (req, res) => {
  const report = await submitProgressReport(
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Progress report submitted successfully.",
    report,
  });
});

export const listEmployeeReports = asyncHandler(async (req, res) => {
  const reports = await getEmployeeProgressReports(req.user.id);

  res.json({
    success: true,
    reports,
  });
});

export const listAdminReports = asyncHandler(async (req, res) => {
  const reports = await getAdminProgressReports({
    status: req.query.status,
    employeeId: req.query.employeeId,
  });

  res.json({
    success: true,
    reports,
  });
});

export const updateReportReview = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  if (!mongoose.isValidObjectId(reportId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid report ID.",
    });
  }

  const report = await reviewProgressReport(
    reportId,
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    message: "Progress report review saved successfully.",
    report,
  });
});

export const adminProgressMetrics = asyncHandler(async (req, res) => {
  const metrics = await getAdminProgressMetrics();

  res.json({
    success: true,
    metrics,
  });
});