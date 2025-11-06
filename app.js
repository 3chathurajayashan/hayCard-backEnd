require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

// Import routes
const userRoutes = require("./routes/userRoute");
const sampleRoutes = require("./routes/sampleRoute");
const chemRoutes = require("./routes/chemRequestRoute");
const cusSampleRoutes = require("./routes/customerSampleRoute");
const sampleAssignRoutes = require("./routes/sampleAssignRoutes");

const app = express();

// ✅ Ensure uploads folder exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads folder created!");
}

// ✅ Apply CORS middleware FIRST before anything else
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ Middleware
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/users", userRoutes);
app.use("/samples", sampleRoutes);
app.use("/api/chemicals", chemRoutes);
app.use("/cusSamples", cusSampleRoutes);
app.use("/api/samples", sampleAssignRoutes);

// ✅ Simple health check (for Vercel testing)
app.get("/", (req, res) => {
  res.send("✅ HayCard backend is live and CORS configured correctly!");
});

// ✅ Database Connection
mongoose
  .connect("mongodb+srv://admin:admin@cluster0.afu07sh.mongodb.net/heyCrabDB?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("DB connection error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
