import dbConnect from "@/lib/dbConnect";
import Chemical from "./model";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const chemicals = await Chemical.find().sort({ createdAt: -1 });
      return res.status(200).json(chemicals);
    } catch (error) {
      console.error("Error fetching chemicals:", error);
      return res.status(500).json({ message: "Error fetching chemicals", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
