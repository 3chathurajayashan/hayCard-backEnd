require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const uploadDir = "./uploads";

// Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads folder created!");
}

// Import routes
const userRoutes = require("./routes/userRoute");
const sampleRoutes = require("./routes/sampleRoute");
const chemRoutes = require("./routes/chemRequestRoute");
const sampleAssignRoutes = require("./routes/sampleAssignRoute");

const app = express();

// ✅ FIX: Enable CORS properly for your frontend
app.use(
  cors({
    origin: ["https://hay-card-front-end.vercel.app"], // your deployed frontend domain
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/chems", chemRoutes);
app.use("/api/sampleAssign", sampleAssignRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB connection error:", err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
