import express from "express";
import { body, param, ValidationChain } from "express-validator";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addDocumentsToWorkspace,
  removeDocumentFromWorkspace,
} from "../controllers/workspaceController.js";
import protect from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// All routes are protected by JWT auth
router.use(protect);

const workspaceIdValidation: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid workspace id"),
];

const documentIdValidation: ValidationChain[] = [
  param("documentId").isMongoId().withMessage("Invalid document id"),
];

const workspaceBodyValidation: ValidationChain[] = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Workspace title must be between 1 and 120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Workspace color must be a valid hex color"),
  body("documentIds")
    .optional()
    .isArray({ max: 100 })
    .withMessage("Document ids must be an array with at most 100 items"),
  body("documentIds.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid document id"),
];

const workspaceUpdateValidation: ValidationChain[] = [
  ...workspaceIdValidation,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Workspace title must be between 1 and 120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Workspace color must be a valid hex color"),
];

const addDocumentsValidation: ValidationChain[] = [
  ...workspaceIdValidation,
  body("documentIds")
    .isArray({ min: 1, max: 100 })
    .withMessage("Please provide between 1 and 100 document ids"),
  body("documentIds.*")
    .isMongoId()
    .withMessage("Invalid document id"),
];

router.post("/", workspaceBodyValidation, validateRequest, createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", workspaceIdValidation, validateRequest, getWorkspaceById);
router.put("/:id", workspaceUpdateValidation, validateRequest, updateWorkspace);
router.delete("/:id", workspaceIdValidation, validateRequest, deleteWorkspace);
router.post("/:id/documents", addDocumentsValidation, validateRequest, addDocumentsToWorkspace);
router.delete("/:id/documents/:documentId", [...workspaceIdValidation, ...documentIdValidation], validateRequest, removeDocumentFromWorkspace);

export default router;
