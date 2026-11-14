
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isFinanceUser } from "../../utils/permissions.js";
import ApiError from "../../utils/ApiError.js";

import {
  listReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  markReceiptPaid,
  deleteReceipt,
} from "./receipts.service.js";

const router = Router();

const send = (res, data, status = 200, message) =>
  res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });

// Admin and Finance Manager.
const requireAdmin = (req, res, next) => {
  if (!isFinanceUser(req.user)) {
    return next(new ApiError(403, "Finance access is required."));
  }

  next();
};

router.use(authenticate);

// Employee and admin (the owner check is done in the service).
router.get(
  "/me",
  asyncHandler(async (req, res) =>
    send(res, await listReceipts(req.query, req.user.id))
  )
);

router.get(
  "/:id",
  asyncHandler(async (req, res) =>
    send(res, await getReceipt(req.params.id, req.user))
  )
);

// Admin and Finance Manager only.
router.use(requireAdmin);

router.get(
  "/",
  asyncHandler(async (req, res) =>
    send(res, await listReceipts(req.query))
  )
);

router.post(
  "/",
  asyncHandler(async (req, res) =>
    send(
      res,
      await createReceipt(req.body, req.user),
      201,
      "Receipt generated successfully."
    )
  )
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) =>
    send(
      res,
      await updateReceipt(req.params.id, req.body, req.user),
      200,
      "Receipt updated successfully."
    )
  )
);

router.post(
  "/:id/mark-paid",
  asyncHandler(async (req, res) =>
    send(
      res,
      await markReceiptPaid(req.params.id, req.user),
      200,
      "Receipt marked as paid."
    )
  )
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) =>
    send(
      res,
      await deleteReceipt(req.params.id),
      200,
      "Receipt deleted successfully."
    )
  )
);

export default router;
