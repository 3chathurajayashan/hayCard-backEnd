import connectMongo from "../../utils/mongo";
import CustomerSample from "../../models/sampleAssignModel";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // We use formidable
  },
};

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ message: "File parsing error" });

      const { referenceNumber } = fields;
      const file = files.document;

      if (!referenceNumber || !file) {
        return res.status(400).json({ message: "Reference number and file required" });
      }

      try {
        const newSample = new CustomerSample({
          referenceNumber,
          documentPath: file.originalFilename || "no-path", // for demo
        });

        await newSample.save();
        res.status(201).json({ message: "Sample added successfully", sample: newSample });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
