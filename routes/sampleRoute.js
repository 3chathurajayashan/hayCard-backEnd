const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  createSample,
  getSamples,
  getSampleById,
  getSampleByIdPublic, // NEW
  updateSample,
  deleteSample,
  updateReceivedStatus
} = require("../controllers/sampleController");

// Protected routes
router.post("/", protect, createSample);
router.get("/", protect, getSamples);
router.get("/:id", protect, getSampleById); // Admin/dashboard access
router.put("/:id", protect, updateSample);
router.put("/samples/:id/received", protect, updateReceivedStatus);
router.delete("/:id", protect, deleteSample);
// sampleRoutes.js
router.get("/public/:id", getSampleByIdPublic);

// Public route for QR scan
router.get("/public/:id", getSampleByIdPublic);

module.exports = router;
