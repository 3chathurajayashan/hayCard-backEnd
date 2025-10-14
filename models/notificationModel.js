const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sample: { type: Schema.Types.ObjectId, ref: "Sample" },
  to: String,
  subject: String,
  body: String,
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
