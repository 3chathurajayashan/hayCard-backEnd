import mongoose from "mongoose";

const ReferenceSchema = new mongoose.Schema({
  refNumber: {
    type: String,
    required: true,
  },
  document: {
    type: String, // URL from Cloudinary
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Reference || mongoose.model("Reference", ReferenceSchema);
