// /api/samples/all.js
import connectMongo from "../../utils/mongo";
import Sample from "../../models/sampleAssignModel";

export default async function handler(req, res) {
  // CORS - allow your front-end and localhost for testing
  const allowedOrigins = [
    process.env.FRONTEND_URL || "https://hay-card-front-end.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectMongo();
    const samples = await Sample.find().sort({ createdAt: -1 });
    return res.status(200).json(samples);
  } catch (err) {
    console.error("Error fetching samples:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
