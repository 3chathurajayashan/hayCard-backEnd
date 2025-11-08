const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  addSample,
  getSamples,
} = require("../controllers/sampleAssignController");

const SampleAssign = require("../models/sampleAssignModel");

 /*
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});*/

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only Excel files (.xls, .xlsx) are allowed"));
    }
    cb(null, true);
  },
});

// ✅ Routes
router.post("/add", upload.single("document"), addSample);
router.get("/all", getSamples);

router.patch("/out/:id", async (req, res) => {
  try {
    const sample = await SampleAssign.findByIdAndUpdate(
      req.params.id,
      { isOut: true },
      { new: true }
    );
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    res.status(200).json(sample);
  } catch (error) {
    console.error("Error updating sample:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
