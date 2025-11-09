import express from "express";
import upload from "../middleware/multer.js";
import { uploadDocument, getDocuments } from "../controllers/documentController.js";

const router = express.Router();

router.post("/", upload.single("file"), uploadDocument);
router.get("/", getDocuments);

export default router;
