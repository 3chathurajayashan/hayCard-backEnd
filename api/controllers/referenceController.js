import Reference from "../models/Reference.js";

// Add reference with file
export const addReference = async (req, res) => {
  try {
    const { refNumber } = req.body;
    if (!refNumber) return res.status(400).json({ message: "Reference number is required" });

    let fileName = null;
    let fileData = null;

    if (req.file) {
      fileName = req.file.originalname;
      fileData = req.file.buffer.toString("base64"); // convert file to base64
    }

    const newRef = new Reference({ refNumber, fileName, fileData });
    await newRef.save();

    res.status(200).json(newRef);
  } catch (error) {
    console.error("Add reference error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all references
export const getAllReferences = async (req, res) => {
  try {
    const refs = await Reference.find().sort({ createdAt: -1 });
    res.status(200).json(refs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
