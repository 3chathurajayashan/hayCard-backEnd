const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  createSample,
  getSamples,
  getSampleById,
  updateSample,
  deleteSample,
  updateReceivedStatus
} = require("../controllers/sampleController");

router.post("/", protect, createSample);
router.get("/", protect, getSamples);
router.get("/:id", protect, getSampleById);
router.put("/:id", protect, updateSample);
router.put("/samples/:id/received", updateReceivedStatus);
router.delete("/:id", protect, deleteSample);
 


module.exports = router;
