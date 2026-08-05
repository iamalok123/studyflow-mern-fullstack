import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Use memory storage — files stay in buffer (no disk writes)
// This is required for Vercel serverless (read-only filesystem)
const storage = multer.memoryStorage();

// File filter — only PDFs
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"));
  }
};

// Configure multer with 10MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "", 10) || 10485760, // 10MB default
  },
});

export default upload;
