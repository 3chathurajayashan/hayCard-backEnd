import express from "express";
import multer from "multer";
import { addReference, getAllReferences } from "../controllers/referenceController";

const router = express.Router();

// ✅ Memory storage for Vercel serverless
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

export default router;
