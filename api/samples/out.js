import connectMongo from "../../utils/mongo";
import CustomerSample from "../../models/sampleAssignModel";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "PATCH") {
    const { id } = req.query;

    try {
      const sample = await CustomerSample.findByIdAndUpdate(
        id,
        { isOut: true },
        { new: true }
      );

      if (!sample) return res.status(404).json({ message: "Sample not found" });

      res.status(200).json(sample);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
