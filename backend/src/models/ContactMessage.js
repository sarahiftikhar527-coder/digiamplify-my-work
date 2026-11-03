import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
  }
);

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

contactMessageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ONE_YEAR_SECONDS }
);

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);
