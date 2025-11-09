import mongoose from "mongoose";

const ReferenceSchema = new mongoose.Schema({
  refNumber: { type: String, required: true },
  fileName: { type: String },      // original file name
  fileData: { type: String },      // base64 content
  createdAt: { type: Date, default: Date.now },
  sampleOut: { type: Boolean, default: false },
});

export default mongoose.models.Reference || mongoose.model("Reference", ReferenceSchema);
