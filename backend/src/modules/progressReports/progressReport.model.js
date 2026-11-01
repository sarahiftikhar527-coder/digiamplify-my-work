import mongoose from "mongoose";

const progressReportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    accomplishments: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    blockers: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },
    nextSteps: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "needs-revision"],
      default: "submitted",
      index: true,
    },
    adminFeedback: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
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
  { timestamps: true }
);

progressReportSchema.index(
  { employee: 1, periodStart: 1 },
  { unique: true }
);

export default mongoose.model("ProgressReport", progressReportSchema);