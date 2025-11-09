import express from "express";
import { addReference, getAllReferences } from "../controllers/referenceController";

const router = express.Router();

router.post("/add", addReference);
router.get("/", getAllReferences);

export default router;
