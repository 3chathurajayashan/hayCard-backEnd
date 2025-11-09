import mongoose from "mongoose";

const sampleAssignSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true },
  documentUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.SampleAssign ||
  mongoose.model("SampleAssign", sampleAssignSchema);
