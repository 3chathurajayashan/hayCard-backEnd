import Cors from "cors";
import initMiddleware from "../../utils/init-middleware";
import dbConnect from "../../utils/dbConnect";
import CusSample from "../../models/customerSample";

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ["GET", "DELETE"],
    origin: "*",
  })
);

export default async function handler(req, res) {
  await cors(req, res);
  await dbConnect();

  const { ref } = req.query;

  if (req.method === "GET") {
    try {
      const sample = await CusSample.findOne({ referenceNumber: ref });
      if (!sample) return res.status(404).json({ message: "Sample not found!" });
      return res.status(200).json(sample);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching sample", error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const deleted = await CusSample.findOneAndDelete({ referenceNumber: ref });
      if (!deleted) return res.status(404).json({ message: "Sample not found!" });
      return res.status(200).json({ message: "Sample deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting sample", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
