import multer from 'multer';

// Use memory storage — files stay in buffer (no disk writes)
// This is required for Vercel serverless (read-only filesystem)
const storage = multer.memoryStorage();

// File filter — only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Configure multer with 10MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

export default upload;
