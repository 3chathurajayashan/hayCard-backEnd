import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";
import { addSampleAssign, getAllSampleAssigns } from "../controllers/sampleAssignController";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() }); 

// Routes
app.post("/", upload.single("document"), addSampleAssign); // POST → /api/sample-assign
app.get("/", getAllSampleAssigns);                         // GET  → /api/sample-assign

// DB connection
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  }
}

export default async function handler(req, res) {
  await connectDB();
  return app.handle(req, res);
}
