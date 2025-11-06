import dbConnect from "@/lib/dbConnect";
import Chemical from "./model";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await Chemical.findByIdAndDelete(id);
      return res.status(200).json({ message: "Chemical deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting chemical", error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const updated = await Chemical.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Error updating chemical", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
