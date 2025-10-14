const mongoose = require("mongoose");
const QRCode = require("qrcode");

const Schema = mongoose.Schema;

const sampleSchema = new Schema({
  requestRefNo: { type: String, required: true },
  sampleRefNo: { type: String, required: true },
  to: { type: String, default: "Haycarb Colombo Lab" },
  from: { type: [String], enum: ["HCM", "HCB", "HCM HCB"], required: true }, // can be HCM, HCB, or both
  remarks: { type: String },

  sampleInTime: { type: String },
  sampleInDate: { type: String },
  gatePassNo: { type: String },

  // Received time and date at Haycarb (non-editable by creator)
  sampleReceivedTime: { type: String },
  sampleReceivedDate: { type: String },

  // Sample transport path
  sampleRoute: {
    type: String,
    enum: ["Direct from Madampe", "Direct from Badalgama", "Through Wewalduwa"],
    required: true,
  },

  // Test details
  testMethod: { type: String },
  results: {
    As_ppb: { type: Number },
    Sb_ppb: { type: Number },
    Al_ppb: { type: Number },
  },

  analysedBy: { type: String },
  completedDate: { type: String },
  completedTime: { type: String },

  // Tracking and QR
  sampleId: { type: String, unique: true },
  qrCodeDataUrl: { type: String },

  // System flags & timestamps
  isFinalized: { type: Boolean, default: false },
 createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "userModel" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  receivedAt: { type: Date },
  openedAt: { type: Date },
  received: { type: Boolean, default: false },
receivedDate: { type: String, default: null },
receivedTime: { type: String, default: null },

});

// 🔹 Pre-save hook for generating QR + sampleId
sampleSchema.pre("save", async function (next) {
  if (!this.sampleId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    this.sampleId = `LAB-${dateStr}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  const link = `${process.env.FRONTEND_BASE_URL || "http://localhost:3000"}/samples/${this.sampleId}`;
  try {
    const dataUrl = await QRCode.toDataURL(link);
    this.qrCodeDataUrl = dataUrl;
  } catch (err) {
    console.error("QR generation error:", err);
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Sample", sampleSchema);
