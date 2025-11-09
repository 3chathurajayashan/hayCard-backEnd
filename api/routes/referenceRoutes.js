import express from "express";
import { addReference, getAllReferences } from "../controllers/referenceController";
import multer from "multer";

const router = express.Router();

// Multer setup for serverless (Vercel)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

export default router;
