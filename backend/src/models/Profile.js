
import mongoose from "mongoose";

const profileDocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: "" },
    kind: { type: String, enum: ["file", "link"], default: "file" },
    fileName: { type: String, default: "" },
    url: { type: String, default: "" },
    backFileName: { type: String, default: "" },
    backUrl: { type: String, default: "" },
    uploadedOn: { type: String, default: "" },
    status: {
      type: String,
      enum: ["verified", "pending", "missing"],
      default: "missing",
    },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, default: "" },
    userName: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    nationality: { type: String, default: "" },
    language: { type: String, default: "" },
    email: { type: String, default: "" },
    workEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    emergencyNumber: { type: String, default: "" },
    currentAddress: { type: String, default: "" },
    permanentAddress: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    education: { type: String, default: "" },
    bankName: { type: String, default: "" },
    annualSalary: { type: Number, default: 0 },
    accountHolder: { type: String, default: "" },
    salaryType: { type: String, default: "Monthly" },
    accountNumber: { type: String, default: "" },
    salary: { type: Number, default: 0 },
    currency: { type: String, default: "Rupees" },
    deductionPerAbsence: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    salaryPaymentDate: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    department: { type: String, default: "" },
    team: { type: String, default: "" },
    manager: { type: String, default: "" },
    jobLevel: { type: String, default: "Junior" },
    probationPeriod: { type: String, default: "" },
    dateOfJoining: { type: String, default: "" },
    confirmationDate: { type: String, default: "" },
    annualLeave: { type: Number, default: 0 },
    jobType: { type: String, default: "Full Time" },
    workType: { type: String, default: "Remote" },
    shift: { type: String, default: "Day Shift" },
    workingDays: {
      type: [String],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    weeklyOff: { type: String, default: "Sunday" },
    noticePeriod: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    documents: { type: [profileDocumentSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);
