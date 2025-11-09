import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Document ||
  mongoose.model("Document", documentSchema);
