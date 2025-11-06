import connectDB from "../../utils/mongo";
import Sample from "../../models/sampleAssignModel";
import Cors from "cors";

const cors = Cors({ methods: ["GET", "DELETE"] });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  const { ref } = req.query;

  if (req.method === "GET") {
    const sample = await Sample.findOne({ referenceNumber: ref });
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    return res.status(200).json(sample);
  }

  if (req.method === "DELETE") {
    const deleted = await Sample.findOneAndDelete({ referenceNumber: ref });
    if (!deleted) return res.status(404).json({ message: "Sample not found" });
    // Delete file as well
    fs.unlinkSync(deleted.documentPath);
    return res.status(200).json({ message: "Sample deleted successfully" });
  }

  res.status(405).json({ message: "Method not allowed" });
}
