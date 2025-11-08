import SampleAssign from "../models/SampleAssign.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// Connect to MongoDB (serverless safe)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI);
}

// 📤 Upload document & save data
export const addSampleAssign = async (req, res) => {
  try {
    const { referenceNumber, file } = req.body;

    if (!referenceNumber || !file) {
      return res.status(400).json({ message: "Reference number and file required" });
    }

    // Upload file to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // allows any file type
      folder: "samples",
    });

    // Save record in DB
    const newSample = await SampleAssign.create({
      referenceNumber,
      documentUrl: uploadResponse.secure_url,
      documentPublicId: uploadResponse.public_id,
    });

    res.status(201).json({ message: "Sample assigned successfully", data: newSample });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading sample", error });
  }
};

// 📥 Get all sample documents
export const getSamples = async (req, res) => {
  try {
    const samples = await SampleAssign.find().sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    res.status(500).json({ message: "Error fetching samples", error });
  }
};

// ❌ Delete sample (optional)
export const deleteSample = async (req, res) => {
  try {
    const { id } = req.params;
    const sample = await SampleAssign.findById(id);

    if (!sample) return res.status(404).json({ message: "Sample not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(sample.documentPublicId, { resource_type: "raw" });

    // Delete from DB
    await sample.deleteOne();

    res.status(200).json({ message: "Sample deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sample", error });
  }
};
