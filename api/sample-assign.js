import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";
import SampleAssign from "./models/SampleAssign"; // your Mongoose model

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  }
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    // Handle file upload + referenceNumber
    upload.single("document")(req, res, async (err) => {
      if (err) return res.status(500).json({ message: err.message });

      const { referenceNumber } = req.body;
      const file = req.file;

      if (!referenceNumber || !file)
        return res.status(400).json({ message: "Missing fields" });

      try {
        // Upload to Cloudinary (replace with your cloudinary code)
        // Assume cloudinary upload returns url in `documentUrl`
        const documentUrl = "https://res.cloudinary.com/demo/sample.pdf";

        const newSample = await SampleAssign.create({
          referenceNumber,
          documentUrl,
        });

        res.status(200).json(newSample);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  } else if (req.method === "GET") {
    // Get all sample assigns
    try {
      const samples = await SampleAssign.find({});
      res.status(200).json(samples);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
