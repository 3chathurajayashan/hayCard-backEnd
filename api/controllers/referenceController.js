import Reference from "../models/Reference";

export const addReference = async (req, res) => {
  try {
    const { refNumber } = req.body;
    if (!refNumber) return res.status(400).json({ message: "Reference number is required" });

    let documentUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "samples" });
      documentUrl = result.secure_url;
    }

    const newRef = new Reference({ refNumber, document: documentUrl });
    await newRef.save();

    res.status(200).json(newRef);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
