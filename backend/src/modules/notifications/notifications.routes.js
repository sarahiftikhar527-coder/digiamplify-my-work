import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  idSchema,
  listSchema,
  sendSchema,
  preferenceSchema,
} from "./notifications.validation.js";
import * as ctrl from "./notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(listSchema),
  ctrl.list
);

router.get(
  "/employees",
  allowRoles(ROLES.ADMIN),
  ctrl.listEmployees
);

router.post(
  "/",
  allowRoles(ROLES.ADMIN),
  validate(sendSchema),
  ctrl.send
);

router.patch(
  "/read-all",
  ctrl.markAllRead
);

router.patch(
  "/read-type/:type",
  ctrl.markTypeRead
);

router.get(
  "/preferences",
  ctrl.getPreferences
);

router.patch(
  "/preferences/:key",
  validate(preferenceSchema),
  ctrl.setPreference
);

router.patch(
  "/:id/read",
  validate(idSchema),
  ctrl.markRead
);

router.patch(
  "/:id/unread",
  validate(idSchema),
  ctrl.markUnread
);

router.delete(
  "/",
  ctrl.clearAll
);

router.delete(
  "/:id",
  validate(idSchema),
  ctrl.remove
);

export default router;