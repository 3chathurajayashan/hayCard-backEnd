import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sampleAssignRoutes from "../routes/sampleAssignRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/sample-assign", sampleAssignRoutes);

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("✅ Mongo Connected (SampleAssign)");
}

export default async function handler(req, res) {
  await connectDB();
  return app.handle(req, res);
}
