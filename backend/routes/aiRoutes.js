import express from "express";
import { body, param } from "express-validator";
import {
  generateFlashcards,
  generateQuiz,
  generateMindmap,
  getMindmap,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  workspaceChat,
  getWorkspaceChatHistory,
  workspaceGenerateSummary,
  workspaceGenerateMindmap,
  getWorkspaceMindmap,
  workspaceGenerateFlashcards,
  workspaceGenerateQuiz
} from "../controllers/aiController.js";
import protect from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.use(protect);

const documentBodyValidation = [
  body("documentId").isMongoId().withMessage("Invalid document id"),
];

router.post(
  "/generate-flashcards",
  [
    ...documentBodyValidation,
    body("count").optional().isInt({ min: 1, max: 30 }).withMessage("Flashcard count must be between 1 and 30"),
  ],
  validateRequest,
  generateFlashcards
);

router.post(
  "/generate-quiz",
  [
    ...documentBodyValidation,
    body("numQuestions").optional().isInt({ min: 1, max: 20 }).withMessage("Quiz question count must be between 1 and 20"),
    body("title").optional().trim().isLength({ max: 120 }).withMessage("Quiz title cannot exceed 120 characters"),
  ],
  validateRequest,
  generateQuiz
);

router.post("/generate-mindmap", documentBodyValidation, validateRequest, generateMindmap);

router.get(
  "/mindmap/:documentId",
  [param("documentId").isMongoId().withMessage("Invalid document id")],
  validateRequest,
  getMindmap
);

router.post("/generate-summary", documentBodyValidation, validateRequest, generateSummary);

router.post(
  "/chat",
  [
    ...documentBodyValidation,
    body("question").trim().isLength({ min: 1, max: 1000 }).withMessage("Question must be between 1 and 1000 characters"),
  ],
  validateRequest,
  chat
);

router.post(
  "/explain-concept",
  [
    ...documentBodyValidation,
    body("concept").trim().isLength({ min: 1, max: 200 }).withMessage("Concept must be between 1 and 200 characters"),
  ],
  validateRequest,
  explainConcept
);

router.get(
  "/chat-history/:documentId",
  [param("documentId").isMongoId().withMessage("Invalid document id")],
  validateRequest,
  getChatHistory
);

router.post(
  "/workspace-chat",
  [
    body("workspaceId").isMongoId().withMessage("Invalid workspace id"),
    body("question").trim().isLength({ min: 1, max: 1000 }).withMessage("Question must be between 1 and 1000 characters"),
  ],
  validateRequest,
  workspaceChat
);

router.get(
  "/workspace-chat-history/:workspaceId",
  [param("workspaceId").isMongoId().withMessage("Invalid workspace id")],
  validateRequest,
  getWorkspaceChatHistory
);

router.post(
  "/workspace-summary",
  [body("workspaceId").isMongoId().withMessage("Invalid workspace id")],
  validateRequest,
  workspaceGenerateSummary
);

router.post(
  "/workspace-mindmap",
  [body("workspaceId").isMongoId().withMessage("Invalid workspace id")],
  validateRequest,
  workspaceGenerateMindmap
);

router.get(
  "/workspace-mindmap/:workspaceId",
  [param("workspaceId").isMongoId().withMessage("Invalid workspace id")],
  validateRequest,
  getWorkspaceMindmap
);

router.post(
  "/workspace-flashcards",
  [
    body("workspaceId").isMongoId().withMessage("Invalid workspace id"),
    body("count").optional().isInt({ min: 1, max: 30 }).withMessage("Flashcard count must be between 1 and 30"),
  ],
  validateRequest,
  workspaceGenerateFlashcards
);

router.post(
  "/workspace-quiz",
  [
    body("workspaceId").isMongoId().withMessage("Invalid workspace id"),
    body("numQuestions").optional().isInt({ min: 1, max: 20 }).withMessage("Quiz question count must be between 1 and 20"),
    body("title").optional().trim().isLength({ max: 120 }).withMessage("Quiz title cannot exceed 120 characters"),
  ],
  validateRequest,
  workspaceGenerateQuiz
);

export default router;
