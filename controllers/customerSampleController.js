const CusSample = require("../models/customerSample");

// ➕ Add a new customer sample
const addCusSample = async (req, res) => {
  try {
    const { referenceNumber, quantity, grade, date, time } = req.body;

    if (!referenceNumber || !quantity || !grade || !date || !time) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existing = await CusSample.findOne({ referenceNumber });
    if (existing) {
      return res.status(400).json({ message: "Reference number already exists!" });
    }

    const newSample = new CusSample({
      referenceNumber,
      quantity,
      grade,
      date,
      time,
    });

    await newSample.save();

    // ✅ Send Email Notification
    await sendEmail(
      "New Customer Sample IN",
      `
        <p>Hello There A new customer sample has been In to the system.<br>
        <strong>Reference:</strong> ${newSample.referenceNumber}<br>
        <strong>Quantity:</strong> ${newSample.quantity}<br>
        <strong>Grade:</strong> ${newSample.grade}<br>
        <strong>Date:</strong> ${newSample.date}<br>
        <strong>Time:</strong> ${newSample.time}</p>

        <a 
          href="https://hay-card-front-ends-nine.vercel.app/samplein" 
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background: #007bff;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          View Sample In
        </a>
      `
    );

    res.status(201).json({ message: "Customer sample added successfully!", sample: newSample });
  } catch (error) {
    res.status(500).json({ message: "Error adding sample", error: error.message });
  }
};


// 📋 Get all customer samples
const getCusSamples = async (req, res) => {
  try {
    const samples = await CusSample.find().sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    res.status(500).json({ message: "Error fetching samples", error: error.message });
  }
};

// 🔍 Get a single sample by reference number
const getCusSampleByRef = async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    const sample = await CusSample.findOne({ referenceNumber });
    if (!sample) return res.status(404).json({ message: "Sample not found!" });

    res.status(200).json(sample);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sample", error: error.message });
  }
};

// ❌ Delete a sample
const deleteCusSample = async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    const deleted = await CusSample.findOneAndDelete({ referenceNumber });
    if (!deleted) return res.status(404).json({ message: "Sample not found!" });

    res.status(200).json({ message: "Sample deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sample", error: error.message });
  }
};

module.exports = {
  addCusSample,
  getCusSamples,
  getCusSampleByRef,
  deleteCusSample,
};
