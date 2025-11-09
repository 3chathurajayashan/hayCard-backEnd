import cloudinary from "./config/cloudinary.js";
import connectDB from "./utils/connectDB.js";
import Document from "./models/documentModel.js";
import multer from "./middleware/multer.js";
import { Readable } from "stream";

// connect to DB
connectDB();

export default async function handler(req, res) {
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
  } else if (req.method === "GET") {
    try {
      const docs = await Document.find().sort({ uploadedAt: -1 });
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
