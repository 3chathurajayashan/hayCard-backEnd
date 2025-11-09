import dbConnect from "../../lib/dbConnect";
import Reference from "../models/Reference";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "POST") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Reference ID is required" });

    try {
      const updatedRef = await Reference.findByIdAndUpdate(
        id,
        { sampleOut: true },
        { new: true }
      );

      if (!updatedRef) return res.status(404).json({ error: "Reference not found" });

      res.status(200).json({ message: "Sample finalized", reference: updatedRef });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
