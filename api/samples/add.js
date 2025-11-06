import { connectToDatabase } from "../../lib/mongoose";
import Sample from "../../models/sampleAssignModel";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import nextConnect from "next-connect";

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Disable Next.js body parsing (important for file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

// ================= MULTER STORAGE =================
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

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ message: `Error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});

// ================= MIDDLEWARE =================
apiRoute.use(upload.single("document"));

apiRoute.post(async (req, res) => {
  // ---- Setup CORS ----
  res.setHeader("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    await connectToDatabase();

    // ---- Upload to Cloudinary ----
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "customer_samples" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // ---- Save to MongoDB ----
    const newSample = new Sample({
      referenceNumber: req.body.referenceNumber,
      documentPath: uploadResult.secure_url,
    });

    await newSample.save();

    res.status(201).json({
      message: "Sample uploaded successfully",
      sample: newSample,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default apiRoute;
