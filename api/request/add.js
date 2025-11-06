import mongoose from "mongoose";
import Chemical from "./model.js"; // adjust path if needed

// ✅ Database connect helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// ✅ Enable CORS globally
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://hay-card-front-end.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req, res) {
  // ✅ Set CORS headers for *every* request
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Handle POST request (add chemical)
  if (req.method === "POST") {
    try {
      await connectDB();

      const { chemicalName, customChemical, quantity, handOverRange, fixedHandOverDate } = req.body;

      if (chemicalName === "Other" && !customChemical)
        return res.status(400).json({ message: "Please provide a custom chemical name." });

      const newChemical = await Chemical.create({
        chemicalName: chemicalName === "Other" ? customChemical : chemicalName,
        customChemical: chemicalName === "Other" ? customChemical : "",
        quantity,
        handOverRange,
        fixedHandOverDate: handOverRange === "Fixed Date" ? fixedHandOverDate : null,
      });

      return res.status(201).json({ message: "Chemical added successfully!", chemical: newChemical });
    } catch (error) {
      console.error("Error adding chemical:", error);
      return res.status(500).json({ message: "Error adding chemical", error: error.message });
    }
  }

  // ✅ If any other method used
  return res.status(405).json({ message: "Method Not Allowed" });
}
