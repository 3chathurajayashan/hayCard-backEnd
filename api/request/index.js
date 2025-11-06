export default async function handler(req, res) {
  // ✅ Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    // Example data (replace with DB fetch)
    return res.status(200).json([
      { name: "Hydrochloric Acid", qty: 10 },
      { name: "Sodium Chloride", qty: 15 },
    ]);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
