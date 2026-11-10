import { Router } from "express";
import {
  getEmployees,
  getMyProfile,
  getEmployeeProfile,
  updateMyProfile,
  updateEmployeeProfile,
  uploadMyDocument,
  uploadEmployeeDocument,
  uploadMyAvatar,
  uploadEmployeeAvatar,
  getMyChangeRequest,
  getChangeRequests,
  getChangeRequestCount,
  approveChangeRequest,
  rejectChangeRequest,
} from "./profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import profileUpload from "../../middlewares/profileUpload.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.post(
  "/me/documents/upload",
  profileUpload.single("file"),
  uploadMyDocument
);
// Profile photo: upload first, then save the profile with the returned link.
router.post(
  "/me/avatar",
  profileUpload.single("file"),
  uploadMyAvatar
);
router.get("/me/change-request", getMyChangeRequest);

// Admin: review employee profile edits
router.get("/change-requests/count", getChangeRequestCount);
router.get("/change-requests", getChangeRequests);
router.patch("/change-requests/:requestId/approve", approveChangeRequest);
router.patch("/change-requests/:requestId/reject", rejectChangeRequest);

router.get("/employees", getEmployees);
router.get("/employees/:userId", getEmployeeProfile);
router.patch("/employees/:userId", updateEmployeeProfile);
router.post(
  "/employees/:userId/documents/upload",
  profileUpload.single("file"),
  uploadEmployeeDocument
);
router.post(
  "/employees/:userId/avatar",
  profileUpload.single("file"),
  uploadEmployeeAvatar
);

export default router;