import dbConnect from "@/lib/dbConnect";
import Chemical from "./model";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  await dbConnect();

  try {
    let { chemicalName, customChemical, quantity, handOverRange, fixedHandOverDate } = req.body;

    if (chemicalName === "Other") {
      if (!customChemical || customChemical.trim() === "")
        return res.status(400).json({ message: "Please provide a custom chemical name." });

      chemicalName = customChemical.trim();
    }

    if (handOverRange === "Fixed Date" && !fixedHandOverDate)
      return res.status(400).json({ message: "Please provide a fixed handover date." });

    const newChemical = await Chemical.create({
      chemicalName,
      customChemical: chemicalName === "Other" ? customChemical : "",
      quantity,
      handOverRange,
      fixedHandOverDate: handOverRange === "Fixed Date" ? fixedHandOverDate : null,
    });

    return res.status(201).json({
      message: "Chemical added successfully!",
      chemical: newChemical,
    });
  } catch (error) {
    console.error("Error adding chemical:", error);
    return res.status(500).json({ message: "Error adding chemical", error: error.message });
  }
}
