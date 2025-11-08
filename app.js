
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const cron = require("node-cron");
const { sendEmail } = require("./utils/emailService");

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads folder created!");
}

const userRoutes = require("./routes/userRoute");
const sampleRoutes = require("./routes/sampleRoute");
const chemRoutes = require("./routes/chemRequestRoute");
const cusSampleRoutes = require("./routes/customerSampleRoute");
 
const Sample = require("./models/sampleModel");

const app = express();

// ✅ Correct CORS setup
const allowedOrigins = [
  "https://hay-card-front-end.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use("/users", userRoutes);
app.use("/samples", sampleRoutes);
app.use("/api/chemicals", chemRoutes);
app.use("/cusSamples", cusSampleRoutes);
 

const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb+srv://admin:admin@cluster0.afu07sh.mongodb.net/heyCrabDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    console.log("Mongo connected");

    cron.schedule(
      "0 9 * * *",
      async () => {
        try {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const overdue = await Sample.find({
            createdAt: { $lte: oneDayAgo },
            status: "Registered",
          }).populate("createdBy");

          for (const s of overdue) {
            if (s.createdBy && s.createdBy.email) {
              await sendEmail(
                s.createdBy.email,
                "Sample Not Received",
                `<p>Your sample ${s.sampleId} is not yet received by lab. Please check.</p>`
              );
            }
          }
        } catch (err) {
          console.error("Cron error:", err);
        }
      },
      { timezone: "Asia/Colombo" }
    );
  })
  .catch((err) => console.error(err));
