import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAdminTaskReport } from "./tasks.report.service.js";

// Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD&employeeId=...
export const adminTaskReport = asyncHandler(async (req, res) => {
  const report = await getAdminTaskReport({
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    employeeId: req.query.employeeId
      ? String(req.query.employeeId)
      : undefined,
    timeZone: req.user.timeZone,
  });

  res.json({ success: true, ...report });
});