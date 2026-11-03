
import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    url: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "", maxlength: 10000 },
    attachments: { type: [attachmentSchema], default: [] },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replyTo: { type: mongoose.Schema.Types.ObjectId, default: null },
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, default: null },
    reactions: { type: [reactionSchema], default: [] },
    pinned: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastReadAt: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const clearedForSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clearedAt: { type: Date, required: true },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
      required: true,
    },
    name: { type: String, default: "", trim: true, maxlength: 100 },
    members: { type: [memberSchema], default: [] },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageText: { type: String, default: "" },
    clearedFor: { type: [clearedForSchema], default: [] },
  },
  { timestamps: true }
);

chatSchema.index({ "members.user": 1, lastMessageAt: -1 });
chatSchema.index({ type: 1, "members.user": 1 });
chatSchema.index({ "messages.attachments.id": 1 });
chatSchema.index({
  "messages.attachments.id": 1,
  "members.user": 1,
});

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
