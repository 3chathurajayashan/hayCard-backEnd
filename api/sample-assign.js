import express from "express";
import { connectDB } from "./config/db.js";
import { addSampleAssign, getSampleAssigns } from "./controllers/sampleAssignController.js";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", getSampleAssigns);
app.post("/", addSampleAssign);

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
