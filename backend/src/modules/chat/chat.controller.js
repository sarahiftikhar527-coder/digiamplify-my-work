
import path from "path";
import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./chat.service.js";
import * as aiService from "./chat.ai.service.js";
import ApiError from "../../utils/ApiError.js";
import { CHAT_ATTACHMENTS_DIR } from "../../config/uploads.js";

fs.mkdirSync(CHAT_ATTACHMENTS_DIR, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) =>
    callback(null, CHAT_ATTACHMENTS_DIR),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).slice(0, 15);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new ApiError(400, "This file type is not supported.")
      );
    }

    callback(null, true);
  },
}).single("file");

const success = (res, data = {}, notice = "Success", status = 200) => {
  const payload = {
    success: true,
    ...data,
  };

  if (
    Object.prototype.hasOwnProperty.call(payload, "message") &&
    typeof payload.message === "object" &&
    payload.message !== null
  ) {
    payload.notice = notice;
  } else {
    payload.message = notice;
  }

  return res.status(status).json(payload);
};

export const listUsers = asyncHandler(async (req, res) => {
  const result = await service.listUsers(req.query.search, req.user);
  success(res, result);
});

// Light endpoint for the sidebar "Chat" badge: total unread messages.
export const getUnreadSummary = asyncHandler(async (req, res) => {
  const result = await service.getUnreadSummary(req.user);
  success(res, result);
});

export const listConversations = asyncHandler(async (req, res) => {
  const result = await service.listConversations(req.user);
  success(res, result);
});

export const getAdminConversation = asyncHandler(async (req, res) => {
  const result = await service.getAdminConversation(req.user);
  success(res, result);
});

export const createConversation = asyncHandler(async (req, res) => {
  const result = await service.createConversation(req.body, req.user);
  success(res, result, "Conversation created.", 201);
});

export const getConversation = asyncHandler(async (req, res) => {
  const result = await service.getConversation(req.params.id, req.user);
  success(res, result);
});

export const getMessages = asyncHandler(async (req, res) => {
  const result = await service.getMessages(
    req.params.id,
    req.user,
    req.query.before
  );

  success(res, result);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const result = await service.sendMessage(
    req.params.id,
    req.body,
    req.user
  );

  success(res, result, "Message sent.", 201);
});

export const markRead = asyncHandler(async (req, res) => {
  const result = await service.markRead(req.params.id, req.user);
  success(res, result, "Conversation marked as read.");
});

export const getMessageInfo = asyncHandler(async (req, res) => {
  const result = await service.getMessageInfo(
    req.params.id,
    req.params.messageId,
    req.user
  );

  success(res, result);
});

export const getAiSuggestions = asyncHandler(async (req, res) => {
  const result = await aiService.getSuggestions(req.body, req.user);
  success(res, result);
});

export const addMembers = asyncHandler(async (req, res) => {
  const result = await service.addMembers(
    req.params.id,
    req.body,
    req.user
  );

  success(res, result, "Members added.");
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const result = await service.leaveGroup(req.params.id, req.user);
  success(res, result, "You left the group.");
});

export const clearChat = asyncHandler(async (req, res) => {
  const result = await service.clearChat(req.params.id, req.user);
  success(res, result, "Chat cleared.");
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const result = await service.deleteMessage(
    req.params.id,
    req.params.messageId,
    req.user
  );

  success(res, result, "Message deleted.");
});

export const reactToMessage = asyncHandler(async (req, res) => {
  const result = await service.reactToMessage(
    req.params.id,
    req.params.messageId,
    req.body,
    req.user
  );

  success(res, result);
});

export const pinMessage = asyncHandler(async (req, res) => {
  const result = await service.pinMessage(
    req.params.id,
    req.params.messageId,
    req.body,
    req.user
  );

  success(res, result);
});

export const forwardMessage = asyncHandler(async (req, res) => {
  const result = await service.forwardMessage(
    req.params.messageId,
    req.body,
    req.user
  );

  success(res, result, "Message forwarded.");
});

// The file is already saved by multer. The service stores it in the
// database so it can be sent with a message.
export const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please select a file to upload.");
  }

  const attachment = await service.registerAttachmentUpload(
    req.user,
    req.file
  );

  success(
    res,
    { attachment, ...attachment },
    "Attachment uploaded.",
    201
  );
});
