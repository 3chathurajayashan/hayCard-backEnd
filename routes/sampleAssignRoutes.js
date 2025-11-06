const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import the sampleAssign model
const SampleAssign = require("../models/sampleAssignModel");
const { addSample, getSamples } = require("../controllers/sampleAssignController");

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes
router.post("/add", upload.single("document"), addSample);
router.get("/all", getSamples);

// Mark sample as out
router.patch("/out/:id", async (req, res) => {
  try {
    console.log("PATCH /out/:id called with id:", req.params.id);
    const sample = await SampleAssign.findByIdAndUpdate(
      req.params.id,
      { isOut: true },
      { new: true }
    );
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    res.status(200).json(sample);
  } catch (error) {
    console.error("Error in PATCH /out/:id:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
