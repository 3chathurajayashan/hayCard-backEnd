const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["superadmin", "labadmin", "technician", "factory", "driver"], 
    default: "factory" 
  },
  createdAt: { type: Date, default: Date.now }
});

// Export the model
module.exports = mongoose.model("User", userSchema);
