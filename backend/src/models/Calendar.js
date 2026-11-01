
import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["holiday", "leave", "shift", "attendance", "task"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    employeeName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    from: {
      type: Date,
      required: true,
      index: true,
    },
    to: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: "",
    },
    endTime: {
      type: String,
      trim: true,
      default: "",
    },
    clockIn: {
      type: String,
      trim: true,
      default: "",
    },
    clockOut: {
      type: String,
      trim: true,
      default: "",
    },
    worked: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "scheduled",
        "completed",
        "absent",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

calendarSchema.index({ from: 1, to: 1, eventType: 1 });
calendarSchema.index({ employeeId: 1, from: 1 });

const Calendar =
  mongoose.models.Calendar ||
  mongoose.model("Calendar", calendarSchema);

export default Calendar;
