import mongoose from "mongoose";

const shiftAssignmentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // YYYY-MM-DD (attendance ke dateKey jaisa), dono din shamil
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },

    // HH:mm
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    breakStart: { type: String, default: "" },
    breakEnd: { type: String, default: "" },

    // jab employee task complete inform kare, tab set hota hai
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

shiftAssignmentSchema.index({ employee: 1, startDate: 1, endDate: 1 });

const ShiftAssignment =
  mongoose.models.ShiftAssignment ||
  mongoose.model("ShiftAssignment", shiftAssignmentSchema);

export default ShiftAssignment;