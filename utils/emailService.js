const nodemailer = require("nodemailer");
const Notification = require("../models/notificationModel");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  const info = await transporter.sendMail(mailOptions);

  // log email to DB (best practice)
  try {
    await Notification.create({
      to,
      subject,
      body: html
    });
  } catch (err) {
    console.error("Notification logging error:", err);
  }
  return info;
}

module.exports = { sendEmail };
