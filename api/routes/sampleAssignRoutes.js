import express from "express";
import {
  addSampleAssign,
  getSamples,
  deleteSample,
} from "../controllers/sampleAssignController";

const router = express.Router();

router.post("/add", addSampleAssign);
router.get("/all", getSamples);
router.delete("/delete/:id", deleteSample);

export default router;
