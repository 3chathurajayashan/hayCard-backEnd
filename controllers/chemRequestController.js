const Chemical = require("../models/chemRequestModel");

// ✅ Add a new chemical
const addChemical = async (req, res) => {
  try {
    let { chemicalName, customChemical, quantity, handOverRange, fixedHandOverDate } = req.body;

    // ✅ Handle "Other" chemical name
    if (chemicalName === "Other") {
      if (!customChemical || customChemical.trim() === "") {
        return res.status(400).json({ message: "Please provide a custom chemical name." });
      }
      chemicalName = customChemical.trim();
    }

    // ✅ Validate Fixed Date (if used)
    if (handOverRange === "Fixed Date" && !fixedHandOverDate) {
      return res.status(400).json({ message: "Please provide a fixed handover date." });
    }

    const newChemical = new Chemical({
      chemicalName,
      customChemical: req.body.chemicalName === "Other" ? req.body.customChemical : "",
      quantity,
      handOverRange,
      fixedHandOverDate: handOverRange === "Fixed Date" ? fixedHandOverDate : null,
    });

    await newChemical.save();
    res.status(201).json({
      message: "Chemical added successfully!",
      chemical: newChemical,
    });
  } catch (error) {
    console.error("Error adding chemical:", error);
    res.status(500).json({
      message: "Error adding chemical",
      error: error.message,
    });
  }
};

// ✅ Get all chemicals
const getChemicals = async (req, res) => {
  try {
    const chemicals = await Chemical.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(chemicals);
  } catch (error) {
    console.error("Error fetching chemicals:", error);
    res.status(500).json({
      message: "Error fetching chemicals",
      error: error.message,
    });
  }
};

// ✅ Export functions
module.exports = { addChemical, getChemicals };
