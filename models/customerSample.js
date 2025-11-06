const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cusSampleSchema = new Schema({
  referenceNumber: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  grade: {
    type: String,
    required: true,
    enum: ["A", "B", "C", "D", "Other"],
    default: "A",
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CusSample", cusSampleSchema);
