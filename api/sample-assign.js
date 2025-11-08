import mongoose from "mongoose";
import SampleAssign from "./models/SampleAssign.js"; // adjust path
import cloudinary from "./config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  }
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const { referenceNumber, file } = req.body;
      if (!referenceNumber || !file)
        return res.status(400).json({ message: "Reference number & file required" });

      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        folder: "samples",
      });

      const newSample = await SampleAssign.create({
        referenceNumber,
        documentUrl: uploadResponse.secure_url,
        documentPublicId: uploadResponse.public_id,
      });

      res.status(201).json(newSample);
    } catch (err) {
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
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
