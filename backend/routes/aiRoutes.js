import express from "express";
import { body, param } from "express-validator";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory
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

export default router;
