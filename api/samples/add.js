import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose from "mongoose";
import Sample from "../../models/sampleAssignModel"; // adjust path if needed

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ✅ Set Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "samples", // Cloudinary folder
    allowed_formats: ["xls", "xlsx"],
    resource_type: "raw", // important for non-image files
  },
});

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

export const config = {
  api: { bodyParser: false },
};

// ✅ Main API handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  if (req.method === "POST") {
    upload.single("document")(req, res, async (err) => {
      if (err) return res.status(500).json({ message: err.message });

      try {
        const newSample = new Sample({
          referenceNumber: req.body.referenceNumber,
          quantity: req.body.quantity,
          grade: req.body.grade,
          documentPath: req.file.path, // ✅ Cloudinary file URL
        });
        await newSample.save();
        return res.status(201).json(newSample);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
