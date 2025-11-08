import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";
import { sendEmail } from "../utils/emailService.js";

// Routes
import userRoutes from "../routes/userRoute.js";
import sampleRoutes from "../routes/sampleRoute.js";
import chemRoutes from "../routes/chemRequestRoute.js";
import cusSampleRoutes from "../routes/customerSampleRoute.js";
import sampleAssignRoutes from "../routes/sampleAssignRoutes.js"; // ✅ correct path
import Sample from "../models/sampleModel.js";

dotenv.config();

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  "https://hay-card-front-end.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
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

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("✅ Backend API is running on Vercel");
});

app.use("/api/users", userRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/chemicals", chemRoutes);
app.use("/api/cusSamples", cusSampleRoutes);
app.use("/api/sample-assign", sampleAssignRoutes); // ✅ new route

// ✅ MongoDB Connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(
    process.env.MONGO_URI ||
      "mongodb+srv://admin:admin@cluster0.afu07sh.mongodb.net/heyCrabDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  isConnected = true;
  console.log("✅ MongoDB Connected");
}

// ✅ Cron Job
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

// ✅ Vercel Serverless Export
export default async function handler(req, res) {
  await connectDB();
  // 👇 Important: Pass req & res directly to app.handle for serverless
  return app.handle(req, res);
}
