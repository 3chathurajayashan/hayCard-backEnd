import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const Schema = mongoose.Schema;

/* -----------------------------
   🔹 Child Sample Schema
--------------------------------*/
const childSampleSchema = new Schema(
  {
    sampleId: {
      type: String,
      required: true,
    },
    testMethod: { type: String },
    unitNumber: { type: String },
    results: {
      type: Map,
      of: String,
      default: {},
    },
     
    completedDate: { type: String },
    completedTime: { type: String },
  },
  { _id: true }
);

/* -----------------------------
   🔹 Parent (Gate Pass)
--------------------------------*/
const sampleSchema = new Schema({
  requestRefNo: { type: String, required: true },
  sampleRefNo: { type: String, required: true },
  to: { type: String, default: "Haycarb Colombo Lab" },
  from: { type: [String], enum: ["HCM", "HCB", "HCM HCB"], required: true },
  remarks: { type: String },
  sampleInTime: { type: String },
   
  sampleInDate: { type: String },
  gatePassNo: { type: String, required: true },
  sampleReceivedTime: { type: String },
  sampleReceivedDate: { type: String },
  sampleRoute: {
    type: String,
    enum: ["Direct from Madampe", "Direct from Badalgama", "Through Wewalduwa"],
    required: true,
  },
  samples: [childSampleSchema],
  analysedBy: { type: String, default: "" },
  qrCodeDataUrl: { type: String },
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

/* -----------------------------
   🔹 Pre-save hook to generate unique sampleIds
--------------------------------*/
sampleSchema.pre("save", async function () {
  // Generate unique sampleId for any child without it
  this.samples = this.samples.map(s => {
    if (!s.sampleId) s.sampleId = uuidv4();
    return s;
  });

  // Check for duplicates within this gate pass
  const sampleIds = this.samples.map(s => s.sampleId);
  const uniqueIds = new Set(sampleIds);
  if (uniqueIds.size !== sampleIds.length) {
    throw new Error("Duplicate sampleId inside this Gate Pass");
  }

  // Check for duplicates in DB
  for (let id of sampleIds) {
    const existing = await mongoose.model("Sample").findOne({
      "samples.sampleId": id,
      _id: { $ne: this._id },
    });
    if (existing) throw new Error(`sampleId ${id} already exists in another Gate Pass`);
  }

  this.updatedAt = new Date();
});

const Sample = mongoose.model("Sample", sampleSchema);
export default Sample;