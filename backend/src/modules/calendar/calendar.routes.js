import { Router } from "express";
import multer from "multer";

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
import { validate } from "../../middlewares/validate.middleware.js";
import {
  approversQuerySchema,
  createEventSchema,
  idParamSchema,
  listEventsSchema,
  updateEventSchema,
  updateStatusSchema,
} from "./calendar.validation.js";

const router = Router();
const parseForm = multer().none();

router.use(authenticate);

router.get(
  "/approvers",
  validate(approversQuerySchema),
  getApprovers
);

router.get("/", validate(listEventsSchema), getEvents);

router.post(
  "/",
  parseForm,
  validate(createEventSchema),
  createEvent
);

router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  updateEventStatus
);

router.patch("/:id", validate(updateEventSchema), updateEvent);

router.delete("/:id", validate(idParamSchema), removeEvent);

router.get("/:id", validate(idParamSchema), getEvent);

export default router;
