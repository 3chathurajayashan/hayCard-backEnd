const Chemical = require("../models/chemRequestModel");

// ✅ Add a new chemical
const addChemical = async (req, res) => {
  try {
    const { chemicalName, quantity, handOverRange, fixedHandOverDate } = req.body;

    // Validate Fixed Date if selected
    if (handOverRange === "Fixed Date" && !fixedHandOverDate) {
      return res.status(400).json({ message: "Please provide a fixed handover date." });
    }

    const newChemical = new Chemical({
      chemicalName,
      quantity,
      handOverRange,
      fixedHandOverDate,
    });

    await newChemical.save();
    res.status(201).json({ message: "Chemical added successfully!", chemical: newChemical });
  } catch (error) {
    res.status(500).json({ message: "Error adding chemical", error: error.message });
  }
};

// ✅ Get all chemicals
const getChemicals = async (req, res) => {
  try {
    const chemicals = await Chemical.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(chemicals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chemicals", error: error.message });
  }
};

// ✅ Export functions
module.exports = { addChemical, getChemicals };
