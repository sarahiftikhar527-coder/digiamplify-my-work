import { Router } from "express";

import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  updateEventStatus,
  removeEvent,
  getApprovers,
} from "./calendar.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/approvers", getApprovers);

router.get("/", getEvents);
router.post("/", createEvent);

router.patch("/:id/status", updateEventStatus);
router.patch("/:id", updateEvent);
router.delete("/:id", removeEvent);

router.get("/:id", getEvent);

export default router;