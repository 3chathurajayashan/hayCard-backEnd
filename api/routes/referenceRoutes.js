import express from "express";
import multer from "multer";
import { addReference, getAllReferences } from "../controllers/referenceController.js";

const router = express.Router();

// Multer memory storage for serverless
const storage = multer.memoryStorage();
const upload = multer({ storage }); // all files (PDF, CSV, Excel, images) accepted

// Routes
router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

export default router;
