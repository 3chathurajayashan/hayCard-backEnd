import express from "express";
import multer from "multer";
import { addReference, getAllReferences, markSampleOut } from "../controllers/referenceController";

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

// ✅ New route for sample out
router.post("/sample-out", markSampleOut);

export default router;
