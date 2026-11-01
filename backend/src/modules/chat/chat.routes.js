
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as ctrl from "./chat.controller.js";

const router = Router();

router.use(authenticate);

router.get("/users", ctrl.listUsers);

router.get("/conversations", ctrl.listConversations);
router.post("/conversations/admin", ctrl.getAdminConversation);
router.post("/conversations", ctrl.createConversation);

router.get("/conversations/:id", ctrl.getConversation);
router.get("/conversations/:id/messages", ctrl.getMessages);
router.post("/conversations/:id/messages", ctrl.sendMessage);
router.delete("/conversations/:id/messages", ctrl.clearChat);

router.post("/conversations/:id/read", ctrl.markRead);
router.post("/conversations/:id/members", ctrl.addMembers);
router.post("/conversations/:id/leave", ctrl.leaveGroup);

router.delete(
  "/conversations/:id/messages/:messageId",
  ctrl.deleteMessage
);

router.post(
  "/conversations/:id/messages/:messageId/reactions",
  ctrl.reactToMessage
);

router.patch(
  "/conversations/:id/messages/:messageId/pin",
  ctrl.pinMessage
);

router.post(
  "/messages/:messageId/forward",
  ctrl.forwardMessage
);

router.post(
  "/attachments",
  ctrl.uploadChatAttachment,
  ctrl.uploadAttachment
);

export default router;
