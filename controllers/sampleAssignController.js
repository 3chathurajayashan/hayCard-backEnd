const CustomerSample = require("../models/sampleAssignModel");

exports.addSample = async (req, res) => {
  try {
    const { referenceNumber } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "File is required" });

    const newSample = new CustomerSample({
      referenceNumber,
      documentPath: req.file.path,
    });

    await newSample.save();
    res
      .status(201)
      .json({ message: "Sample added successfully ✅", sample: newSample });
  } catch (error) {
    console.error("Add sample error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSamples = async (req, res) => {
  try {
    const samples = await CustomerSample.find().sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    console.error("Get samples error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
