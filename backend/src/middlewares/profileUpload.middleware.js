
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { PROFILE_DOCUMENTS_DIR } from "../config/uploads.js";

fs.mkdirSync(PROFILE_DOCUMENTS_DIR, { recursive: true });

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_DOCUMENTS_DIR);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    const error = new Error(
      "Only PDF, DOC, DOCX, JPG, JPEG, PNG and WEBP files are allowed."
    );

    error.statusCode = 400;

    return cb(error);
  }

  cb(null, true);
};

const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

export default profileUpload;
