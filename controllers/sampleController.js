import Sample from "../models/sampleModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/emailService.js";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

/* =========================================
   CREATE GATE PASS
========================================= */
export const createGatePass = async (req, res) => {
  try {
    const data = req.body;

    if (data.samples && Array.isArray(data.samples)) {
      data.samples = data.samples.map(s => ({
        ...s,
        sampleId: s.sampleId || uuidv4()
      }));
    } else {
      data.samples = [];
    }

    const newGatePass = new Sample({
      ...data,
      createdBy: "68ed3e55ee9b3be6e6c2f465",
    });

    await newGatePass.save();

    const techs = await User.find({ role: "technician" });
    const techEmails = techs.map((t) => t.email);

    if (techEmails.length) {
      await sendEmail(
        techEmails.join(","),
        "New Sample Registered",
        `<p>A new Gate Pass <strong>${newGatePass.sampleRefNo}</strong> has been created.</p>`
      );
    }

    res.status(201).json({
      success: true,
      message: "Gate Pass created successfully",
      data: newGatePass,
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =========================================
   ADD CHILD SAMPLE
========================================= */
export const addSampleToGatePass = async (req, res) => {
  try {
    const { gatePassId } = req.params;
    const sampleData = req.body;

    const gatePass = await Sample.findById(gatePassId);
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    const newSample = {
      ...sampleData,
      sampleId: sampleData.sampleId || uuidv4(),
    };

    const duplicate = gatePass.samples.find(s => s.sampleId === newSample.sampleId);
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Sample ID already exists in this Gate Pass" });
    }

    gatePass.samples.push(newSample);
    await gatePass.save();

    res.status(200).json({
      success: true,
      message: "Sample added successfully",
      data: gatePass,
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =========================================
   GET ALL GATE PASSES
========================================= */
export const getAllGatePasses = async (req, res) => {
  try {
    const gatePasses = await Sample.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gatePasses.length,
      data: gatePasses,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   GET SINGLE GATE PASS
========================================= */
export const getSingleGatePass = async (req, res) => {
  try {
    const gatePass = await Sample.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    res.status(200).json({ success: true, data: gatePass });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   GET PUBLIC GATE PASS (NO AUTH)
========================================= */
export const getPublicGatePass = async (req, res) => {
  try {
    const { id } = req.params;

    const gatePass = await Sample.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    res.status(200).json({
      success: true,
      gatePass,
      samples: gatePass.samples,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   UPDATE CHILD SAMPLE
   — Only updates child sample fields (results, testMethod, etc.)
   — analysedBy on the parent is handled separately via PATCH /:id/analysedBy
========================================= */
export const updateChildSample = async (req, res) => {
  try {
    const { gatePassId, sampleId } = req.params;

    const gatePass = await Sample.findById(gatePassId);
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    const sample = gatePass.samples.find(s => s.sampleId === sampleId);
    if (!sample) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    // Update allowed child-sample fields only
    const allowedFields = ["results", "testMethod", "unitNumber", "completedDate", "completedTime"];
    allowedFields.forEach(key => {
      if (req.body[key] !== undefined) {
        sample[key] = req.body[key];
      }
    });

    await gatePass.save();

    res.status(200).json({
      success: true,
      message: "Sample updated successfully",
      data: gatePass,
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =========================================
   DELETE CHILD SAMPLE
========================================= */
export const deleteChildSample = async (req, res) => {
  try {
    const { gatePassId, sampleId } = req.params;

    const gatePass = await Sample.findById(gatePassId);
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    gatePass.samples = gatePass.samples.filter(s => s.sampleId !== sampleId);
    await gatePass.save();

    res.status(200).json({
      success: true,
      message: "Sample deleted successfully",
      data: gatePass,
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =========================================
   UPDATE RECEIVED STATUS
========================================= */
export const updateReceivedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const now = moment().tz("Asia/Colombo");
    const receivedDate = now.format("YYYY-MM-DD");
    const receivedTime = now.format("hh:mm:ss A");

    const sample = await Sample.findByIdAndUpdate(
      id,
      { received: true, receivedDate, receivedTime },
      { new: true }
    );

    if (!sample) {
      return res.status(404).json({ message: "Gate Pass not found" });
    }

    await sendEmail(
      "Sample Received!",
      `<p>The sample <strong>${sample.sampleRefNo}</strong> has been received at the lab.</p>`
    );

    res.status(200).json({ success: true, data: sample });

  } catch (err) {
    res.status(500).json({ message: "Error updating received status", error: err.message });
  }
};

/* =========================================
   GET FULL GATE PASS DETAILS BY _ID
========================================= */
export const getFullGatePassById = async (req, res) => {
  try {
    const { id } = req.params;

    const gatePass = await Sample.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!gatePass) {
      return res.status(404).send("Not found");
    }

    const isBrowser = req.headers.accept?.includes("text/html");

    if (isBrowser) {
      return res.redirect(`https://hay-card-front-ends-nine.vercel.app/view/${id}`);
    }

    return res.status(200).json({ success: true, data: gatePass });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   FINALIZE GATE PASS
========================================= */
export const finalizeGatePass = async (req, res) => {
  try {
    const { id } = req.params;

    const gatePass = await Sample.findById(id);
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    if (gatePass.isFinalized) {
      return res.status(400).json({ success: false, message: "Gate Pass is already finalized" });
    }

    gatePass.isFinalized = true;
    gatePass.updatedAt = new Date();
    await gatePass.save();

    await sendEmail(
      "Gate Pass Finalized",
      `<p>The Gate Pass <strong>${gatePass.sampleRefNo}</strong> has been finalized. Results are now locked.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Gate Pass finalized successfully",
      data: gatePass,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================
   UPDATE ANALYSED BY
   — Uses findByIdAndUpdate so it BYPASSES the pre-save hook
     (which does expensive duplicate-sampleId checks we don't need here)
========================================= */
export const updateAnalysedBy = async (req, res) => {
  try {
    const { id } = req.params;
    const { analysedBy } = req.body;

    if (!analysedBy || analysedBy.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "analysedBy field is required",
      });
    }

    // ✅ findByIdAndUpdate directly sets the field in MongoDB — no pre-save hook interference
    const gatePass = await Sample.findByIdAndUpdate(
      id,
      {
        $set: {
          analysedBy: analysedBy.trim(),
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: false }
    );

    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    res.status(200).json({
      success: true,
      message: "analysedBy updated successfully",
      data: { id: gatePass._id, analysedBy: gatePass.analysedBy },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================
   GET ANALYSED BY
========================================= */
export const getAnalysedBy = async (req, res) => {
  try {
    const { id } = req.params;

    const gatePass = await Sample.findById(id, "analysedBy");
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Gate Pass not found" });
    }

    res.status(200).json({
      success: true,
      data: { id: gatePass._id, analysedBy: gatePass.analysedBy || "" },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};