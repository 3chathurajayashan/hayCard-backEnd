import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import SampleAssign from "../models/SampleAssign.js";

// We don’t need multer in Vercel – we’ll accept base64 files
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  }
}

export default async function handler(req, res) {
  await connectDB();

  // Handle preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const { referenceNumber, documentBase64 } = req.body;

      if (!referenceNumber || !documentBase64)
        return res.status(400).json({ message: "Missing fields" });

      // Upload to Cloudinary
      const uploaded = await cloudinary.uploader.upload(documentBase64, {
        folder: "samples",
        resource_type: "auto",
      });

      // Save to DB
      const newSample = await SampleAssign.create({
        referenceNumber,
        documentUrl: uploaded.secure_url,
        documentPublicId: uploaded.public_id,
      });

      res.status(201).json(newSample);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === "GET") {
    try {
      const samples = await SampleAssign.find().sort({ createdAt: -1 });
      res.status(200).json(samples);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
