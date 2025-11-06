const CustomerSample = require("../models/sampleAssignModel");

// Upload a new sample
exports.addSample = async (req, res) => {
  try {
    const { referenceNumber } = req.body;
    if (!req.file) return res.status(400).json({ message: "File is required" });

    const sample = new CustomerSample({
      referenceNumber,
      documentPath: req.file.path, // multer stores file path in req.file.path
    });

    await sample.save();
    res.status(201).json({ message: "Sample added successfully", sample });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all samples
exports.getSamples = async (req, res) => {
  try {
    const samples = await CustomerSample.find().sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
