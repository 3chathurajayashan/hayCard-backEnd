import mongoose from "mongoose";
import Chemical from "./model.js";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://hay-card-front-end.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      await connectDB();
      const chemicals = await Chemical.find().sort({ createdAt: -1 });
      return res.status(200).json(chemicals);
    } catch (error) {
      console.error("Error fetching chemicals:", error);
      return res.status(500).json({ message: "Error fetching chemicals" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
