
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getEmployeePerformance } from "./performance.service.js";

export const employeePerformance = asyncHandler(async (req, res) => {
  const range = String(req.query.range || "month").toLowerCase();

  const performance = await getEmployeePerformance(
    req.user.id,
    range
  );

  res.json({
    success: true,
    data: performance,
  });
});
