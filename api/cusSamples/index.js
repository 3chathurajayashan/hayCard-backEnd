import Cors from "cors";
import initMiddleware from "../../utils/init-middleware";
import dbConnect from "../../utils/dbConnect";
import CusSample from "../../models/customerSample";

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ["GET"],
    origin: "*",
  })
);

export default async function handler(req, res) {
  await cors(req, res);
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const samples = await CusSample.find().sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    res.status(500).json({ message: "Error fetching samples", error: error.message });
  }
}
