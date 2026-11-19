import express from "express";
import { body, param, ValidationChain } from "express-validator";
import { uploadDocument, getDocuments, getDocument, deleteDocument, getUploadSignature } from "../controllers/documentController.js";
import protect from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// All routes are protected
router.use(protect);

const documentIdValidation: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid document id"),
];

const uploadValidation: ValidationChain[] = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Document title must be between 1 and 120 characters"),
  body("cloudinaryUrl")
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Invalid Cloudinary URL. Must be a secure HTTPS URL."),
  body("cloudinaryPublicId")
    .trim()
    .isLength({ min: 5, max: 255 })
    .matches(/^studyflow\/documents\/[a-zA-Z0-9_\-\/\.]+$/)
    .withMessage("Invalid Cloudinary public ID. Must be in studyflow/documents folder."),
  body("fileName")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("File name must be between 1 and 255 characters"),
  body("fileSize")
    .optional()
    .isNumeric()
    .withMessage("File size must be a number"),
  body("workspaceId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid workspace ID format"),
];

router.get("/upload-signature", getUploadSignature);
router.post("/upload", uploadValidation, validateRequest, uploadDocument);
router.get("/", getDocuments);
router.get("/:id", documentIdValidation, validateRequest, getDocument);
router.delete("/:id", documentIdValidation, validateRequest, deleteDocument);

export default router;
