import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    audience: {
      type: String,
      enum: ["all", "selected"],
      default: "all",
      required: true,
    },
    employeeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ status: 1, createdAt: -1 });
announcementSchema.index({ audience: 1, employeeIds: 1 });

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);