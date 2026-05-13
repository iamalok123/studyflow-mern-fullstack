import express from 'express';
import { body, param } from 'express-validator';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// All routes are protected
router.use(protect);

const idValidation = [
  param('id').isMongoId().withMessage('Invalid quiz id'),
];

router.get('/quiz/:id', idValidation, validateRequest, getQuizById);
router.post(
  '/:id/submit',
  [
    ...idValidation,
    body('answers').isArray().withMessage('Please provide answer array'),
    body('answers.*.questionIndex').isInt({ min: 0 }).withMessage('Invalid question index'),
    body('answers.*.selectedAnswer').isString().notEmpty().withMessage('Selected answer is required'),
  ],
  validateRequest,
  submitQuiz
);
router.get('/:id/results', idValidation, validateRequest, getQuizResults);
router.delete('/:id', idValidation, validateRequest, deleteQuiz);
router.get(
  '/:documentId',
  [param('documentId').isMongoId().withMessage('Invalid document id')],
  validateRequest,
  getQuizzes
);

export default router;
