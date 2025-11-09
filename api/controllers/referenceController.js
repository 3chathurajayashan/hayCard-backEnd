import Reference from "../models/Reference.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Add new reference with optional document
export const addReference = async (req, res) => {
  try {
    const { refNumber } = req.body;
    if (!refNumber) return res.status(400).json({ message: "Reference number is required" });

    let documentUrl = null;

    if (req.file) {
      // Convert multer buffer to stream and upload to Cloudinary
      const uploadFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "references", resource_type: "raw" }, // raw for CSV/pdf
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await uploadFromBuffer(req.file.buffer);
      documentUrl = result.secure_url;
    }

    const newRef = new Reference({ refNumber, document: documentUrl });
    await newRef.save();

    res.status(200).json(newRef);
  } catch (error) {
    console.error("Reference upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
