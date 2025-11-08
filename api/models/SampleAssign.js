import mongoose from "mongoose";

const sampleAssignSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    documentPublicId: {
      type: String, // to delete later if needed
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SampleAssign ||
  mongoose.model("SampleAssign", sampleAssignSchema);
