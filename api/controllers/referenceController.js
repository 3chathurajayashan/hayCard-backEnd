import Reference from "../models/Reference.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const addReference = async (req, res) => {
  try {
    const { refNumber } = req.body;
    if (!refNumber) return res.status(400).json({ message: "Reference number is required" });

    let documentUrl;

    if (req.file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "references" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      documentUrl = result.secure_url;
    }

    const newRef = new Reference({ refNumber, document: documentUrl });
    await newRef.save();

    res.status(200).json(newRef);
  } catch (error) {
    console.error("Add reference error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllReferences = async (req, res) => {
  try {
    const refs = await Reference.find().sort({ createdAt: -1 });
    res.status(200).json(refs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
