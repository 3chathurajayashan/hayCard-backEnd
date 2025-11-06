import dbConnect from "@/lib/dbConnect";
import Chemical from "./model";
import { enableCors } from "../cors";  // 👈 import this

export default async function handler(req, res) {
  enableCors(res); // 👈 add this line first

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // 👈 preflight check fix
  }

  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    let { chemicalName, customChemical, quantity, handOverRange, fixedHandOverDate } = req.body;

    if (chemicalName === "Other" && (!customChemical || !customChemical.trim()))
      return res.status(400).json({ message: "Please provide a custom chemical name." });

    if (handOverRange === "Fixed Date" && !fixedHandOverDate)
      return res.status(400).json({ message: "Please provide a fixed handover date." });

    const newChemical = await Chemical.create({
      chemicalName,
      customChemical,
      quantity,
      handOverRange,
      fixedHandOverDate: handOverRange === "Fixed Date" ? fixedHandOverDate : null,
    });

    return res.status(201).json({ message: "Chemical added successfully!", chemical: newChemical });
  } catch (error) {
    console.error("Error adding chemical:", error);
    return res.status(500).json({ message: "Error adding chemical", error: error.message });
  }
}
