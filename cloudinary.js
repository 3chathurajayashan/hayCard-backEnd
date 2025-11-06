const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "samples", // folder name in Cloudinary
    resource_type: "raw", // ⚠️ this is the key line!
    allowed_formats: ["xls", "xlsx", "pdf", "docx"], // allowed file types
  },
});

module.exports = { cloudinary, storage };
