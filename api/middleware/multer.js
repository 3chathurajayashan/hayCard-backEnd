import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === ".pdf" || ext === ".xlsx" || ext === ".xls" || ext === ".docx") {
    cb(null, true);
  } else {
    cb(new Error("Only document or Excel files allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
