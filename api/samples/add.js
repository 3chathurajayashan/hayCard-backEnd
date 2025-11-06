import connectMongo from "../../utils/mongo";
import Sample from "../../models/sampleAssignModel";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import nextConnect from "next-connect";

// ✅ Disable Next.js body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Set up Multer (for Excel files only)
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

// ✅ Create handler with nextConnect
const handler = nextConnect({
  onError(error, req, res) {
    console.error("API Error:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  },
});

// ✅ Fix CORS
handler.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://hay-card-front-end.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// ✅ Handle File Upload
handler.use(upload.single("document"));

handler.post(async (req, res) => {
  try {
    console.log("Incoming POST request...");
    await connectMongo();

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "customer_samples" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save MongoDB document
    const newSample = new Sample({
      referenceNumber: req.body.referenceNumber,
      documentPath: uploadResult.secure_url,
    });

    await newSample.save();

    res.status(201).json({
      message: "Sample uploaded successfully!",
      sample: newSample,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default handler;
