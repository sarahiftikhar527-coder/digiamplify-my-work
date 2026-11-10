import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as ctrl from "./meetings.controller.js";
import {
  cancelSchema,
  conflictsSchema,
  createMeetingSchema,
  directoryQuerySchema,
  idParamSchema,
  listMeetingsSchema,
  rsvpSchema,
  updateMeetingSchema,
} from "./meetings.validation.js";

const router = Router();

router.use(authenticate);

// Static paths must stay above "/:id"
router.get("/directory", validate(directoryQuerySchema), ctrl.directory);
router.get("/summary", ctrl.summary);
router.post("/conflicts", validate(conflictsSchema), ctrl.conflicts);

router.get("/", validate(listMeetingsSchema), ctrl.list);
router.post("/", validate(createMeetingSchema), ctrl.create);

router.get("/:id", validate(idParamSchema), ctrl.getOne);
router.patch("/:id", validate(updateMeetingSchema), ctrl.update);
router.patch("/:id/rsvp", validate(rsvpSchema), ctrl.respond);
router.post("/:id/cancel", validate(cancelSchema), ctrl.cancel);
router.post("/:id/complete", validate(idParamSchema), ctrl.complete);
router.delete("/:id", validate(idParamSchema), ctrl.remove);

export default router;