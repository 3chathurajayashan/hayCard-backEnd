import mongoose from "mongoose";
import multer from "multer";
import SampleAssign from "./models/SampleAssign.js";
import cloudinary from "./config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

let isConnected = false;

// MongoDB connection (serverless safe)
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  }
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    // handle single file upload
    upload.single("document")(req, res, async (err) => {
      if (err) return res.status(500).json({ message: err.message });

      const { referenceNumber } = req.body;
      const file = req.file;

      if (!referenceNumber || !file)
        return res.status(400).json({ message: "Reference number and file required" });

      try {
        // convert buffer to base64 string for Cloudinary
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        // upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
          resource_type: "auto",
          folder: "samples",
        });

        // save in DB
        const newSample = await SampleAssign.create({
          referenceNumber,
          documentUrl: uploadResponse.secure_url,
          documentPublicId: uploadResponse.public_id,
        });

        res.status(201).json(newSample);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading sample", error });
      }
    });
  } else if (req.method === "GET") {
    try {
      const samples = await SampleAssign.find().sort({ createdAt: -1 });
      res.status(200).json(samples);
    } catch (error) {
      res.status(500).json({ message: "Error fetching samples", error });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
