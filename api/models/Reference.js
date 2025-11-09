import mongoose from "mongoose";

const ReferenceSchema = new mongoose.Schema({
  refNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Reference || mongoose.model("Reference", ReferenceSchema);
