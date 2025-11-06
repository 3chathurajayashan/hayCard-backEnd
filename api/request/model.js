import mongoose from "mongoose";

const chemicalSchema = new mongoose.Schema(
  {
    chemicalName: {
      type: String,
      required: true,
    },
    customChemical: {
      type: String,
      required: false,
    },
    quantity: {
      type: String,
      required: true,
    },
    handOverRange: {
      type: String,
      required: true,
      enum: [
        "Within 1 Week",
        "Within 2 Weeks",
        "Within 3 Weeks",
        "Within 1 Month",
        "Fixed Date",
      ],
    },
    fixedHandOverDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite in Vercel hot reload
export default mongoose.models.Chemical || mongoose.model("Chemical", chemicalSchema);
