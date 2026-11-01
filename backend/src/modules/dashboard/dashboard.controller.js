
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  getAdminStats,
  getClockedInEmployees,
  getCompletedTasksToday,
  getOverdueTasks,
  getAdminTasksByStatus,
} from "./dashboard.service.js";

export const adminStats = asyncHandler(async (req, res) => {
  const stats = await getAdminStats();

  res.json({
    success: true,
    stats,
  });
});

export const clockedInDetails = asyncHandler(async (req, res) => {
  const records = await getClockedInEmployees();

  res.json({
    success: true,
    records,
  });
});

export const completedTasksDetails = asyncHandler(async (req, res) => {
  const records = await getCompletedTasksToday();

  res.json({
    success: true,
    records,
  });
});

export const overdueTasksDetails = asyncHandler(async (req, res) => {
  const records = await getOverdueTasks();

  res.json({
    success: true,
    records,
  });
});

export const adminTasksByStatus = asyncHandler(async (req, res) => {
  const status = req.query.status || "all";
  const records = await getAdminTasksByStatus(status);

  res.json({
    success: true,
    records,
  });
});
