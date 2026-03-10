import Sample from "../models/sampleModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/emailService.js";
import moment from "moment-timezone";

/* =========================================
   CREATE GATE PASS
========================================= */
export const createGatePass = async (req, res) => {
  try {
    const data = req.body;

    const newGatePass = new Sample({
      ...data,
      createdBy: "68ed3e55ee9b3be6e6c2f465",
    });

    await newGatePass.save();

    /* EMAIL TO TECHNICIANS */
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   ADD CHILD SAMPLE
========================================= */
export const addSampleToGatePass = async (req, res) => {
  try {

    const { gatePassId } = req.params;
    const newSample = req.body;

    const gatePass = await Sample.findById(gatePassId);

    if (!gatePass) {
      return res.status(404).json({
        success: false,
        message: "Gate Pass not found",
      });
    }

    gatePass.samples.push(newSample);

    await gatePass.save();

    await sendEmail(
      "Sample Added",
      `<p>A new child sample <strong>${newSample.sampleId}</strong> was added.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Sample added successfully",
      data: gatePass,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

/* =========================================
   GET ALL GATE PASSES
========================================= */
export const getAllGatePasses = async (req, res) => {
  try {
    // Fetch all samples without any user filtering
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

      return res.status(404).json({
        success: false,
        message: "Gate Pass not found",
      });

    }

    res.status(200).json({
      success: true,
      data: gatePass,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
/* =========================================
   GET PUBLIC SAMPLE (NO AUTH)
========================================= */
export const getPublicSample = async (req, res) => {
  try {
    const { id } = req.params; // this can be Gate Pass ID or sampleId

    // Fetch gate pass containing this child sample
    const gatePass = await Sample.findOne({
      "samples._id": id, // match child sample _id
    }).populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!gatePass) {
      return res.status(404).json({
        success: false,
        message: "Sample not found",
      });
    }

    // Find the specific child sample
    const sample = gatePass.samples.id(id);

    res.status(200).json({
      success: true,
      gatePass: {
        _id: gatePass._id,
        requestRefNo: gatePass.requestRefNo,
        sampleRefNo: gatePass.sampleRefNo,
        from: gatePass.from,
        to: gatePass.to,
        sampleRoute: gatePass.sampleRoute,
        remarks: gatePass.remarks,
        createdBy: gatePass.createdBy,
        assignedTo: gatePass.assignedTo,
        createdAt: gatePass.createdAt,
      },
      sample,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   UPDATE CHILD SAMPLE
========================================= */
export const updateChildSample = async (req, res) => {

  try {

    const { gatePassId, sampleId } = req.params;

    const gatePass = await Sample.findById(gatePassId);

    if (!gatePass) {
      return res.status(404).json({
        success: false,
        message: "Gate Pass not found",
      });
    }

    const sample = gatePass.samples.find(
      (s) => s.sampleId === sampleId
    );

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: "Sample not found",
      });
    }

    Object.assign(sample, req.body);

    await gatePass.save();

    await sendEmail(
      "Sample Updated Notification",
      `<p>The sample <strong>${sample.sampleId}</strong> has been updated.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Sample updated successfully",
      data: gatePass,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

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
      return res.status(404).json({
        success: false,
        message: "Gate Pass not found",
      });
    }

    gatePass.samples = gatePass.samples.filter(
      (s) => s.sampleId !== sampleId
    );

    await gatePass.save();

    res.status(200).json({
      success: true,
      message: "Sample deleted successfully",
      data: gatePass,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};

/* =========================================
   UPDATE RECEIVED STATUS (OLD SYSTEM)
========================================= */
export const updateReceivedStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { received } = req.body;

    const now = moment().tz("Asia/Colombo");

    const receivedDate = now.format("YYYY-MM-DD");
    const receivedTime = now.format("hh:mm:ss A");

    const sample = await Sample.findByIdAndUpdate(
      id,
      {
        received,
        receivedDate: received ? receivedDate : null,
        receivedTime: received ? receivedTime : null,
      },
      { new: true }
    );

    if (received) {

      await sendEmail(
        "Sample Received!",
        `<p>The sample <strong>${sample.sampleRefNo}</strong> has been received.</p>`
      );

    }

    res.status(200).json(sample);

  } catch (err) {

    res.status(500).json({
      message: "Error updating received status",
      error: err,
    });

  }

};