import express from "express";
import { body, param } from "express-validator";
import { uploadDocument, getDocuments, getDocument, deleteDocument } from "../controllers/documentController.js";
import protect from "../middlewares/auth.js";
import upload from "../config/multer.js"
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// All routes are protected
router.use(protect);

const documentIdValidation = [
    param("id").isMongoId().withMessage("Invalid document id"),
];

const uploadValidation = [
    body("title")
        .trim()
        .isLength({ min: 1, max: 120 })
        .withMessage("Document title must be between 1 and 120 characters"),
];

router.post("/upload", upload.single("file"), uploadValidation, validateRequest, uploadDocument);
router.get("/", getDocuments);
router.get("/:id", documentIdValidation, validateRequest, getDocument);
router.delete("/:id", documentIdValidation, validateRequest, deleteDocument);

export default router;
