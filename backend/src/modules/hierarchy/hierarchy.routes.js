import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import * as ctrl from "./hierarchy.controller.js";

const router = Router();

// Admins and employees can both open it; the service enforces who may move whom.
router.use(authenticate);

router.get("/", ctrl.get);
router.patch("/:userId/manager", ctrl.setManager);

export default router;