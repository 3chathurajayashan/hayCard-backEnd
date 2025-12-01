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

    // ✅ Send Email Notification
    await sendEmail(
      "New Chemical Request",
      `
        <p>Hello! A new chemical Request has been added to the system.<br>
        <strong>Chemical:</strong> ${newChemical.chemicalName}<br>
        <strong>Quantity:</strong> ${newChemical.quantity}<br>
        <strong>Hand Over:</strong> ${newChemical.handOverRange}</p>

        <a 
          href="https://hay-card-front-ends-nine.vercel.app/purchasing" 
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
          View Dashboard
        </a>
      `
    );

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
