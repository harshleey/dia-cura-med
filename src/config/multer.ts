import multer from "multer";
import { Request } from "express";

// Configure memory storage (files will be stored in memory as buffers)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Allow images and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs are allowed."));
  }
};

// Create multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5, // Maximum 3 files
  },
  preservePath: true,
});

// Specific configuration for doctor KYC step 2
export const doctorKycUpload = upload.array("files", 3); // Expecting 3 files with field name 'files'
