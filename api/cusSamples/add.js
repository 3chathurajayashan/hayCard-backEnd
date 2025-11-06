import Cors from "cors";
import initMiddleware from "../../utils/init-middleware";
import dbConnect from "../../utils/dbConnect";
import CusSample from "../../models/customerSample";

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ["POST"],
    origin: "*",
  })
);

export default async function handler(req, res) {
  await cors(req, res);
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { referenceNumber, quantity, grade, date, time } = req.body;

  if (!referenceNumber || !quantity || !grade || !date || !time) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const existing = await CusSample.findOne({ referenceNumber });
    if (existing) {
      return res.status(400).json({ message: "Reference number already exists!" });
    }

    const newSample = new CusSample({ referenceNumber, quantity, grade, date, time });
    await newSample.save();

    res.status(201).json({ message: "Customer sample added successfully!", sample: newSample });
  } catch (error) {
    res.status(500).json({ message: "Error adding sample", error: error.message });
  }
}
