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
  getPublicSample
} from "../controllers/sampleController.js";

const router = express.Router();

/* =========================================
   GATE PASS ROUTES
========================================= */

// Create Gate Pass
router.post("/",  createGatePass);
router.get("/public/:id", getPublicSample);

// Get All Gate Passes
router.get("/",   getAllGatePasses);

// Get Single Gate Pass
router.get("/:id", protect, getSingleGatePass);


/* =========================================
   CHILD SAMPLE ROUTES
========================================= */

// Add sample to Gate Pass
router.post("/:gatePassId/sample", protect, addSampleToGatePass);

// Update child sample
router.put("/:gatePassId/sample/:sampleId", protect, updateChildSample);

// Delete child sample
router.delete("/:gatePassId/sample/:sampleId", protect, deleteChildSample);


/* =========================================
   RECEIVED STATUS
========================================= */

router.put("/:id/received", protect, updateReceivedStatus);


export default router;