import cloudinary from "./config/cloudinary.js";
import connectDB from "./utils/connectDB.js";
import Document from "./models/documentModel.js";
import multer from "./middleware/multer.js";
import { Readable } from "stream";

// Connect to MongoDB
connectDB();

export default async function handler(req, res) {
  // -------------------
  // 🔹 CORS Headers
  // -------------------
  res.setHeader("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app"); // allow your frontend only
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // -------------------
  // 🔹 POST - Upload File
  // -------------------
  if (req.method === "POST") {
    multer.single("file")(req, {}, async (err) => {
      if (err) return res.status(400).json({ message: err.message });

      try {
        const { referenceNumber } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "documents" },
          async (error, result) => {
            if (error) return res.status(500).json({ message: error.message });

            const doc = await Document.create({
              referenceNumber,
              fileUrl: result.secure_url,
              fileName: file.originalname,
            });

            res.status(201).json(doc);
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  } 
  // -------------------
  // 🔹 GET - List Documents
  // -------------------
  else if (req.method === "GET") {
    try {
      const docs = await Document.find().sort({ uploadedAt: -1 });
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } 
  // -------------------
  // 🔹 Other Methods
  // -------------------
  else {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
