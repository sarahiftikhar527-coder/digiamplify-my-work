
import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";

const DEFAULT_TIME_ZONE = "UTC";

function isValidTimeZone(value) {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    });
    return true;
  } catch {
    return false;
  }
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    designation: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    timeZone: {
      type: String,
      trim: true,
      default: DEFAULT_TIME_ZONE,
      validate: {
        validator: isValidTimeZone,
        message: "Please provide a valid IANA time zone.",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinHash: {
      type: String,
      select: false,
      default: undefined,
    },
    pinResetTokenHash: {
      type: String,
      select: false,
      default: undefined,
    },
    pinResetExpires: {
      type: Date,
      select: false,
      default: undefined,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.pinHash;
    delete ret.pinResetTokenHash;
    delete ret.pinResetExpires;
    return ret;
  },
});

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
