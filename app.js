require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const uploadDir = "./uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads folder created!");
}

const userRoutes = require("./routes/userRoute");
const sampleRoutes = require("./routes/sampleRoute");
const chemRoutes = require("./routes/chemRequestRoute");
const Sample = require("./models/sampleModel");
const User = require("./models/userModel");
  const cusSampleRoutes = require("./routes/customerSampleRoute");
const { sendEmail } = require("./utils/emailService");
const cron = require("node-cron");
const customerSampleRoutes = require("./routes/sampleAssignRoutes");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files
app.use("/users", userRoutes);
app.use("/samples", sampleRoutes);
app.use("/api/chemicals", chemRoutes);
 
app.use("/api/cusSamples", cusSampleRoutes);
 
app.use("/api/samples", customerSampleRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect("mongodb+srv://admin:admin@cluster0.afu07sh.mongodb.net/heyCrabDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    console.log("Mongo connected");

    // Cron job: run once every day at 9:00 AM server time to check samples not received > 1 day
    cron.schedule("0 9 * * *", async () => {
      try {
        const oneDayAgo = new Date(Date.now() - 24*60*60*1000);
        // samples created > 1 day ago and still Registered (not Received)
        const overdue = await Sample.find({ createdAt: { $lte: oneDayAgo }, status: "Registered" }).populate("createdBy");
        for (const s of overdue) {
          if (s.createdBy && s.createdBy.email) {
            await sendEmail(s.createdBy.email, "Sample Not Received", `<p>Your sample ${s.sampleId} is not yet received by lab. Please check.</p>`);
          }
        }
      } catch (err) {
        console.error("Cron error:", err);
      }
    }, { timezone: "Asia/Colombo" }); // set timezone
  })
  .catch(err => console.error(err));
