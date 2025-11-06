export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { chemicalName, quantity, requester } = req.body;

    // You can later add DB connection here
    return res.status(201).json({
      message: "Chemical request added successfully!",
      data: { chemicalName, quantity, requester },
    });
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
