import express from "express";
import { protect } from "../middlewares/auth.js";

import {
  createGatePass,
  addSampleToGatePass,
  getAllGatePasses,
  getSingleGatePass,
  updateChildSample,
  deleteChildSample,
  updateReceivedStatus,
  getFullGatePassById,
  finalizeGatePass,
  updateAnalysedBy,
  getAnalysedBy

} from "../controllers/sampleController.js";

const router = express.Router();

/* =========================================
   GATE PASS ROUTES
========================================= */

router.post("/", createGatePass);
router.get("/public/:id", getFullGatePassById); // MUST be BEFORE /:idss
router.get("/", getAllGatePasses);
router.get("/:id", protect, getSingleGatePass);
 router.patch("/:id/analysedBy", updateAnalysedBy);

// Get analysedBy field only
router.get("/:id/analysedBy", getAnalysedBy);

// routes/sampleRoutes.js
router.put("/:id/finalize", protect, finalizeGatePass);
router.post("/:gatePassId/sample", protect, addSampleToGatePass);
router.put("/:gatePassId/sample/:sampleId", protect, updateChildSample);
router.delete("/:gatePassId/sample/:sampleId", protect, deleteChildSample);
router.put("/:id/received", protect, updateReceivedStatus);


export default router;