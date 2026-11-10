import mongoose from "mongoose";

const { Schema } = mongoose;

const lineSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const revisionSchema = new Schema(
  {
    editedBy: { type: Schema.Types.ObjectId, ref: "User" },
    editedAt: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
    changes: [
      {
        _id: false,
        field: String,
        from: Schema.Types.Mixed,
        to: Schema.Types.Mixed,
      },
    ],
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    receiptNo: { type: String, unique: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["salary", "bonus", "advance", "reimbursement", "other"],
      default: "salary",
    },
    month: { type: String, required: true }, // YYYY-MM
    currency: { type: String, default: "PKR" },

    basic: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    allowances: { type: [lineSchema], default: [] },
    deductions: { type: [lineSchema], default: [] },

    grossAmount: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },

    method: {
      type: String,
      enum: ["bank", "cash", "cheque", "easypaisa", "jazzcash"],
      default: "bank",
    },
    reference: { type: String, default: "", trim: true },
    status: { type: String, enum: ["paid", "pending", "cancelled"], default: "paid" },
    paidOn: { type: Date, default: null },
    note: { type: String, default: "", trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    viewedAt: { type: Date, default: null },
    revisions: { type: [revisionSchema], default: [] },
  },
  { timestamps: true }
);

paymentSchema.pre("validate", function (next) {
  const sum = (arr) => (arr || []).reduce((s, l) => s + (Number(l.amount) || 0), 0);
  this.grossAmount = (this.basic || 0) + (this.bonus || 0) + sum(this.allowances);
  this.totalDeductions = sum(this.deductions);
  this.netAmount = this.grossAmount - this.totalDeductions;
  if (this.netAmount < 0) {
    this.invalidate("deductions", "Deductions cannot be more than total earnings");
  }
  next();
});

paymentSchema.index({ employee: 1, month: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);