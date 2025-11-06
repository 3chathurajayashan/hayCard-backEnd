import connectMongo from "../../utils/mongo";
import Sample from "../../models/sampleAssignModel";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import nextConnect from "next-connect";

export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only Excel files (.xls, .xlsx) are allowed"));
    }
    cb(null, true);
  },
});

const handler = nextConnect({
  onError(error, req, res) {
    console.error("API Error:", error);
    // Always send CORS headers on error
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ message: `Server error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  },
});

handler.use((req, res, next) => {
  // ✅ Always run this first
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://hay-card-front-end.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

handler.use(upload.single("document"));

handler.post(async (req, res) => {
  try {
    console.log("Incoming POST request...");
    await connectMongo();

    if (!req.file) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "customer_samples",
          public_id: `${Date.now()}_${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const newSample = new Sample({
      referenceNumber: req.body.referenceNumber,
      documentPath: uploadResult.secure_url,
    });

    await newSample.save();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(201).json({
      message: "Sample uploaded successfully!",
      sample: newSample,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default handler;
