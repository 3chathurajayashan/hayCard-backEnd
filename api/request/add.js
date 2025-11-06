import { enableCors } from "../utils/cors.js";

export default async function handler(req, res) {
  if (enableCors(req, res)) return;

  if (req.method === "POST") {
    const { chemicalName, quantity, handOverRange } = req.body;

    // (Later: Save to MongoDB)
    return res.status(201).json({
      message: "Chemical request added successfully!",
      data: { chemicalName, quantity, handOverRange },
    });
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
