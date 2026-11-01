
import { Router } from "express";
import {
  getEmployees,
  getMyProfile,
  getEmployeeProfile,
  updateMyProfile,
  updateEmployeeProfile,
  uploadMyDocument,
  uploadEmployeeDocument,
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

router.get("/employees", getEmployees);
router.get("/employees/:userId", getEmployeeProfile);
router.patch("/employees/:userId", updateEmployeeProfile);
router.post(
  "/employees/:userId/documents/upload",
  profileUpload.single("file"),
  uploadEmployeeDocument
);

export default router;
