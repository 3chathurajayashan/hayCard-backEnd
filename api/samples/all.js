import mongoose from "mongoose";
import Sample from "../../models/sampleAssignModel";

const MONGO_URI = process.env.MONGO_URI;

export default async function handler(req, res) {
  // 🧩 1. Setup CORS for your frontend
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://hay-card-front-end.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 🧩 2. Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🧩 3. Connect to MongoDB safely
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected ✅");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return res.status(500).json({ message: "DB connection failed", error: err });
  }

  // 🧩 4. Handle GET (Fetch all samples)
  if (req.method === "GET") {
    try {
      const samples = await Sample.find().sort({ createdAt: -1 });
      return res.status(200).json(samples);
    } catch (error) {
      console.error("Error fetching samples:", error);
      return res.status(500).json({ message: "Error fetching samples", error });
    }
  }

  // 🧩 5. Invalid method
  return res.status(405).json({ message: "Method not allowed" });
}
