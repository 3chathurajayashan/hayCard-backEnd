const mongoose = require("mongoose");

const customerSampleassignSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true },
  documentPath: { type: String, required: true }, // stores the uploaded file path
   isOut: { type: Boolean, default: false }, // <-- new field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sampleAssign", customerSampleassignSchema);
