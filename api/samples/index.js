import connectMongo from "../../utils/mongo";
import CustomerSample from "../../models/sampleAssignModel";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "GET") {
    try {
      const samples = await CustomerSample.find().sort({ createdAt: -1 });
      res.status(200).json(samples);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
