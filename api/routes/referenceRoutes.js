import express from "express";
import { addReference, getAllReferences } from "../controllers/referenceController.js";
import multer from "multer";

const router = express.Router();

// ✅ Multer setup for serverless (Vercel)
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // optional: max 10MB
  fileFilter: (req, file, cb) => {
    // optional: only allow PDFs and images
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or image files are allowed"));
    }
  }
});

// Routes
router.post("/add", upload.single("document"), addReference);
router.get("/", getAllReferences);

export default router;
