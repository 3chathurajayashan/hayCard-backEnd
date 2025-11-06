import { enableCors } from "../utils/cors.js";

export default async function handler(req, res) {
  if (enableCors(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json([
      { chemicalName: "Hydrochloric Acid", quantity: "25L", handOverRange: "Within 2 Weeks", createdAt: new Date() },
      { chemicalName: "Sodium Hydroxide", quantity: "15kg", handOverRange: "Within 1 Week", createdAt: new Date() },
    ]);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
