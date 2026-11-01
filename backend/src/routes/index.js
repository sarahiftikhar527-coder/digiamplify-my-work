import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import notificationsRoutes from "../modules/notifications/notifications.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import tasksRoutes from "../modules/tasks/tasks.routes.js";
import progressReportRoutes from "../modules/progressReports/progressReport.routes.js";
import performanceRoutes from "../modules/performance/performance.routes.js";
import leaveRoutes from "../modules/leave/leave.routes.js";
import profileRoutes from "../modules/profile/profile.routes.js";
import attendanceRoutes from "../modules/attendance/attendance.routes.js";
import financeRoutes from "../modules/finance/finance.routes.js";
import calendarRoutes from "../modules/calendar/calendar.routes.js";
import announcementsRoutes from "../modules/announcements/announcements.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";

const router = Router();

router.get("/health", (req, res) =>
  res.json({ success: true, message: "API is running" })
);

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/tasks", tasksRoutes);
router.use("/progress-reports", progressReportRoutes);
router.use("/performance", performanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/profile", profileRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/finance", financeRoutes);
router.use("/calendar", calendarRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/chat", chatRoutes);

export default router;