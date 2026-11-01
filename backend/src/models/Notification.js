import mongoose from "mongoose";
import {
  NOTIFICATION_TAGS,
  NOTIFICATION_TYPES,
} from "../constants/notifications.js";

const notificationSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    tag: {
      type: String,
      enum: NOTIFICATION_TAGS,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    linkLabel: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ to: 1, createdAt: -1 });

notificationSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.to = ret.to?.toString();
    ret.from = ret.from ? ret.from.toString() : null;

    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

export default mongoose.model("Notification", notificationSchema);