import cloudinary from "../config/cloudinary.js";
import Document from "../models/documentModel.js";
import mongoose from "mongoose";
import { Readable } from "stream";

// ensure DB connection (for serverless functions)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI);
}

export const uploadDocument = async (req, res) => {
  try {
    const { referenceNumber } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "documents" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        const doc = await Document.create({
          referenceNumber,
          fileUrl: result.secure_url,
          fileName: file.originalname,
        });

        res.status(201).json(doc);
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find().sort({ uploadedAt: -1 });
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
