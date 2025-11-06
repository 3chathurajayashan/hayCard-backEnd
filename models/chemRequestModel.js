const mongoose = require("mongoose");

const chemicalSchema = new mongoose.Schema(
  {
    chemicalName: {
      type: String,
      required: true,
      // ❌ Removed enum — so "ccc" or any custom name will now save
    },
    customChemical: {
      type: String,
      required: false, // optional (we only use it when "Other" selected)
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
        "Fixed Date", // keep optional if you might reuse later
      ],
    },
    fixedHandOverDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chemical", chemicalSchema);
