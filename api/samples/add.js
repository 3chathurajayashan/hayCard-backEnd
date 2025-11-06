// /api/samples/add.js
import connectMongo from "../../utils/mongo";
import Sample from "../../models/sampleAssignModel";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import nextConnect from "next-connect";

export const config = { api: { bodyParser: false } };

// Cloudinary config from env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "application/msword",
      "application/vnd.ms-office"
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only Excel/PDF/DOC files are allowed"));
    }
    cb(null, true);
  }
});

const handler = nextConnect({
  onError(err, req, res) {
    console.error("API Error:", err);
    // Ensure CORS header on error
    const origin = req.headers.origin || process.env.FRONTEND_URL;
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.status(500).json({ message: "Server error", error: err.message });
  },
  onNoMatch(req, res) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || process.env.FRONTEND_URL);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
});

// CORS middleware (always set before heavy work)
handler.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || "https://hay-card-front-end.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

handler.use(upload.single("document"));

handler.post(async (req, res) => {
  try {
    await connectMongo();
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // upload to Cloudinary as raw file
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "customer_samples", public_id: `${Date.now()}_${req.file.originalname}` },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const newSample = new Sample({
      referenceNumber: req.body.referenceNumber || (Date.now().toString()),
      documentPath: uploadResult.secure_url
    });
    await newSample.save();

    return res.status(201).json({ message: "Uploaded", sample: newSample });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default handler;
