import express from "express";
import multer from "multer";
import { addReference, getAllReferences } from "../controllers/referenceController.js";

const router = express.Router();

// Use memory storage for serverless
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

export default router;
