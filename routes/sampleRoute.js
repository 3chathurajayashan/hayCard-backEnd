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
  getAnalysedBy,
} from "../controllers/sampleController.js";

const router = express.Router();

// ── Non-parameterized first ──────────────────────────
router.post("/", createGatePass);
router.get("/", getAllGatePasses);

// ── Specific named sub-routes BEFORE generic /:id ───
router.get("/public/:id", getFullGatePassById);       // ✅ before /:id

router.put("/:id/analysedBy", updateAnalysedBy);      // ✅ MOVED UP — before /:id
router.get("/:id/analysedBy", getAnalysedBy);         // ✅ MOVED UP — before /:id
router.put("/:id/received", protect, updateReceivedStatus);
router.put("/:id/finalize", protect, finalizeGatePass);

// ── Generic /:id LAST ────────────────────────────────
router.get("/:id", protect, getSingleGatePass);       // ✅ now safely at the bottom

// ── Child sample routes ──────────────────────────────
router.post("/:gatePassId/sample", protect, addSampleToGatePass);
router.put("/:gatePassId/sample/:sampleId", protect, updateChildSample);
router.delete("/:gatePassId/sample/:sampleId", protect, deleteChildSample);

export default router;