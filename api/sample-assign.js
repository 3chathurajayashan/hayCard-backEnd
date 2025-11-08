import mongoose from "mongoose";
import SampleAssign from "./models/SampleAssign.js";
import cloudinary from "./config/cloudinary.js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  }
}

// Serverless handler
export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    // Handle file upload + referenceNumber
    upload.single("document")(req, res, async (err) => {
      if (err) return res.status(500).json({ message: err.message });

      const { referenceNumber } = req.body;
      const file = req.file;

      if (!referenceNumber || !file)
        return res.status(400).json({ message: "Reference number & file required" });

      try {
        // Convert file buffer to base64 for Cloudinary
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;

        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
          resource_type: "auto",
          folder: "samples",
        });

        const newSample = await SampleAssign.create({
          referenceNumber,
          documentUrl: uploadResponse.secure_url,
          documentPublicId: uploadResponse.public_id,
        });

        res.status(201).json(newSample);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  } else if (req.method === "GET") {
    try {
      const samples = await SampleAssign.find().sort({ createdAt: -1 });
      res.status(200).json(samples);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
