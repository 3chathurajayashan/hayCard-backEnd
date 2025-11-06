import mongoose from "mongoose";
import Sample from "../../models/sampleAssignModel";

const MONGO_URI = process.env.MONGO_URI;

export default async function handler(req, res) {
  // 🧩 1. Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 🧩 2. Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🧩 3. Connect to DB
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(MONGO_URI);
  }

  // 🧩 4. Handle GET
  if (req.method === "GET") {
    try {
      const samples = await Sample.find();
      return res.status(200).json(samples);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
