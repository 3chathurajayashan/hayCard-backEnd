import Reference from "../models/Reference";

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

// ✅ Mark sample as finalized
export const markSampleOut = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Reference ID is required" });

    const updatedRef = await Reference.findByIdAndUpdate(
      id,
      { sampleOut: true },
      { new: true }
    );

    if (!updatedRef) return res.status(404).json({ message: "Reference not found" });

    res.status(200).json({ message: "Sample finalized", reference: updatedRef });
  } catch (error) {
    console.error("Mark sample out error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
