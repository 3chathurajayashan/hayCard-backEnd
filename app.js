require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

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

// ✅ Fix CORS issue completely
app.use(
  cors({
    origin: ["https://hay-card-front-end.vercel.app"], // your frontend domain
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/users", userRoutes);
app.use("/samples", sampleRoutes);
app.use("/api/chemicals", chemRoutes);
app.use("/cusSamples", cusSampleRoutes);
app.use("/api/samples", sampleAssignRoutes);

// ✅ Database Connection
mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.afu07sh.mongodb.net/heyCrabDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("DB connection error:", err));

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
