const express = require("express");
const router = express.Router();
const {
  addCusSample,
  getCusSamples,
  getCusSampleByRef,
  deleteCusSample,
} = require("../controllers/customerSampleController");

// Routes
router.post("/add", addCusSample); // Add a new customer sample
router.get("/", getCusSamples); // Get all customer samples
router.get("/:referenceNumber", getCusSampleByRef); // Get sample by ref
router.delete("/:referenceNumber", deleteCusSample); // Delete sample by ref

module.exports = router;
