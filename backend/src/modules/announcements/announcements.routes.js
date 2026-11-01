import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import ApiError from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementEmployees,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./announcements.controller.js";

const router = Router();

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "Admin access required");
  }

  next();
});

router.get("/mine", authenticate, getMyAnnouncements);

router.use(authenticate, requireAdmin);

router.get("/", getAnnouncements);
router.get("/employees", getAnnouncementEmployees);
router.post("/", createAnnouncement);
router.patch("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;