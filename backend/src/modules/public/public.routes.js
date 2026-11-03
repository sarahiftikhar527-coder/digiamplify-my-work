import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  contactPublicIpLimiter,
  newsletterSubscribeIpLimiter,
  newsletterSubscribeEmailLimiter,
  newsletterUnsubscribeIpLimiter,
} from "../../middlewares/rateLimit.middleware.js";
import {
  contactSubmitSchema,
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
} from "./public.validation.js";
import * as controller from "./public.controller.js";

const router = Router();

router.post(
  "/contact",
  contactPublicIpLimiter,
  validate(contactSubmitSchema),
  controller.submitContact
);

router.post(
  "/newsletter/subscribe",
  newsletterSubscribeIpLimiter,
  validate(newsletterSubscribeSchema),
  newsletterSubscribeEmailLimiter,
  controller.subscribeNewsletter
);

router.post(
  "/newsletter/unsubscribe",
  newsletterUnsubscribeIpLimiter,
  validate(newsletterUnsubscribeSchema),
  controller.unsubscribeNewsletter
);

export default router;
