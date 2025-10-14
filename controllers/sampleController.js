const Sample = require("../models/sampleModel");
const User = require("../models/userModel");
const { sendEmail } = require("../utils/emailService");

// CREATE new sample
exports.createSample = async (req, res) => {
  try {
    const {
      requestRefNo,
      sampleRefNo,
      from,
      gatePassNo,
      sampleInTime,
      sampleInDate,
      remarks,
      sampleRoute,
      testMethod,
    } = req.body;

    // Validate sampleRoute
    if (!sampleRoute || !["Direct from Madampe", "Direct from Badalgama", "Through Wewalduwa"].includes(sampleRoute)) {
      return res.status(400).json({ message: "Invalid sampleRoute value" });
    }

    const sample = await Sample.create({
      requestRefNo,
      sampleRefNo,
      from,
      gatePassNo,
      sampleInTime,
      sampleInDate,
      remarks,
      sampleRoute,
      testMethod,
      createdBy: req.user._id,
    });

    // Notify lab technicians
    const techs = await User.find({ role: "technician" });
    const techEmails = techs.map((t) => t.email);

    if (techEmails.length) {
      await sendEmail(
        techEmails.join(","),
        "New Sample Registered",
        `<p>A new sample <strong>${sample.sampleId}</strong> has been registered.</p>
         <p>Check Dashboard: <a href="${process.env.FRONTEND_BASE_URL || "http://localhost:5000"}/samples/${sample.sampleId}">View Sample</a></p>`
      );
    }

    // Return populated sample for front-end
    const populatedSample = await Sample.findById(sample._id).populate("createdBy");
    res.status(201).json(populatedSample);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET all samples
exports.getSamples = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "factory") {
      filter.createdBy = req.user._id;
    } else if (req.user.role === "technician") {
      filter = { $or: [{ assignedTo: req.user._id }, { status: "Registered" }] };
    }

    const samples = await Sample.find(filter).populate("createdBy").sort({ createdAt: -1 });
    res.json(samples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single sample by ID
exports.getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id).populate("createdBy");
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    res.json(sample);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE sample
exports.updateSample = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) return res.status(404).json({ message: "Sample not found" });

    // Prevent creator from editing receivedTime/date
    if (req.user._id.toString() === sample.createdBy.toString()) {
      delete req.body.sampleReceivedTime;
      delete req.body.sampleReceivedDate;
    }

    Object.assign(sample, req.body);
    sample.updatedAt = new Date();
    await sample.save();

    // Notify creator if updated by someone else
    if (req.user._id.toString() !== sample.createdBy.toString()) {
      const creator = await User.findById(sample.createdBy);
      if (creator) {
        await sendEmail(
          creator.email,
          "Sample Updated",
          `<p>Your sample <strong>${sample.sampleId}</strong> has been updated by ${req.user.name}.</p>`
        );
      }
    }

    const populatedSample = await Sample.findById(sample._id).populate("createdBy");
    res.json(populatedSample);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE sample
exports.deleteSample = async (req, res) => {
  try {
    const sample = await Sample.findByIdAndDelete(req.params.id);
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    res.json({ message: "Sample deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
