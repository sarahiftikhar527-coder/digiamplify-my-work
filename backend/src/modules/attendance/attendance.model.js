
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    clockInAt: {
      type: Date,
      default: null,
    },
    clockOutAt: {
      type: Date,
      default: null,
    },
    workedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["present", "late", "absent", "incomplete"],
      default: "absent",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { user: 1, dateKey: 1 },
  { unique: true }
);

attendanceSchema.index({ dateKey: 1, status: 1 });

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;