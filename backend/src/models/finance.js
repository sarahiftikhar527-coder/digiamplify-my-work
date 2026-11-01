
import mongoose from "mongoose";

const financeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    bank: {
      type: String,
      trim: true,
      default: "",
    },
    account: {
      type: String,
      trim: true,
      default: "",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    periodMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    periodYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 9999,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

financeSchema.index(
  { employee: 1, periodYear: 1, periodMonth: 1 },
  { unique: true }
);

financeSchema.virtual("netPay").get(function () {
  return this.salary + this.bonus - this.deduction;
});

financeSchema.set("toJSON", { virtuals: true });
financeSchema.set("toObject", { virtuals: true });

export default mongoose.models.Finance ||
  mongoose.model("Finance", financeSchema);
