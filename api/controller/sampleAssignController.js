import SampleAssign from "../models/SampleAssign.js";
import cloudinary from "../utils/cloudinary.js";

export async function addSampleAssign(req, res) {
  try {
    const { referenceNumber, document } = req.body;
    if (!referenceNumber || !document) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const uploadedFile = await cloudinary.uploader.upload(document, {
      folder: "samples",
      resource_type: "auto",
    });

    const newAssign = await SampleAssign.create({
      referenceNumber,
      documentUrl: uploadedFile.secure_url,
    });

    res.status(201).json(newAssign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
}

export async function getSampleAssigns(req, res) {
  try {
    const assigns = await SampleAssign.find().sort({ createdAt: -1 });
    res.status(200).json(assigns);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}
