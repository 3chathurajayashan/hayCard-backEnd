const mongoose = require("mongoose");

const chemicalSchema = new mongoose.Schema({
  chemicalName: {
    type: String,
    required: true,
    enum: [
      "Hydrochloric Acid",
      "Sulfuric Acid",
      "Ethanol",
      "Sodium Hydroxide",
      "Ammonia Solution",
      "Acetone",
      "Other"
    ],
    default: "Other"
  },
  quantity: {
    type: String,
    required: true,
  },
  handOverRange: {
    type: String,
    enum: [
      "Within 1 Week",
      "Within 2 Weeks",
      "Within 1 Month",
      "Within 2 Months",
      "Fixed Date"
    ],
    required: true,
  },
  fixedHandOverDate: {
    type: Date,
    required: function () {
      return this.handOverRange === "Fixed Date";
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chemical", chemicalSchema);
