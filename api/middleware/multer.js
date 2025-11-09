import multer from "multer";

// Use memory storage (files stored in memory as buffer)
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // optional: max file size 10MB
  fileFilter: (req, file, cb) => {
    // optional: filter allowed file types
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or images allowed"));
    }
  }
});

export default upload;
