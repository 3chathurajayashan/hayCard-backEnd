const nodemailer = require("nodemailer");

// Configure the transporter using your lab system Gmail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: process.env.EMAIL_PORT, // 587 or 465
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // your lab system email
    pass: process.env.EMAIL_PASS,  
  },
});

/**
 * Send an email to the lab admin
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 */
async function sendEmail(subject, html) {
  try {
    const mailOptions = {
      from: `"HayCarb Notifications" <${process.env.EMAIL_USER}>`,
      to: "pcf@haycarb.com ,nishendraharshani@gmail.com , chirangapraveen@gmail.com, chathurachamod88@gmail.com ", // Lab admin email
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to lab admin: chiranga@gmail.com`);
    return info;
  } catch (err) {
    console.error("❌ Email sending error:", err.message);
    throw err;
  }
}

module.exports = { sendEmail };
